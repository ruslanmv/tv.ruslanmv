"use client";

import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player/youtube';

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
  const [currentSection, setCurrentSection] = useState<Section | null>(null);
  const playerRef = useRef<ReactPlayer>(null);

  useEffect(() => {
    if (episode?.sections) {
      const section = episode.sections.find(
        s => currentTime >= s.start_time && currentTime <= s.end_time
      );
      if (section) setCurrentSection(section);
    }
  }, [currentTime, episode]);

  const handleProgress = (state: { playedSeconds: number }) => {
    setCurrentTime(state.playedSeconds);
  };

  const jumpToSection = (section: Section) => {
    if (playerRef.current) {
      playerRef.current.seekTo(section.start_time, 'seconds');
      setPlaying(true);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!episode) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-4">📺</div>
          <h2 className="text-xl font-medium">No Episode Available</h2>
          <p className="text-sm mt-2">Check back soon</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">
                TV.<span className="text-purple-500">RUSLANMV</span>
              </h1>
              <span className="px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded">
                LIVE
              </span>
            </div>
            <div className="text-sm text-gray-400">
              Episode #{episode.episode_number}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Video Player */}
        <div className="mb-8">
          <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
            <ReactPlayer
              ref={playerRef}
              url={episode.youtube_url}
              playing={playing}
              controls={true}
              width="100%"
              height="100%"
              onProgress={handleProgress}
              onEnded={() => setPlaying(false)}
            />
          </div>

          {/* Episode Info */}
          <div className="mt-6">
            <h2 className="text-2xl font-semibold text-white mb-2">
              {episode.title}
            </h2>
            <p className="text-gray-400 text-sm mb-4">
              {episode.description}
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>{new Date(episode.published_at).toLocaleDateString()}</span>
              <span>•</span>
              <span>{formatTime(episode.duration)}</span>
              {currentSection && (
                <>
                  <span>•</span>
                  <span className="text-purple-400">{currentSection.title}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Sections */}
        {episode.sections && episode.sections.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Sections</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {episode.sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => jumpToSection(section)}
                  className={`p-4 rounded-lg text-left transition-all ${
                    currentSection?.id === section.id
                      ? 'bg-purple-600 ring-2 ring-purple-400'
                      : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                >
                  <div className="text-white font-medium text-sm mb-1">
                    {section.title}
                  </div>
                  <div className="text-gray-400 text-xs">
                    {formatTime(section.start_time)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-500 text-sm">
          <p>AI-Powered Entertainment Channel</p>
          <p className="mt-2 text-xs text-gray-600">Powered by Vercel</p>
        </div>
      </footer>
    </div>
  );
};

export default TVPlayer;
