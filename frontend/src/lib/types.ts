export interface Section {
  id: string;
  section_type: string;
  title: string;
  start_time: number;
  end_time: number;
  order_index: number;
}

export interface Episode {
  // YouTube format (primary for production)
  id?: string;
  episode_number?: number;
  youtube_url?: string;
  youtube_id?: string;
  duration?: number;
  published_at?: string;
  sections?: Section[];

  // R2 format (fallback/staging)
  date?: string;                // "YYYY-MM-DD"
  video_url?: string;           // MP4 on R2
  episode_url?: string;         // episode.json URL
  created_at?: string;          // ISO timestamp
  duration_seconds?: number;
  r2_key?: string;
  source?: string;

  // Common fields
  title: string;
  description: string;
}

export interface EpisodeIndex {
  updated_at: string;
  episodes: Episode[];
}
