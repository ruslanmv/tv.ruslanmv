"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { FaPlay, FaUserFriends } from "react-icons/fa";
import type { Episode, Section } from "@/lib/types";

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function TVPlayer({
  episode,
  onSectionChange
}: {
  episode: Episode | null;
  onSectionChange?: (section: Section | null) => void;
}) {
  const playerRef = useRef<ReactPlayer>(null);
  const [playing, setPlaying] = useState(false);
  const [playedSeconds, setPlayedSeconds] = useState(0);

  const currentSection = useMemo(() => {
    if (!episode?.sections?.length) return null;
    return (
      episode.sections.find((s) => playedSeconds >= s.start_time && playedSeconds <= s.end_time) ?? null
    );
  }, [episode, playedSeconds]);

  useEffect(() => {
    onSectionChange?.(currentSection);
  }, [currentSection, onSectionChange]);

  if (!episode) {
    return (
      <div className="bg-black rounded-lg shadow-lg overflow-hidden aspect-video relative flex items-center justify-center">
        <div className="text-center text-white/80 px-6">
          <p className="font-semibold">No episode available</p>
          <p className="text-sm text-white/60 mt-2">
            New episodes will appear here when they are published.
          </p>
        </div>
      </div>
    );
  }

  // Production default: YouTube first. Fallback: R2 MP4 if YouTube missing/banned.
  const videoUrl = episode.youtube_url || episode.video_url;

  const jumpToSection = (section: Section) => {
    playerRef.current?.seekTo(section.start_time, "seconds");
    setPlaying(true);
  };

  return (
    <div className="space-y-4">
      <div className="bg-black rounded-lg shadow-lg overflow-hidden aspect-video relative group">
        {!playing && (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] z-10"
            aria-label="Play stream"
          >
            <span className="w-20 h-20 bg-accent rounded-full flex items-center justify-center shadow-lg border border-white/20 hover:scale-110 transition-transform">
              <FaPlay className="text-white text-2xl ml-1" />
            </span>
          </button>
        )}

        <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-wider flex items-center shadow-md z-10">
          <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
          Live
        </div>

        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded text-xs font-medium flex items-center z-10">
          <FaUserFriends className="mr-2 text-white/70" /> 1,240
        </div>

        <ReactPlayer
          ref={playerRef}
          url={videoUrl}
          playing={playing}
          controls
          width="100%"
          height="100%"
          onProgress={(state) => setPlayedSeconds(state.playedSeconds)}
          onEnded={() => setPlaying(false)}
        />
      </div>

      {episode.sections && episode.sections.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-card">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-lg flex items-center justify-between">
            <h4 className="font-bold text-sm text-text">Chapters</h4>
            <span className="text-xs text-muted">{currentSection ? currentSection.title : "—"}</span>
          </div>

          <div className="divide-y divide-gray-100 max-h-[240px] overflow-y-auto">
            {episode.sections
              .slice()
              .sort((a, b) => a.order_index - b.order_index)
              .map((s) => {
                const active = currentSection?.id === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => jumpToSection(s)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                      active ? "bg-blue-50/60 border-l-4 border-accent" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm text-text line-clamp-1">{s.title}</p>
                      <span className="text-xs text-muted font-mono">{formatTime(s.start_time)}</span>
                    </div>
                    <p className="text-xs text-muted mt-1">{s.section_type}</p>
                  </button>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
