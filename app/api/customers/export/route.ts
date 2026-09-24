import { NextResponse } from "next/server";
import { exportCustomers, InvalidServiceCenterError } from "../../../../server/services/customerService";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const serviceCenter = url.searchParams.get("serviceCenter") || undefined;

    const items = await exportCustomers({ serviceCenter });

    return NextResponse.json({ items }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof InvalidServiceCenterError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error("Customer export failed", JSON.stringify({
      code: error instanceof Error && "code" in error ? error.code : undefined,
      meta: error instanceof Error && "meta" in error ? error.meta : undefined,
    }));
    return NextResponse.json(
      { error: "Failed to export customers" },
      { status: 500 },
    );
  }
}
