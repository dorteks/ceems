import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import {
  deleteCustomer,
  getCustomerById,
  updateCustomer,
} from "../../../../server/services/customerService";
import { getSessionUser } from "../../../../server/services/userService";
import { recordAuditEvent } from "../../../../server/services/auditService";

const SESSION_COOKIE = "ceems_session";

async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = Number(cookieStore.get(SESSION_COOKIE)?.value);
  if (!Number.isInteger(userId)) return null;
  return getSessionUser(userId);
}

function parseCustomerId(value: string) {
  const id = Number(value);
  return Number.isInteger(id) ? id : null;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await params;
  const id = parseCustomerId(rawId);

  if (id == null) {
    return NextResponse.json({ error: "Invalid customer id" }, { status: 400 });
  }

  const customer = await getCustomerById(id);

  if (!customer) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  return NextResponse.json(customer, { status: 200 });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    const { id: rawId } = await params;
    const id = parseCustomerId(rawId);

    if (id == null) {
      return NextResponse.json(
        { error: "Invalid customer id" },
        { status: 400 },
      );
    }

    const body = (await req.json()) as Record<string, unknown>;

    if (!body.account_number || !body.surname || !body.first_name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const before = await getCustomerById(id);
    const updated = await updateCustomer(id, body);

    if (before) {
      await recordAuditEvent({
        actorName: currentUser.name,
        actorUsername: currentUser.username,
        actorRole: currentUser.role,
        action: "Updated customer",
        entityType: "customer",
        entityId: id,
        entityLabel: updated.account_number,
        beforeValue: `${before.status ?? "Unclassified"} / ${before.meter_number ?? "No meter"} / ${before.business_hub ?? "Unknown hub"}`,
        afterValue: `${updated.status ?? "Unclassified"} / ${updated.meter_number ?? "No meter"} / ${updated.business_hub ?? "Unknown hub"}`,
        metadata: {
          account_number: updated.account_number,
          hub: updated.business_hub,
          service_center: updated.service_center,
        },
      });
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update customer",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    const { id: rawId } = await params;
    const id = parseCustomerId(rawId);

    if (id == null) {
      return NextResponse.json(
        { error: "Invalid customer id" },
        { status: 400 },
      );
    }

    const before = await getCustomerById(id);
    await deleteCustomer(id);

    if (before) {
      await recordAuditEvent({
        actorName: currentUser.name,
        actorUsername: currentUser.username,
        actorRole: currentUser.role,
        action: "Deleted customer",
        entityType: "customer",
        entityId: id,
        entityLabel: before.account_number,
        beforeValue: `${before.status ?? "Unclassified"} / ${before.meter_number ?? "No meter"} / ${before.business_hub ?? "Unknown hub"}`,
        afterValue: "Deleted",
        metadata: {
          account_number: before.account_number,
        },
      });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete customer",
      },
      { status: 500 },
    );
  }
}
