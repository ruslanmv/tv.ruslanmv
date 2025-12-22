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
  FaArrowRight,
  FaLock
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
  const [showLatest, setShowLatest] = useState(true);

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
      {/* Sticky top area (notification + header). Clean, professional design without scrolling distractions. */}
      <div className="sticky top-0 z-50">
        {/* Clean Top Notification (Replaces Scrolling Ticker) */}
        {showLatest && (
          <div className="bg-text text-white text-xs py-2 border-b border-gray-800">
            <div className="container mx-auto px-4 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowLatest(false)}
                  className="bg-accent px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider hover:bg-accentHover transition-colors cursor-pointer"
                  title="Click to hide"
                >
                  New
                </button>
                <span className="font-medium text-gray-300">Tutorial: Building Multi-Agent Systems with Universal A2A Agent</span>
              </div>
              <div className="hidden md:flex items-center space-x-4 text-gray-400">
                <a href="https://ruslanmv.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Documentation</a>
                <a href="https://github.com/ruslanmv" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub Repo</a>
                <a href="https://ruslanmv.com/about" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Support</a>
              </div>
            </div>
          </div>
        )}

        {/* Minimalist Header */}
        <header className="bg-white border-b border-border sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            {/* Brand */}
            <a href="/" className="flex items-center space-x-3 group">
              <div className="w-8 h-8 bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                <img
                  src="https://ui-avatars.com/api/?name=RM&background=268bd2&color=fff&font-size=0.5"
                  alt="RuslanMV"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-none group-hover:text-accent transition-colors">TV.RuslanMV</span>
                <span className="text-[10px] font-medium text-muted uppercase tracking-wide mt-0.5">Technical Broadcasting</span>
              </div>
            </a>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-muted">
              <a href="/" className="text-text hover:text-accent transition-colors">Live</a>
              <a href="/archive" className="hover:text-accent transition-colors">Archive</a>
              <a href="/series" className="hover:text-accent transition-colors">Series</a>
              <a href="https://ruslanmv.com/" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">About</a>
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex relative">
                <input
                  type="text"
                  placeholder="Search topics..."
                  className="bg-lightGray text-sm border-none rounded-full px-4 py-1.5 w-48 focus:ring-1 focus:ring-accent text-text placeholder-muted"
                />
                <i className="absolute right-3 top-2 text-muted text-xs">🔍</i>
              </div>
              <a
                href="/admin"
                className="hidden md:flex items-center bg-accent hover:bg-accentHover text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
              >
                Admin
              </a>
              <button
                className="md:hidden p-2 text-text"
                aria-label="Open menu"
              >
                <FaBars />
              </button>
            </div>
          </div>
        </header>
      </div>

      <main className="flex-grow">
        {/* Hero / Player */}
        <section className="bg-lightGray border-b border-border">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 xl:col-span-9">
                <TVPlayer episode={episode} onSectionChange={setCurrentSection} />

                {/* Video Info */}
                <div className="mt-6">
                  <h1 className="text-2xl font-bold text-text mb-2">{heroTitle}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
                    <div className="flex items-center">
                      <img
                        src="https://ui-avatars.com/api/?name=RM&background=268bd2&color=fff&font-size=0.5"
                        className="w-6 h-6 rounded-full mr-2"
                        alt="Host"
                      />
                      <span className="font-medium text-text">Ruslan Magana V.</span>
                    </div>
                    <span className="text-gray-300">|</span>
                    <span className="bg-blue-50 text-accent px-2 py-0.5 rounded text-xs font-medium">Machine Learning</span>
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-medium">Python</span>
                  </div>
                  <p className="mt-4 text-muted text-sm leading-relaxed max-w-4xl">
                    {heroDescription}
                  </p>
                </div>
              </div>

              {/* Sidebar: Live Chat / Up Next */}
              <div className="lg:col-span-4 xl:col-span-3 flex flex-col h-full lg:h-auto">
                <div className="bg-white rounded-xl border border-border shadow-sm flex flex-col h-[500px] lg:h-full overflow-hidden">
                  {/* Tabs */}
                  <div className="flex border-b border-border bg-gray-50">
                    <button className="flex-1 py-3 text-xs font-bold uppercase tracking-wide text-accent border-b-2 border-accent bg-white">
                      Live Chat
                    </button>
                    <button className="flex-1 py-3 text-xs font-bold uppercase tracking-wide text-muted hover:text-text hover:bg-white transition-colors">
                      Schedule
                    </button>
                  </div>

                  {/* Chat Area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-white">
                    <div className="flex items-start space-x-2 text-sm group">
                      <span className="font-bold text-xs text-purple-600 min-w-[60px]">dev_sarah</span>
                      <span className="text-gray-600 text-xs">Which vector DB are we using today? Chroma?</span>
                    </div>
                    <div className="flex items-start space-x-2 text-sm group">
                      <span className="font-bold text-xs text-green-600 min-w-[60px]">mike_ai</span>
                      <span className="text-gray-600 text-xs">Is the repo link pinned?</span>
                    </div>
                    <div className="flex items-start space-x-2 text-sm group">
                      <span className="font-bold text-xs text-accent min-w-[60px]">@ruslanmv</span>
                      <span className="text-gray-800 text-xs bg-blue-50 px-2 py-1 rounded inline-block">
                        Yes! Check the description for the GitHub link. We are using ChromaDB.
                      </span>
                    </div>
                    <div className="flex items-start space-x-2 text-sm group">
                      <span className="font-bold text-xs text-orange-600 min-w-[60px]">cloud_arch</span>
                      <span className="text-gray-600 text-xs">Great explanation of the architecture!</span>
                    </div>
                  </div>

                  {/* Input Area (Read Only for Demo) */}
                  <div className="p-3 bg-gray-50 border-t border-border">
                    <div className="relative">
                      <input
                        type="text"
                        disabled
                        placeholder="Sign in to chat..."
                        className="w-full bg-white border border-border rounded px-3 py-2 text-xs focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <FaLock className="absolute right-3 top-2.5 text-muted text-xs" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Broadcasts (real data from episode index) */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-text">Recent Broadcasts</h2>
              <a
                href="/archive"
                className="text-accent text-sm font-medium hover:underline"
              >
                View All Archive
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentEpisodes.map((ep, index) => (
                <div key={ep.date || ep.id || ep.youtube_id || index} className="group cursor-pointer">
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 mb-3 shadow-sm border border-border group-hover:shadow-md transition-all">
                    <img
                      src={`https://picsum.photos/400/225?random=${index + 1}`}
                      alt={ep.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      {ep.duration || "13:45"}
                    </div>
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                    {/* Play Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-10 h-10 bg-accent/90 rounded-full flex items-center justify-center text-white shadow-lg backdrop-blur-sm">
                        <span className="text-sm ml-0.5">▶</span>
                      </div>
                    </div>
                  </div>
                  <h3 className="font-bold text-sm text-text leading-tight mb-1 group-hover:text-accent transition-colors">
                    {ep.title}
                  </h3>
                  <div className="flex items-center text-xs text-muted">
                    <span>1.2K views</span>
                    <span className="mx-1">•</span>
                    <span>2 days ago</span>
                  </div>
                </div>
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
              <a href="https://ruslanmv.com/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-accent transition-colors">
                Twitter
              </a>
              <a href="https://ruslanmv.com/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-black transition-colors">
                GitHub
              </a>
              <a href="https://ruslanmv.com/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-500 transition-colors">
                RSS
              </a>
              <a href="https://linkedin.com/in/ruslanmv" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-700 transition-colors">
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
