import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

function baseUrl() {
  const b = process.env.R2_PUBLIC_URL || "https://videos.ruslanmv.com";
  return b.replace(/\/+$/, "");
}

export async function GET() {
  const url = `${baseUrl()}/episodes/latest.json`;

  const res = await fetch(url, { next: { revalidate: 30 } });
  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to fetch latest episode from R2", status: res.status },
      { status: 502 }
    );
  }

  const data = await res.json();
  return NextResponse.json(data, {
    headers: { "Cache-Control": "s-maxage=30, stale-while-revalidate=120" }
  });
}
