export interface Section {
  id: string;
  section_type: string;
  title: string;
  start_time: number;
  end_time: number;
  order_index: number;
}

export interface Episode {
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
