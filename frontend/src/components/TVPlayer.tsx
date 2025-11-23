"use client";

import React, { useState, useEffect, useRef } from "react";
import ReactPlayer from "react-player";
import { motion, AnimatePresence } from "framer-motion";

interface Section {
  id: string;
  section_type: string;
  title: string;
  start_time: number;
  end_time: number;
  order_index: number;
}

interface Episode {
  id: string;
  episode_number: number;
  title: string;
  description: string;
  youtube_url: string;
  youtube_id: string;
  duration: number;
  published_at: string;
  sections: Section[];
}

interface TVPlayerProps {
  episode: Episode | null;
  autoPlay?: boolean;
}

const TVPlayer: React.FC<TVPlayerProps> = ({ episode, autoPlay = true }) => {
  const [playing, setPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [showOverlay, setShowOverlay] = useState(true);
  const [currentSection, setCurrentSection] = useState<Section | null>(null);
  const playerRef = useRef<ReactPlayer | null>(null);

  useEffect(() => {
    if (showOverlay && autoPlay) {
      const timer = setTimeout(() => setShowOverlay(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showOverlay, autoPlay]);

  useEffect(() => {
    if (episode?.sections) {
      const section = episode.sections.find(
        (s) => currentTime >= s.start_time && currentTime <= s.end_time
      );
      if (section) setCurrentSection(section);
    }
  }, [currentTime, episode]);

  const handleProgress = (state: { playedSeconds: number }) => {
    setCurrentTime(state.playedSeconds);
  };

  const jumpToSection = (section: Section) => {
    if (playerRef.current) {
      playerRef.current.seekTo(section.start_time, "seconds");
      setPlaying(true);
    }
  };

  const getSectionIcon = (sectionType: string): string => {
    const icons: { [key: string]: string } = {
      news: "📰",
      tech: "🚀",
      deepdive: "🔍",
      research: "🔬",
      packages: "📦",
    };
    return icons[sectionType] || "📺";
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!episode) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black">
        <div className="text-center text-white">
          <div className="animate-pulse text-6xl mb-4">📺</div>
          <h2 className="text-2xl font-bold">No Episode Available</h2>
          <p className="text-gray-400 mt-2">
            Check back soon for new content!
          </p>
        </div>
      </div>
    );
  }

  const formattedDurationMinutes = Math.floor(episode.duration / 60);
  const formattedDurationSeconds = Math.floor(episode.duration % 60);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob -top-48 -left-48" />
        <div className="absolute w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 top-48 right-48" />
        <div className="absolute w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 -bottom-48 left-48" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Channel Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="text-6xl">📺</div>
            <h1 className="text-5xl font-bold text-white tracking-wider">
              TV.<span className="text-purple-400">RUSLANMV</span>
            </h1>
          </div>
          <p className="text-xl text-purple-300 font-light tracking-wide">
            THE FIRST TV CHANNEL FOR AI AND HUMANS
          </p>
          <div className="flex items-center justify-center gap-3 mt-4">
            <span className="px-4 py-1 bg-red-600 text-white text-sm font-bold rounded-full animate-pulse">
              ● LIVE
            </span>
            <span className="text-gray-400 text-sm">
              Episode #{episode.episode_number} •{" "}
              {new Date(episode.published_at).toLocaleDateString()}
            </span>
          </div>
        </motion.div>

        {/* TV Frame */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative max-w-6xl mx-auto"
        >
          {/* TV Bezel */}
          <div
            className="relative rounded-3xl overflow-hidden shadow-2xl"
            style={{
              background:
                "linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
              padding: "2rem",
              boxShadow:
                "0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 2px 4px rgba(255, 255, 255, 0.1)",
            }}
          >
            {/* Screen */}
            <div className="relative bg-black rounded-2xl overflow-hidden aspect-video">
              <ReactPlayer
                ref={playerRef}
                url={episode.youtube_url}
                playing={playing}
                controls={false}
                width="100%"
                height="100%"
                onProgress={handleProgress}
                onEnded={() => setPlaying(false)}
                config={{
                  youtube: {
                    playerVars: {
                      modestbranding: 1,
                      rel: 0,
                    },
                  },
                }}
              />

              {/* Custom Overlay */}
              <AnimatePresence>
                {showOverlay && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/80 flex flex-col justify-between p-8"
                  >
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-2">
                        {episode.title}
                      </h2>
                      <p className="text-gray-300 text-lg">
                        {episode.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setPlaying(!playing)}
                        className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-bold text-lg transition-all transform hover:scale-105"
                      >
                        {playing ? "⏸ PAUSE" : "▶ PLAY"}
                      </button>

                      {currentSection && (
                        <div className="bg-black/60 backdrop-blur-sm px-6 py-3 rounded-full">
                          <span className="text-purple-400 font-bold">
                            NOW:
                          </span>
                          <span className="text-white ml-2">
                            {currentSection.title}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            </div>

            {/* TV Bottom Panel */}
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-gray-400 text-sm">POWER</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-gray-500 text-xs font-mono">
                  {formatTime(currentTime)} /{" "}
                  {`${formattedDurationMinutes}:${formattedDurationSeconds
                    .toString()
                    .padStart(2, "0")}`}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setPlaying(!playing)}
                  className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-white transition-colors"
                >
                  {playing ? "⏸" : "▶"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Section Navigation */}
        {episode.sections && episode.sections.length > 0 && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-12 max-w-6xl mx-auto"
          >
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-3xl">📑</span>
              Episode Sections
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {episode.sections.map((section) => (
                <motion.button
                  key={section.id}
                  onClick={() => jumpToSection(section)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-4 rounded-xl text-left transition-all ${
                    currentSection?.id === section.id
                      ? "bg-purple-600 shadow-lg shadow-purple-500/50"
                      : "bg-gray-800 hover:bg-gray-700"
                  }`}
                >
                  <div className="text-2xl mb-2">
                    {getSectionIcon(section.section_type)}
                  </div>
                  <div className="text-white font-semibold text-sm mb-1">
                    {section.title}
                  </div>
                  <div className="text-gray-400 text-xs">
                    {formatTime(section.start_time)} -{" "}
                    {formatTime(section.end_time)}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* AI Agent Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-16 max-w-4xl mx-auto text-center"
        >
          <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30">
            <h3 className="text-2xl font-bold text-white mb-4">
              🤖 AI-Readable Content Available
            </h3>
            <p className="text-gray-300 mb-6">
              This episode is available via MCP (Model Context Protocol) for AI
              agents. AI can access structured content, transcripts, and
              section-specific data.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <code className="px-4 py-2 bg-black/50 rounded-lg text-purple-300 text-sm">
                mcp://tv.ruslanmv.com/episode/{episode.id}
              </code>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-scanlines opacity-10" />
    </div>
  );
};

export default TVPlayer;
