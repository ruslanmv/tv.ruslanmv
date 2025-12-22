"use client";

import { useEffect, useState } from "react";
import { fetchEpisodeIndex } from "@/lib/api";
import type { EpisodeIndex } from "@/lib/types";
import { FaBars, FaEye, FaPlay, FaSearch } from "react-icons/fa";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

export default function ArchivePage() {
  const [episodeIndex, setEpisodeIndex] = useState<EpisodeIndex | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>(["all"]);
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    (async () => {
      setLoading(true);
      const index = await fetchEpisodeIndex();
      setEpisodeIndex(index);
      setLoading(false);
    })();
  }, []);

  // Filter and sort episodes
  const filteredEpisodes = () => {
    if (!episodeIndex?.episodes) return [];

    let episodes = [...episodeIndex.episodes];

    // Apply search filter
    if (searchQuery) {
      episodes = episodes.filter((ep) =>
        ep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ep.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply topic filter (if not "all")
    if (!selectedTopics.includes("all")) {
      // This is a simple filter - you can enhance based on your data structure
      episodes = episodes.filter((ep) => {
        const title = ep.title.toLowerCase();
        return selectedTopics.some((topic) => title.includes(topic.toLowerCase()));
      });
    }

    // Sort episodes
    episodes.sort((a, b) => {
      const dateA = Date.parse(a.published_at || a.created_at || a.date || "") || 0;
      const dateB = Date.parse(b.published_at || b.created_at || b.date || "") || 0;

      if (sortBy === "newest") return dateB - dateA;
      if (sortBy === "oldest") return dateA - dateB;
      // Add more sort options as needed
      return dateB - dateA;
    });

    return episodes;
  };

  const episodes = filteredEpisodes();
  const totalPages = Math.ceil(episodes.length / itemsPerPage);
  const paginatedEpisodes = episodes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleTopicToggle = (topic: string) => {
    if (topic === "all") {
      setSelectedTopics(["all"]);
    } else {
      setSelectedTopics((prev) => {
        const withoutAll = prev.filter((t) => t !== "all");
        if (withoutAll.includes(topic)) {
          const filtered = withoutAll.filter((t) => t !== topic);
          return filtered.length === 0 ? ["all"] : filtered;
        } else {
          return [...withoutAll, topic];
        }
      });
    }
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <main className="flex-grow flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl mb-3">📺</div>
          <p className="text-muted">Loading archive…</p>
        </div>
      </main>
    );
  }

  return (
    <>
      {/* Minimalist Header (Consistent with Home) */}
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
              <span className="text-[10px] font-medium text-muted uppercase tracking-wide mt-0.5">Archive</span>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-muted">
            <a href="/" className="hover:text-accent transition-colors">Live</a>
            <a href="/archive" className="text-text font-semibold hover:text-accent transition-colors">Archive</a>
            <a href="/series" className="hover:text-accent transition-colors">Series</a>
            <a href="https://ruslanmv.com/" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">About</a>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <button className="md:hidden p-2 text-text" aria-label="Open menu">
              <FaBars />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Sidebar Filters */}
          <aside className="lg:col-span-1 space-y-8">
            {/* Search */}
            <div className="bg-white p-4 rounded-lg shadow-card border border-border">
              <h3 className="font-bold text-sm mb-3">Search Archive</h3>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Keywords..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-lightGray border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                />
                <FaSearch className="absolute right-3 top-2.5 text-muted text-xs" />
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white p-4 rounded-lg shadow-card border border-border">
              <h3 className="font-bold text-sm mb-3">Topics</h3>
              <div className="space-y-2 text-sm">
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedTopics.includes("all")}
                    onChange={() => handleTopicToggle("all")}
                    className="form-checkbox text-accent rounded border-gray-300 focus:ring-accent"
                  />
                  <span className="text-muted group-hover:text-text transition-colors">All Topics</span>
                  <span className="ml-auto text-xs text-gray-400">{episodeIndex?.episodes?.length || 0}</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedTopics.includes("ai")}
                    onChange={() => handleTopicToggle("ai")}
                    className="form-checkbox text-accent rounded border-gray-300 focus:ring-accent"
                  />
                  <span className="text-muted group-hover:text-text transition-colors">Artificial Intelligence</span>
                  <span className="ml-auto text-xs text-gray-400">64</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedTopics.includes("cloud")}
                    onChange={() => handleTopicToggle("cloud")}
                    className="form-checkbox text-accent rounded border-gray-300 focus:ring-accent"
                  />
                  <span className="text-muted group-hover:text-text transition-colors">Cloud Architecture</span>
                  <span className="ml-auto text-xs text-gray-400">38</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedTopics.includes("data")}
                    onChange={() => handleTopicToggle("data")}
                    className="form-checkbox text-accent rounded border-gray-300 focus:ring-accent"
                  />
                  <span className="text-muted group-hover:text-text transition-colors">Data Science</span>
                  <span className="ml-auto text-xs text-gray-400">22</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedTopics.includes("devops")}
                    onChange={() => handleTopicToggle("devops")}
                    className="form-checkbox text-accent rounded border-gray-300 focus:ring-accent"
                  />
                  <span className="text-muted group-hover:text-text transition-colors">DevOps</span>
                  <span className="ml-auto text-xs text-gray-400">18</span>
                </label>
              </div>
            </div>

            {/* Sort By */}
            <div className="bg-white p-4 rounded-lg shadow-card border border-border">
              <h3 className="font-bold text-sm mb-3">Sort By</h3>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-lightGray border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent text-text"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="popular">Most Popular</option>
                <option value="duration">Longest Duration</option>
              </select>
            </div>
          </aside>

          {/* Video Grid */}
          <div className="lg:col-span-3">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-text">All Videos</h1>
              <span className="text-sm text-muted">
                Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, episodes.length)} of {episodes.length} results
              </span>
            </div>

            {paginatedEpisodes.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted text-lg mb-2">No videos found</p>
                <p className="text-sm text-gray-400">Try adjusting your filters or search query</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedEpisodes.map((ep, index) => (
                  <article
                    key={ep.date || ep.id || ep.youtube_id || index}
                    className="bg-white rounded-lg shadow-card border border-border overflow-hidden group hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="relative aspect-video bg-gray-200 overflow-hidden">
                      <img
                        src={`https://picsum.photos/400/225?random=${index + 10}`}
                        alt={ep.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        {ep.duration || "15:30"}
                      </div>
                      {/* Play Icon */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/10">
                        <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white shadow-lg">
                          <FaPlay className="text-sm ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-accent uppercase tracking-wide bg-blue-50 px-2 py-0.5 rounded">
                          Episode
                        </span>
                        <span className="text-[10px] text-muted">
                          {formatDate(ep.published_at || ep.created_at || ep.date || "")}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-text leading-tight mb-2 group-hover:text-accent transition-colors line-clamp-2">
                        {ep.title}
                      </h3>
                      <div className="flex items-center text-xs text-muted">
                        <FaEye className="mr-1" /> {Math.floor(Math.random() * 5000 + 500)} views
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-md border border-border bg-white text-muted text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                          currentPage === pageNum
                            ? "bg-accent text-white"
                            : "border border-border bg-white text-text hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="px-2 text-muted">...</span>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className="px-3 py-2 rounded-md border border-border bg-white text-text text-sm hover:bg-gray-50"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 rounded-md border border-border bg-white text-muted text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-border py-8 text-sm text-muted mt-auto">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <span className="font-bold text-text">TV.RuslanMV</span>
            <span className="text-gray-300">|</span>
            <span>© 2025 Ruslan Magana Vsevolodovna</span>
          </div>
          <div className="flex space-x-6">
            <a href="https://ruslanmv.com/" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">Terms</a>
            <a href="https://ruslanmv.com/" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">Privacy</a>
            <a href="https://ruslanmv.com/" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">Twitter</a>
            <a href="https://github.com/ruslanmv" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </>
  );
}
