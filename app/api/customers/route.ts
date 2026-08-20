import { NextResponse } from "next/server";
import {
  listCustomers,
  createCustomer,
} from "../../../server/services/customerService";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const size = parseInt(url.searchParams.get("size") || "50", 10);

    const result = await listCustomers({ page, size });
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Basic validation
    if (!body.account_number || !body.surname || !body.first_name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const created = await createCustomer({
      // account and meter
      account_number: body.account_number,
      meter_number: body.meter_number,
      surname: body.surname,
      first_name: body.first_name,
      other_name: body.other_name ?? null,
      customer_type: body.customer_type ?? undefined,

      // meter and category
      meter_type: body.meter_type ?? undefined,
      meter_phase: body.meter_phase ?? undefined,
      customer_category: body.customer_category ?? undefined,
      nin: body.nin ?? null,
      premise_type: body.premise_type ?? undefined,

      // location
      address: body.address ?? null,
      city: body.city ?? null,
      state: body.state ?? null,
      lga: body.lga ?? null,
      service_center: body.service_center ?? undefined,
      service_code: body.service_code ?? undefined,
      tariff: body.tariff ?? undefined,
      longitude: body.longitude ?? null,
      latitude: body.latitude ?? null,

      // contact
      email: body.email ?? null,
      phone: body.phone ?? null,
      nature_of_business: body.nature_of_business ?? null,

      // feeder & grid
      dss_id: body.dss_id ?? null,
      dss_name: body.dss_name ?? null,
      feeder_id: body.feeder_id ?? null,
      feeder_name: body.feeder_name ?? null,
      feeder_band: body.feeder_band ?? null,
      status: body.status ?? null,
      business_hub: body.business_hub ?? null,
      region: body.region ?? null,

      // enumerator
      enumerator_name: body.enumerator_name ?? null,
      enumerator_id: body.enumerator_id ?? null,
      enumerator_phone_number: body.enumerator_phone_number ?? null,
      remark: body.remark ?? null,

      // date
      created_at: body.created_at ?? null,
      updated_at: body.updated_at ?? null,
      created_by: body.created_by ?? null,
      updated_by: body.updated_by ?? null,
    } as any);

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error(err);
    const message = err?.message || "Failed to create customer";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
