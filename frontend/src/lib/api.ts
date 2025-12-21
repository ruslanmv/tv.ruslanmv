import axios from "axios";
import type { Episode } from "./types";

export function getApiBaseUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) return null;

  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.includes("localhost")) return null;

  return trimmed.replace(/\/+$/, "");
}

export async function fetchTodayEpisode(): Promise<Episode | null> {
  const base = getApiBaseUrl();
  if (!base) return null;

  try {
    const res = await axios.get(`${base}/api/v1/episodes/today`, { timeout: 10000 });
    return res.data as Episode;
  } catch {
    return null;
  }
}
