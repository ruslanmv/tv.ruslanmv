import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

function baseUrl() {
  const b = process.env.R2_PUBLIC_URL || "https://videos.ruslanmv.com";
  return b.replace(/\/+$/, "");
}

function isValidDate(s: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

export async function GET(
  _req: Request,
  { params }: { params: { date: string } }
) {
  const date = params.date;

  if (!isValidDate(date)) {
    return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
  }

  const url = `${baseUrl()}/episodes/${date}/episode.json`;

  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) {
    return NextResponse.json(
      { error: "Episode not found in R2", status: res.status },
      { status: 404 }
    );
  }

  const data = await res.json();
  return NextResponse.json(data, {
    headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=600" }
  });
}
