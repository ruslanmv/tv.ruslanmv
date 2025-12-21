"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchTodayEpisode, fetchEpisodeIndex } from "@/lib/api";
import type { Episode, Section, EpisodeIndex } from "@/lib/types";
import TVPlayer from "@/components/TVPlayer";
import {
  FaBars,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaCommentAlt,
  FaArrowRight
} from "react-icons/fa";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

export default function Home() {
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState<Section | null>(null);
  const [episodeIndex, setEpisodeIndex] = useState<EpisodeIndex | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [latestEp, index] = await Promise.all([
        fetchTodayEpisode(),
        fetchEpisodeIndex()
      ]);
      setEpisode(latestEp);
      setEpisodeIndex(index);
      setLoading(false);
    })();
  }, []);

  // ✅ useMemo MUST run on every render (before any early returns)
  // Recent items are derived from the episode index (fallback to empty list)
  const recentEpisodes = useMemo(() => {
    const list = episodeIndex?.episodes ?? [];
    if (list.length === 0) return [];

    // Prefer newest first when possible
    const sorted = list
      .slice()
      .sort((a, b) => {
        const da = Date.parse(a.published_at || a.created_at || a.date || "") || 0;
        const db = Date.parse(b.published_at || b.created_at || b.date || "") || 0;
        return db - da;
      });

    // Hide the current hero episode if it has the same YouTube id or same date
    const currentYoutubeId = episode?.youtube_id;
    const currentDate = episode?.date;

    return sorted
      .filter((ep) => {
        if (!currentYoutubeId && !currentDate) return true;
        if (currentYoutubeId && ep.youtube_id && ep.youtube_id === currentYoutubeId) return false;
        if (currentDate && ep.date && ep.date === currentDate) return false;
        return true;
      })
      .slice(0, 9);
  }, [episodeIndex, episode?.youtube_id, episode?.date]);

  if (loading) {
    return (
      <main className="flex-grow flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl mb-3">📺</div>
          <p className="text-muted">Loading…</p>
        </div>
      </main>
    );
  }

  const heroTitle = episode?.title ?? "Building RAG Applications with IBM watsonx.ai";
  const heroDescription =
    episode?.description ??
    "Join us for a deep dive into Retrieval-Augmented Generation. Learn secure, scalable AI agent patterns, vector search, prompt engineering, and deployment strategies.";

  return (
    <>
      {/* Sticky top area (ticker + header). Keeps layout stable and fixes the "jump" on scroll. */}
      <div className="sticky top-0 z-50">
        {/* Utility Bar / Ticker */}
        <div className="bg-text text-white text-sm border-b border-gray-800 overflow-hidden">
          <div className="container mx-auto flex items-center px-4 py-2">
            <span className="bg-accent px-3 py-0.5 text-[11px] font-bold uppercase mr-4 rounded-sm tracking-wide shrink-0 leading-none">
              Latest
            </span>
            <div className="flex-1 overflow-hidden relative h-6">
              <div className="absolute whitespace-nowrap animate-marquee flex items-center h-full will-change-transform">
                <span className="mx-8">
                  <strong>New Tutorial:</strong> Building Multi-Agent Systems with Universal A2A Agent
                </span>
                <span className="mx-8">
                  <strong>Update:</strong> Watsonx.ai Agent to MCP Gateway released
                </span>
                <span className="mx-8">
                  <strong>Conference:</strong> Live coverage of IBM TechXchange starting soon
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-soft">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <a href="/" className="flex items-center space-x-3 group">
                <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden shadow-sm border border-gray-100">
                  <img
                    src="https://ui-avatars.com/api/?name=RM&background=268bd2&color=fff&font-size=0.5"
                    alt="RuslanMV"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="leading-tight">
                  <h1 className="text-xl font-bold tracking-tight group-hover:text-accent transition-colors">
                    TV.RuslanMV
                  </h1>
                  <p className="text-xs text-muted">Artificial Intelligence &amp; Cloud Broadcasting</p>
                </div>
              </a>

              <nav className="hidden lg:flex items-center space-x-8 text-sm font-semibold text-muted">
                {["Home", "Live Stream", "Tutorials", "Talks", "About"].map((item, idx) => (
                  <a
                    key={item}
                    href="#"
                    className={`${idx === 1 ? "text-accent" : "hover:text-accent"} transition-colors`}
                    onClick={(e) => e.preventDefault()}
                  >
                    {item}
                  </a>
                ))}
              </nav>

              <div className="flex items-center space-x-4">
                <button
                  onClick={() => window.scrollTo({ top: 200, behavior: "smooth" })}
                  className="bg-accent hover:bg-accentHover text-white px-5 py-2 rounded text-sm font-medium transition-colors shadow-sm flex items-center"
                >
                  Watch Live
                </button>
                <button
                  className="lg:hidden text-text p-2 hover:bg-lightGray rounded transition-colors"
                  aria-label="Open menu"
                >
                  <FaBars className="text-xl" />
                </button>
              </div>
            </div>
          </div>
        </header>
      </div>

      <main className="flex-grow">
        {/* Hero / Player */}
        <section className="bg-lightGray py-10 border-b border-gray-200">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <TVPlayer episode={episode} onSectionChange={setCurrentSection} />

                <div className="mt-6 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <h2 className="text-2xl md:text-3xl font-bold text-text mb-2">{heroTitle}</h2>

                  <div className="flex flex-wrap items-center text-sm text-muted gap-4 mb-4">
                    <span className="flex items-center gap-2">
                      <FaClock /> Started 15 mins ago
                    </span>
                    <span className="flex items-center gap-2 text-accent">
                      <FaCheckCircle /> Verified Broadcast
                    </span>
                    <span className="px-2 py-0.5 bg-blue-50 text-accent rounded-full text-xs font-bold uppercase tracking-wide border border-blue-100">
                      Machine Learning
                    </span>

                    {episode?.published_at && (
                      <span className="flex items-center gap-2">
                        <FaCalendarAlt /> {formatDate(episode.published_at)}
                      </span>
                    )}

                    {currentSection?.title && <span className="text-accent">• {currentSection.title}</span>}
                  </div>

                  <hr className="border-gray-100 my-4" />

                  <p className="text-gray-600 leading-relaxed max-w-4xl">{heroDescription}</p>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg border border-gray-200 p-0 shadow-card h-full flex flex-col">
                  <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-lg flex justify-between items-center">
                    <h3 className="font-bold text-lg text-text">Schedule</h3>
                    <span className="text-xs font-semibold text-muted uppercase">Today</span>
                  </div>

                  <div className="divide-y divide-gray-100 overflow-y-auto flex-1 max-h-[400px] lg:max-h-none">
                    <div className="flex items-start space-x-3 p-4 bg-blue-50/50 border-l-4 border-accent">
                      <div className="text-accent font-bold text-sm min-w-[50px]">NOW</div>
                      <div>
                        <h4 className="font-semibold text-sm text-text">RAG Applications with watsonx.ai</h4>
                        <p className="text-xs text-muted mt-1">Ruslan Magana V.</p>
                      </div>
                      <div className="ml-auto text-accent animate-pulse">●</div>
                    </div>

                    {[
                      { time: "14:00", title: "Universal A2A Agent Tutorial", sub: "Zero-to-Hero Guide" },
                      { time: "15:30", title: "Cloud Architecture Patterns", sub: "Architecture Review" },
                      { time: "17:00", title: "Q&A Session", sub: "Live Coding & Debugging" }
                    ].map((item) => (
                      <div
                        key={item.time}
                        className="flex items-start space-x-3 p-4 hover:bg-gray-50 transition-colors cursor-pointer group"
                      >
                        <div className="text-muted font-medium text-sm min-w-[50px] group-hover:text-text">
                          {item.time}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-text group-hover:text-accent transition-colors">
                            {item.title}
                          </h4>
                          <p className="text-xs text-muted mt-1">{item.sub}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-lg mt-auto">
                    <h4 className="font-bold text-xs uppercase tracking-wide text-muted mb-3 flex items-center gap-2">
                      <FaCommentAlt /> Live Chat (Read Only)
                    </h4>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-start space-x-2">
                        <div className="w-6 h-6 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 text-xs font-bold">
                          DS
                        </div>
                        <p className="text-xs text-gray-600">
                          <span className="font-bold text-text">@dev_sarah:</span> Which vector DB supports this natively?
                        </p>
                      </div>

                      <div className="flex items-start space-x-2">
                        <div className="w-6 h-6 rounded-full bg-green-200 flex items-center justify-center text-green-700 text-xs font-bold">
                          MA
                        </div>
                        <p className="text-xs text-gray-600">
                          <span className="font-bold text-text">@mike_ai:</span> Is the code on GitHub?
                        </p>
                      </div>

                      <div className="flex items-start space-x-2">
                        <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold">
                          RM
                        </div>
                        <p className="text-xs text-gray-600 bg-blue-50 p-1.5 rounded rounded-tl-none border border-blue-100">
                          <span className="font-bold text-accent">@ruslanmv:</span> Yes, link in description! We use ChromaDB here.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* End Sidebar */}
            </div>
          </div>
        </section>

        {/* Recent Broadcasts (real data from episode index) */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
              <h3 className="text-2xl font-bold text-text">Recent Broadcasts</h3>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="text-accent font-medium hover:text-accentHover hover:underline text-sm flex items-center"
              >
                View Archive <FaArrowRight className="ml-2 text-xs" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentEpisodes.map((ep) => (
                <article
                  key={ep.date || ep.id || ep.youtube_id || ep.title}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-card hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 relative group cursor-pointer">
                    {(ep.youtube_url || ep.video_url) && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-lg">
                          <span className="text-accent ml-1">▶</span>
                        </div>
                      </div>
                    )}
                    <span className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                      {ep.date || formatDate(ep.published_at || ep.created_at || "")}
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-accent uppercase tracking-wide">Episode</span>
                      <span className="text-xs text-gray-500">
                        <FaCalendarAlt className="inline mr-1" /> {ep.date || formatDate(ep.published_at || ep.created_at || "")}
                      </span>
                    </div>

                    <h4 className="font-bold text-lg mb-2 leading-tight text-text hover:text-accent transition-colors cursor-pointer">
                      {ep.title}
                    </h4>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{ep.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-t border-gray-200 py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-gray-200">
              {[
                { value: "99.9%", label: "Uptime" },
                { value: "350+", label: "Tutorials" },
                { value: "5M+", label: "Views" },
                { value: "24/7", label: "Availability" }
              ].map((s) => (
                <div key={s.label} className="p-4">
                  <div className="text-3xl font-bold text-text mb-1">{s.value}</div>
                  <p className="text-xs text-muted uppercase tracking-wide font-semibold">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 text-sm text-muted">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0 text-center md:text-left">
              <p className="font-bold text-text text-base mb-1">Ruslan Magana Vsevolodovna</p>
              <p className="text-xs text-gray-500">
                &copy; 2025 Ruslan Magana Vsevolodovna. Powered by Jekyll &amp; Minimal Mistakes.
              </p>
            </div>

            <div className="flex space-x-6">
              <a href="#" onClick={(e) => e.preventDefault()} className="text-gray-400 hover:text-accent transition-colors">
                Twitter
              </a>
              <a href="#" onClick={(e) => e.preventDefault()} className="text-gray-400 hover:text-black transition-colors">
                GitHub
              </a>
              <a href="#" onClick={(e) => e.preventDefault()} className="text-gray-400 hover:text-orange-500 transition-colors">
                RSS
              </a>
              <a href="#" onClick={(e) => e.preventDefault()} className="text-gray-400 hover:text-blue-700 transition-colors">
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
