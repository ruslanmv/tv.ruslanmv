import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

function baseUrl() {
  const b = process.env.R2_PUBLIC_URL || "https://videos.ruslanmv.com";
  return b.replace(/\/+$/, "");
}

export async function GET() {
  const url = `${baseUrl()}/episodes/index.json`;

  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to fetch episode index from R2", status: res.status },
      { status: 502 }
    );
  }

  const data = await res.json();
  return NextResponse.json(data, {
    headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" }
  });
}
