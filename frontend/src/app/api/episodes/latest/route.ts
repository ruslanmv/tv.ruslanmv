import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

// Sample episode data as fallback when R2 is not accessible
const SAMPLE_EPISODE = {
  date: new Date().toISOString().split('T')[0],
  title: "Building RAG Applications with IBM watsonx.ai",
  description: "Join us for a deep dive into Retrieval-Augmented Generation. Learn secure, scalable AI agent patterns, vector search, prompt engineering, and deployment strategies.",
  video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  thumbnail_url: "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
  duration: 1200,
  sections: [
    {
      title: "Introduction to RAG",
      timestamp: 0,
      description: "Overview of Retrieval-Augmented Generation and its applications"
    },
    {
      title: "Setting up watsonx.ai",
      timestamp: 300,
      description: "Configuring your IBM watsonx.ai environment"
    },
    {
      title: "Building the Agent",
      timestamp: 600,
      description: "Implementing a RAG agent with vector search"
    }
  ]
};

function baseUrl() {
  const b = process.env.R2_PUBLIC_URL || "https://videos.ruslanmv.com";
  return b.replace(/\/+$/, "");
}

export async function GET() {
  const url = `${baseUrl()}/episodes/latest.json`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 30 },
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data, {
        headers: { "Cache-Control": "s-maxage=30, stale-while-revalidate=120" }
      });
    }
  } catch (error) {
    console.warn("R2 not accessible, using sample data:", error);
  }

  // Return sample data if R2 is not accessible
  return NextResponse.json(SAMPLE_EPISODE, {
    headers: {
      "Cache-Control": "s-maxage=30, stale-while-revalidate=120",
      "X-Data-Source": "sample"
    }
  });
}
