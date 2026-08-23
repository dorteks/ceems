import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import {
  deleteCustomer,
  getCustomerById,
  updateCustomer,
} from "../../../../server/services/customerService";
import { prisma } from "../../../../server/db/prisma";
import { getSessionUser } from "../../../../server/services/userService";
import { recordAuditEvent } from "../../../../server/services/auditService";
import { recordAuditEventWithClient } from "../../../../server/services/auditService";
import { recordCustomerEnumeration } from "../../../../server/services/enumerationService";

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

    const updated = await prisma.$transaction(async (tx) => {
      const before = await tx.customer.findUnique({
        where: { id },
      });

      if (!before) {
        return null;
      }

      const next = await updateCustomer(id, body, currentUser.name, tx);

      await recordCustomerEnumeration(tx, {
        customerId: id,
        userId: currentUser.id,
        userName: currentUser.name,
        serviceCenter: next.service_center ?? before.service_center,
        beforeData: before,
        afterData: next,
        enumeratedAt: next.updated_at,
      });

      await recordAuditEventWithClient(tx, {
        actorName: currentUser.name,
        actorUsername: currentUser.username,
        actorRole: currentUser.role,
        action: "Updated customer",
        entityType: "customer",
        entityId: id,
        entityLabel: next.account_number,
        beforeValue: `${before.status ?? "Unclassified"} / ${before.meter_number ?? "No meter"} / ${before.business_hub ?? "Unknown hub"}`,
        afterValue: `${next.status ?? "Unclassified"} / ${next.meter_number ?? "No meter"} / ${next.business_hub ?? "Unknown hub"}`,
        metadata: {
          account_number: next.account_number,
          hub: next.business_hub,
          service_center: next.service_center,
          updated_by: currentUser.name,
        },
      });

      return next;
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error: unknown) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update customer",
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

    if (!before) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 },
      );
    }

    await deleteCustomer(id);

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

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error: unknown) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete customer",
      },
      { status: 500 },
    );
  }
}
