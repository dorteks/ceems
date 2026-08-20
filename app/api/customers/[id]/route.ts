import { NextResponse } from "next/server";

import {
  deleteCustomer,
  getCustomerById,
  updateCustomer,
} from "../../../../server/services/customerService";

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

    const updated = await updateCustomer(id, body);
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
    const { id: rawId } = await params;
    const id = parseCustomerId(rawId);

    if (id == null) {
      return NextResponse.json(
        { error: "Invalid customer id" },
        { status: 400 },
      );
    }

    await deleteCustomer(id);
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
