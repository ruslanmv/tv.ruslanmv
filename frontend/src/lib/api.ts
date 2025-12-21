import axios from "axios";
import type { Episode, EpisodeIndex } from "./types";

/**
 * Fetch the latest episode from R2 via Vercel serverless route
 */
export async function fetchLatestEpisode(): Promise<Episode | null> {
  try {
    const res = await axios.get(`/api/episodes/latest`, { timeout: 10000 });
    return res.data as Episode;
  } catch (error) {
    console.error("Failed to fetch latest episode:", error);
    return null;
  }
}

/**
 * Fetch the episode index (list of all episodes) from R2
 */
export async function fetchEpisodeIndex(): Promise<EpisodeIndex | null> {
  try {
    const res = await axios.get(`/api/episodes`, { timeout: 10000 });
    return res.data as EpisodeIndex;
  } catch (error) {
    console.error("Failed to fetch episode index:", error);
    return null;
  }
}

/**
 * Fetch a specific episode by date (YYYY-MM-DD) from R2
 */
export async function fetchEpisodeByDate(date: string): Promise<Episode | null> {
  try {
    const res = await axios.get(`/api/episodes/${date}`, { timeout: 10000 });
    return res.data as Episode;
  } catch (error) {
    console.error(`Failed to fetch episode for ${date}:`, error);
    return null;
  }
}

/**
 * @deprecated Use fetchLatestEpisode() instead
 * Legacy function for backward compatibility
 */
export async function fetchTodayEpisode(): Promise<Episode | null> {
  return fetchLatestEpisode();
}
