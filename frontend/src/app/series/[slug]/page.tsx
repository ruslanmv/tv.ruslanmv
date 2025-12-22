"use client";

import { useState } from "react";
import { FaBars, FaPlay, FaClock, FaCalendarAlt, FaPlayCircle, FaCircle, FaLock } from "react-icons/fa";

// Mock data for a series - in production, this would come from API/CMS
const seriesData = {
  id: "mastering-ai-agents",
  title: "Mastering Generative AI Agents",
  description: "A comprehensive 12-part series taking you from the basics of LLMs to building autonomous multi-agent systems using LangChain, AutoGen, and IBM watsonx.ai.",
  instructor: {
    name: "Ruslan Magana Vsevolodovna",
    title: "Data Scientist & AI Lead at IBM",
    bio: "Specializing in Artificial Intelligence and Neural Networks. Passionate about bridging theoretical physics with enterprise AI solutions.",
    avatar: "https://ui-avatars.com/api/?name=RM&background=268bd2&color=fff"
  },
  totalEpisodes: 12,
  totalDuration: "8 Hours",
  progress: 8,
  episodes: [
    {
      id: 1,
      title: "Introduction to Generative AI & LLMs",
      duration: "45 mins",
      released: "Oct 10, 2025",
      level: "Beginner",
      locked: false,
      completed: true,
      description: "In this inaugural episode, we lay the foundation for the entire series. We will explore the architecture behind Large Language Models (LLMs), specifically the Transformer architecture.",
      topics: [
        "History of NLP and the rise of Transformers",
        "Understanding Tokens, Embeddings, and Attention Mechanisms",
        "Overview of the current LLM landscape (GPT-4, Llama 3, Granite)",
        "Setting up your development environment for the course"
      ]
    },
    {
      id: 2,
      title: "Prompt Engineering Fundamentals",
      duration: "52 mins",
      released: "Oct 17, 2025",
      level: "Beginner",
      locked: false,
      completed: false
    },
    {
      id: 3,
      title: "Getting Started with LangChain",
      duration: "1h 05m",
      released: "Oct 24, 2025",
      level: "Intermediate",
      locked: false,
      completed: false
    },
    {
      id: 4,
      title: "Memory & State in AI Agents",
      duration: "48 mins",
      released: "Oct 31, 2025",
      level: "Intermediate",
      locked: true,
      completed: false
    },
    {
      id: 5,
      title: "Connecting to Tools (Function Calling)",
      duration: "55 mins",
      released: "Nov 07, 2025",
      level: "Intermediate",
      locked: true,
      completed: false
    },
    {
      id: 6,
      title: "Introduction to IBM watsonx.ai",
      duration: "40 mins",
      released: "Nov 14, 2025",
      level: "Intermediate",
      locked: true,
      completed: false
    },
    {
      id: 7,
      title: "Building Your First RAG Pipeline",
      duration: "1h 15m",
      released: "Nov 21, 2025",
      level: "Advanced",
      locked: true,
      completed: false
    },
    {
      id: 8,
      title: "Introduction to AutoGen",
      duration: "50 mins",
      released: "Nov 28, 2025",
      level: "Advanced",
      locked: true,
      completed: false
    },
    {
      id: 9,
      title: "Orchestrating Multi-Agent Conversations",
      duration: "58 mins",
      released: "Dec 05, 2025",
      level: "Advanced",
      locked: true,
      completed: false
    }
  ]
};

