import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

// Sample episode data generator
function generateSampleEpisode(date: string) {
  return {
    date,
    title: `AI Development Tutorial - ${date}`,
    description: "Learn about cutting-edge AI technologies and best practices for building intelligent applications.",
    video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnail_url: "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    duration: 1200,
    sections: [
      {
        title: "Introduction",
        timestamp: 0,
        description: "Overview of today's topics"
      },
      {
        title: "Main Content",
        timestamp: 300,
        description: "Deep dive into the subject matter"
      },
      {
        title: "Conclusion",
        timestamp: 900,
        description: "Summary and next steps"
      }
    ]
  };
}

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

  try {
    const res = await fetch(url, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data, {
        headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=600" }
      });
    }
  } catch (error) {
    console.warn(`R2 not accessible for date ${date}, using sample data:`, error);
  }

  // Return sample data if R2 is not accessible
  return NextResponse.json(generateSampleEpisode(date), {
    headers: {
      "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
      "X-Data-Source": "sample"
    }
  });
}
