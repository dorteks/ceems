import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  listCustomers,
  createCustomer,
  deleteAllCustomers,
} from "../../../server/services/customerService";
import { getSessionUser } from "../../../server/services/userService";
import { recordAuditEvent } from "../../../server/services/auditService";

const SESSION_COOKIE = "ceems_session";

async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = Number(cookieStore.get(SESSION_COOKIE)?.value);
  if (!Number.isInteger(userId)) return null;
  return getSessionUser(userId);
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const size = parseInt(url.searchParams.get("size") || "50", 10);

    const result = await listCustomers({ page, size });

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    const body = (await req.json()) as Record<string, unknown>;

    if (!body.account_number || !body.surname || !body.first_name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const created = await createCustomer(
      {
      account_number: body.account_number,
      meter_number: body.meter_number,
      surname: body.surname,
      first_name: body.first_name,
      other_name: body.other_name ?? null,
      customer_type: body.customer_type ?? undefined,

      meter_type: body.meter_type ?? undefined,
      meter_phase: body.meter_phase ?? undefined,
      customer_category: body.customer_category ?? undefined,
      nin: body.nin ?? null,
      premise_type: body.premise_type ?? undefined,

      address: body.address ?? null,
      city: body.city ?? null,
      state: body.state ?? null,
      lga: body.lga ?? null,
      service_center: body.service_center ?? undefined,
      service_code: body.service_code ?? undefined,
      tariff: body.tariff ?? undefined,
      longitude: body.longitude ?? null,
      latitude: body.latitude ?? null,

      email: body.email ?? null,
      phone: body.phone ?? null,
      nature_of_business: body.nature_of_business ?? null,

      dss_id: body.dss_id ?? null,
      dss_name: body.dss_name ?? null,
      feeder_id: body.feeder_id ?? null,
      feeder_name: body.feeder_name ?? null,
      feeder_band: body.feeder_band ?? null,
      status: body.status ?? null,
      business_hub: body.business_hub ?? null,
      region: body.region ?? null,

      enumerator_name: body.enumerator_name ?? null,
      enumerator_id: body.enumerator_id ?? null,
      enumerator_phone_number: body.enumerator_phone_number ?? null,
      remark: body.remark ?? null,
      },
      currentUser.name,
    );

    await recordAuditEvent({
      actorName: currentUser.name,
      actorUsername: currentUser.username,
      actorRole: currentUser.role,
      action: "Created customer",
      entityType: "customer",
      entityId: created.id,
      entityLabel: created.account_number,
      beforeValue: "—",
      afterValue: `${created.surname} ${created.first_name} · ${created.status ?? "Unclassified"}`,
      metadata: {
        hub: created.business_hub,
        service_center: created.service_center,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: unknown) {
    console.error(error);

    const message =
      error instanceof Error ? error.message : "Failed to create customer";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    const result = await deleteAllCustomers();

    await recordAuditEvent({
      actorName: currentUser.name,
      actorUsername: currentUser.username,
      actorRole: currentUser.role,
      action: "Deleted all customers",
      entityType: "customer",
      entityId: "all",
      entityLabel: "All customers",
      beforeValue: `${result.deleted} customers`,
      afterValue: "0 customers",
      metadata: {
        deletedCount: result.deleted,
      },
    });

    return NextResponse.json(
      {
        success: true,
        deleted: result.deleted,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("Failed to delete all customers:", error);

    return NextResponse.json(
      { error: "Failed to delete all customers" },
      { status: 500 },
    );
  }
}