export default function SeriesPlayerPage() {
  const [currentEpisode, setCurrentEpisode] = useState(seriesData.episodes[0]);
  const [activeTab, setActiveTab] = useState("overview");

  const handleEpisodeClick = (episode: typeof seriesData.episodes[0]) => {
    if (!episode.locked) {
      setCurrentEpisode(episode);
    }
  };

  return (
    <>
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
              <span className="text-[10px] font-medium text-muted uppercase tracking-wide mt-0.5">Series Player</span>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-muted">
            <a href="/" className="hover:text-accent transition-colors">Live</a>
            <a href="/series" className="text-text font-semibold hover:text-accent transition-colors">Series</a>
            <a href="/archive" className="hover:text-accent transition-colors">Archive</a>
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

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">

        {/* Breadcrumb & Title */}
        <div className="mb-6">
          <nav className="text-xs text-muted mb-2">
            <a href="/series" className="hover:text-accent">Series</a>
            <span className="mx-2">/</span>
            <span className="text-text font-medium">{seriesData.title}</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-bold text-text">{seriesData.title}</h1>
          <p className="text-muted text-sm mt-2 max-w-3xl">
            {seriesData.description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* Left Column: Video Player & Tabs */}
          <div className="lg:col-span-2 space-y-6">

            {/* Video Player Container */}
            <div className="bg-black rounded-xl overflow-hidden aspect-video relative shadow-lg group">
              {/* Placeholder Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-darkBg">
                <div className="w-20 h-20 bg-accent/90 rounded-full flex items-center justify-center cursor-pointer hover:bg-white hover:text-accent text-white transition-all duration-300 shadow-xl group-hover:scale-105 z-10">
                  <FaPlay className="text-3xl ml-2" />
                </div>
                <img
                  src="https://picsum.photos/800/450?grayscale&blur=2"
                  className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay"
                  alt="Video background"
                />
              </div>

              {/* Progress Bar */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-700">
                <div className="h-full bg-accent w-1/3"></div>
              </div>
            </div>

            {/* Content Tabs */}
            <div className="bg-white rounded-lg border border-border shadow-card overflow-hidden">
              <div className="flex border-b border-border">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`px-6 py-3 text-sm font-bold transition-colors ${
                    activeTab === "overview"
                      ? "text-accent border-b-2 border-accent bg-blue-50/50"
                      : "text-muted hover:text-text hover:bg-gray-50"
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab("resources")}
                  className={`px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === "resources"
                      ? "text-accent border-b-2 border-accent bg-blue-50/50"
                      : "text-muted hover:text-text hover:bg-gray-50"
                  }`}
                >
                  Resources
                </button>
                <button
                  onClick={() => setActiveTab("qa")}
                  className={`px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === "qa"
                      ? "text-accent border-b-2 border-accent bg-blue-50/50"
                      : "text-muted hover:text-text hover:bg-gray-50"
                  }`}
                >
                  Q&A
                </button>
              </div>

              <div className="p-6">
                {activeTab === "overview" && (
                  <>
                    <h2 className="text-xl font-bold mb-3">Episode {currentEpisode.id}: {currentEpisode.title}</h2>
                    <div className="flex items-center space-x-4 text-xs text-muted mb-4">
                      <span><FaClock className="inline mr-1" /> {currentEpisode.duration}</span>
                      <span><FaCalendarAlt className="inline mr-1" /> Released {currentEpisode.released}</span>
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{currentEpisode.level}</span>
                    </div>
                    {currentEpisode.description && (
                      <div className="prose prose-sm prose-slate max-w-none text-muted">
                        <p>{currentEpisode.description}</p>
                        {currentEpisode.topics && (
                          <>
                            <p className="mt-2"><strong>Key Topics:</strong></p>
                            <ul className="list-disc pl-5 mt-1 space-y-1">
                              {currentEpisode.topics.map((topic, index) => (
                                <li key={index}>{topic}</li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>
                    )}
                  </>
                )}

                {activeTab === "resources" && (
                  <div className="text-muted text-sm">
                    <h3 className="font-bold text-text mb-3">Episode Resources</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <i className="fas fa-file-pdf text-red-600 mr-2"></i>
                        <a href="#" className="text-accent hover:underline">Slides: Introduction to LLMs.pdf</a>
                      </li>
                      <li className="flex items-center">
                        <i className="fas fa-code text-blue-600 mr-2"></i>
                        <a href="#" className="text-accent hover:underline">Code Repository: GitHub</a>
                      </li>
                      <li className="flex items-center">
                        <i className="fas fa-book text-green-600 mr-2"></i>
                        <a href="#" className="text-accent hover:underline">Reading: Attention Is All You Need Paper</a>
                      </li>
                    </ul>
                  </div>
                )}

                {activeTab === "qa" && (
                  <div className="text-muted text-sm">
                    <h3 className="font-bold text-text mb-3">Discussion & Questions</h3>
                    <p className="mb-4">Ask questions and discuss this episode with other learners.</p>
                    <div className="bg-gray-50 p-4 rounded-md border border-border">
                      <p className="text-xs text-center text-muted">Q&A feature coming soon...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Instructor Info */}
            <div className="bg-white rounded-lg border border-border shadow-card p-6 flex items-start space-x-4">
              <img src={seriesData.instructor.avatar} className="w-12 h-12 rounded-full" alt={seriesData.instructor.name} />
              <div>
                <h3 className="font-bold text-sm text-text">{seriesData.instructor.name}</h3>
                <p className="text-xs text-accent font-medium mb-2">{seriesData.instructor.title}</p>
                <p className="text-xs text-muted leading-relaxed">{seriesData.instructor.bio}</p>
              </div>
            </div>
          </div>

          {/* Right Column: Syllabus/Playlist */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-border shadow-card flex flex-col h-[600px] sticky top-24">
              <div className="p-4 border-b border-border bg-gray-50">
                <h3 className="font-bold text-text">Course Content</h3>
                <div className="mt-2 flex items-center justify-between text-xs text-muted">
                  <span>{seriesData.totalEpisodes} Episodes</span>
                  <span>{seriesData.progress}% Complete</span>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                  <div className="bg-success h-1.5 rounded-full" style={{ width: `${seriesData.progress}%` }}></div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto playlist-scroll">
                {seriesData.episodes.map((episode) => (
                  <div
                    key={episode.id}
                    onClick={() => handleEpisodeClick(episode)}
                    className={`p-4 border-b border-border transition-colors ${
                      currentEpisode.id === episode.id
                        ? "bg-blue-50 border-l-4 border-l-accent cursor-pointer"
                        : episode.locked
                        ? "opacity-60 cursor-not-allowed"
                        : "hover:bg-gray-50 cursor-pointer group"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span
                        className={`text-xs font-bold uppercase ${
                          currentEpisode.id === episode.id ? "text-accent" : "text-muted group-hover:text-text"
                        }`}
                      >
                        Episode {episode.id}
                      </span>
                      <span className="text-xs text-muted">{episode.duration}</span>
                    </div>
                    <h4
                      className={`text-sm font-bold mb-1 ${
                        currentEpisode.id === episode.id
                          ? "text-text"
                          : "text-text group-hover:text-accent transition-colors"
                      }`}
                    >
                      {episode.title}
                    </h4>
                    <div className="flex items-center text-xs mt-2">
                      {currentEpisode.id === episode.id ? (
                        <>
                          <FaPlayCircle className="mr-1 text-accent" />
                          <span className="text-accent">Now Playing</span>
                        </>
                      ) : episode.locked ? (
                        <FaLock className="text-gray-300" />
                      ) : (
                        <FaCircle className="text-gray-300" style={{ fontSize: "8px" }} />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-gray-50 border-t border-border text-center">
                <button className="text-xs text-accent font-bold uppercase tracking-wide hover:underline">
                  Download Syllabus PDF
                </button>
              </div>
            </div>
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

      <style jsx>{`
        .playlist-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .playlist-scroll::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .playlist-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .playlist-scroll::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </>
  );
}
