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

export default function Home() {
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTodayEpisode = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await axios.get(`${apiUrl}/api/v1/episodes/today`);
        setEpisode(response.data);
      } catch (err: any) {
        console.error('Error fetching episode:', err);
        setError(err.response?.data?.detail || 'Failed to load episode');
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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-medium mb-2">Episode Not Available</h2>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return <TVPlayer episode={episode} autoPlay={true} />;
}
