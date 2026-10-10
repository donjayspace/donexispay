import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  // This endpoint reports application process health only, not database or provider readiness.
  return NextResponse.json(
    { status: "ok", service: "donexispay" },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
