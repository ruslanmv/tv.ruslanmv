import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

// Sample episode index as fallback when R2 is not accessible
const SAMPLE_INDEX = {
  episodes: [
    {
      date: new Date().toISOString().split('T')[0],
      title: "Building RAG Applications with IBM watsonx.ai",
      description: "Deep dive into Retrieval-Augmented Generation with watsonx.ai",
      thumbnail_url: "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      duration: 1200
    },
    {
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      title: "Multi-Agent Systems with CrewAI",
      description: "Building collaborative AI agents for complex workflows",
      thumbnail_url: "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      duration: 1500
    },
    {
      date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
      title: "LangChain and Vector Databases",
      description: "Implementing semantic search with LangChain and Pinecone",
      thumbnail_url: "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      duration: 1800
    }
  ],
  total: 3,
  last_updated: new Date().toISOString()
};

function baseUrl() {
  const b = process.env.R2_PUBLIC_URL || "https://videos.ruslanmv.com";
  return b.replace(/\/+$/, "");
}

export async function GET() {
  const url = `${baseUrl()}/episodes/index.json`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data, {
        headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" }
      });
    }
  } catch (error) {
    console.warn("R2 not accessible, using sample data:", error);
  }

  // Return sample data if R2 is not accessible
  return NextResponse.json(SAMPLE_INDEX, {
    headers: {
      "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
      "X-Data-Source": "sample"
    }
  });
}
