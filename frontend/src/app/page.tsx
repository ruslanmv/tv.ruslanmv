"use client";

import { useEffect, useState } from 'react';
import TVPlayer from '@/components/TVPlayer';
import axios from 'axios';

interface Episode {
  id: string;
  episode_number: number;
  title: string;
  description: string;
  youtube_url: string;
  youtube_id: string;
  duration: number;
  published_at: string;
  sections: any[];
}

// Landing page component when no episode is available
function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">
              TV.<span className="text-purple-500">RUSLANMV</span>
            </h1>
            <a
              href="https://github.com/ruslanmv/tv.ruslanmv"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="text-6xl mb-6">📺</div>
          <h2 className="text-5xl font-bold text-white mb-4">
            AI-Powered Entertainment Channel
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            The first TV channel designed for both humans and AI agents. Daily videos featuring AI news, trending packages, and tech updates.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="https://github.com/ruslanmv/tv.ruslanmv"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              Get Started
            </a>
            <a
              href="https://github.com/ruslanmv/tv.ruslanmv#readme"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              Documentation
            </a>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
            <div className="text-3xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-white mb-2">AI-Powered</h3>
            <p className="text-gray-400">
              Daily videos generated using CrewAI and LLMs. Fully automated content creation pipeline.
            </p>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold text-white mb-2">Automated</h3>
            <p className="text-gray-400">
              GitHub Actions runs daily at 06:00 CET. From news fetching to YouTube upload, fully automated.
            </p>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
            <div className="text-3xl mb-4">🆓</div>
            <h3 className="text-xl font-semibold text-white mb-2">Free & Open</h3>
            <p className="text-gray-400">
              Uses Ollama for zero-cost development. Fully open source and deployable on Vercel.
            </p>
          </div>
        </div>

        {/* Demo Video Section */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-8 mb-16">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">How It Works</h3>
          <div className="aspect-video bg-black rounded-lg flex items-center justify-center mb-4">
            <div className="text-center text-gray-500">
              <div className="text-6xl mb-4">🎬</div>
              <p className="text-lg">Demo video coming soon</p>
              <p className="text-sm mt-2">Daily episodes will appear here automatically</p>
            </div>
          </div>
          <div className="text-center text-gray-400 text-sm">
            <p>Episodes are generated daily and uploaded to YouTube</p>
            <p className="mt-2">Configure your backend API URL to see live episodes</p>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="text-center mb-16">
          <h3 className="text-2xl font-bold text-white mb-8">Built With</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {['Next.js', 'CrewAI', 'Ollama', 'FFmpeg', 'GitHub Actions', 'Vercel', 'YouTube API'].map((tech) => (
              <span
                key={tech}
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm border border-gray-700"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-8">
          <h3 className="text-2xl font-bold text-white mb-6">Quick Setup</h3>
          <div className="space-y-4 text-gray-400">
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">1</span>
              <div>
                <h4 className="text-white font-medium mb-1">Deploy to Vercel</h4>
                <p className="text-sm">Click the "Deploy" button and configure your environment variables</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">2</span>
              <div>
                <h4 className="text-white font-medium mb-1">Set Environment Variables</h4>
                <p className="text-sm">Add <code className="bg-gray-800 px-2 py-1 rounded">NEXT_PUBLIC_API_URL</code> in Vercel dashboard</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">3</span>
              <div>
                <h4 className="text-white font-medium mb-1">Configure GitHub Actions</h4>
                <p className="text-sm">Set up secrets for YouTube upload and start generating daily videos</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">AI-Powered Entertainment Channel</p>
            <div className="flex gap-6 text-sm">
              <a href="https://github.com/ruslanmv/tv.ruslanmv" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                GitHub
              </a>
              <a href="https://github.com/ruslanmv/tv.ruslanmv#readme" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                Documentation
              </a>
              <a href="https://github.com/ruslanmv/tv.ruslanmv/issues" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                Issues
              </a>
            </div>
            <p className="text-xs text-gray-600">Powered by Vercel</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLanding, setShowLanding] = useState(false);

  useEffect(() => {
    const fetchTodayEpisode = async () => {
      // Only try to fetch if API URL is configured
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl || apiUrl === 'http://localhost:8000') {
        // No API configured, show landing page
        setShowLanding(true);
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${apiUrl}/api/v1/episodes/today`);
        setEpisode(response.data);
      } catch (err: any) {
        console.error('Error fetching episode:', err);
        // Show landing page instead of error
        setShowLanding(true);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayEpisode();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">📺</div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show landing page if no episode or API not configured
  if (showLanding || !episode) {
    return <LandingPage />;
  }

  return <TVPlayer episode={episode} autoPlay={true} />;
}
