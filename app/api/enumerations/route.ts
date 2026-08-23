import { NextResponse } from "next/server";

import { ServiceCenter, type ServiceCenterValue } from "@/lib/prisma-enums";
import { listEnumerations } from "../../../server/services/enumerationService";

function parseDay(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getMonthRange(value: string) {
  const match = /^(\d{4})-(\d{2})$/.exec(value);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);

  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return null;
  }

  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

  return { start, end };
}

function parseServiceCenter(value: string | null) {
  if (!value) {
    return null;
  }

  return Object.values(ServiceCenter).includes(value as ServiceCenterValue)
    ? (value as ServiceCenterValue)
    : null;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const customerIdRaw = url.searchParams.get("customerId");
    const serviceCenter = url.searchParams.get("serviceCenter");
    const day = url.searchParams.get("day");
    const month = url.searchParams.get("month");
    const fromRaw = url.searchParams.get("from");
    const toRaw = url.searchParams.get("to");
    const limit = Number(url.searchParams.get("limit") || "100");
    const offset = Number(url.searchParams.get("offset") || "0");

    const customerId = customerIdRaw ? Number(customerIdRaw) : undefined;

    if (customerIdRaw && !Number.isInteger(customerId)) {
      return NextResponse.json({ error: "Invalid customerId" }, { status: 400 });
    }

    const serviceCenterValue = parseServiceCenter(serviceCenter);

    if (serviceCenter && !serviceCenterValue) {
      return NextResponse.json(
        { error: "Invalid serviceCenter" },
        { status: 400 },
      );
    }

    let from: Date | undefined;
    let to: Date | undefined;

    if (day) {
      const start = parseDay(day);

      if (!start) {
        return NextResponse.json({ error: "Invalid day" }, { status: 400 });
      }

      from = start;
      to = new Date(start);
      to.setUTCDate(to.getUTCDate() + 1);
      to.setUTCMilliseconds(to.getUTCMilliseconds() - 1);
    } else if (month) {
      const range = getMonthRange(month);

      if (!range) {
        return NextResponse.json({ error: "Invalid month" }, { status: 400 });
      }

      from = range.start;
      to = range.end;
    } else if (fromRaw || toRaw) {
      from = fromRaw ? new Date(fromRaw) : undefined;
      to = toRaw ? new Date(toRaw) : undefined;

      if ((fromRaw && Number.isNaN(from?.getTime())) || (toRaw && Number.isNaN(to?.getTime()))) {
        return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
      }
    }

    const items = await listEnumerations({
      customerId,
      serviceCenter: serviceCenterValue ?? undefined,
      from,
      to,
      limit: Number.isFinite(limit) && limit > 0 ? Math.min(limit, 500) : 100,
      offset: Number.isFinite(offset) && offset > 0 ? offset : 0,
    });

    return NextResponse.json({ items }, { status: 200 });
  } catch (error: unknown) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch enumerations" },
      { status: 500 },
    );
  }
}
