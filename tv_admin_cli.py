#!/usr/bin/env python3
"""
TV.RuslanMV Admin CLI

A comprehensive command-line tool to manage episodes, series, and sync with R2.
This tool provides full CRUD operations for the TV.RuslanMV video platform.

Usage:
    python tv_admin_cli.py list
    python tv_admin_cli.py add --id EPISODE_ID --title "Title" --video path/to/video.mp4 ...
    python tv_admin_cli.py edit --id EPISODE_ID --title "New Title"
    python tv_admin_cli.py delete --id EPISODE_ID
    python tv_admin_cli.py r2-upload --bucket BUCKET_NAME
    python tv_admin_cli.py r2-download --bucket BUCKET_NAME
"""

from __future__ import annotations
import argparse
import json
import re
import sys
from pathlib import Path
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import shutil


# ============================================================================
# CONFIGURATION
# ============================================================================

ROOT = Path(__file__).resolve().parent
FRONTEND_PUBLIC = ROOT / "frontend" / "public"
EPISODES_DIR = FRONTEND_PUBLIC / "episodes"
INDEX_JSON = EPISODES_DIR / "index.json"
LATEST_JSON = EPISODES_DIR / "latest.json"


# ============================================================================
# UTILITIES
# ============================================================================

def utc_now_iso() -> str:
    """Return current UTC time in ISO format"""
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def slugify(s: str) -> str:
    """Convert string to URL-friendly slug"""
    s = s.strip().lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = re.sub(r"-+", "-", s).strip("-")
    return s or "episode"


def read_json(path: Path, default: Any = None) -> Any:
    """Read JSON file with fallback"""
    if not path.exists():
        return default
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception as e:
        print(f"⚠️  Warning: Could not read {path}: {e}")
        return default


def write_json(path: Path, data: Any) -> None:
    """Write JSON file with formatting"""
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8"
    )


def format_size(size_bytes: int) -> str:
    """Format file size in human-readable format"""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.1f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.1f} TB"


# ============================================================================
# CORE EPISODE MANAGEMENT
# ============================================================================

class EpisodeManager:
    """Manages episodes in the frontend/public/episodes directory"""

    def __init__(self, episodes_dir: Path = EPISODES_DIR):
        self.episodes_dir = episodes_dir
        self.episodes_dir.mkdir(parents=True, exist_ok=True)

    def list_episodes(self) -> List[Dict[str, Any]]:
        """List all episodes"""
        index = read_json(INDEX_JSON, {"episodes": []})
        return index.get("episodes", [])

    def get_episode(self, episode_id: str) -> Optional[Dict[str, Any]]:
        """Get episode by ID"""
        ep_dir = self.episodes_dir / episode_id
        ep_json = ep_dir / "episode.json"
        if not ep_json.exists():
            return None
        return read_json(ep_json)

    def add_episode(
        self,
        episode_id: str,
        title: str,
        date: str,
        video_path: Optional[Path] = None,
        audio_path: Optional[Path] = None,
        script_path: Optional[Path] = None,
        description: str = "",
        series: str = "",
        thumbnail_url: str = "",
        meta: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Add a new episode"""
        ep_dir = self.episodes_dir / episode_id
        ep_dir.mkdir(parents=True, exist_ok=True)

        # Copy files if provided
        files_info = {}
        if video_path and video_path.exists():
            dest = ep_dir / "episode.mp4"
            shutil.copy2(video_path, dest)
            files_info["video"] = format_size(dest.stat().st_size)
            print(f"  ✅ Copied video: {format_size(dest.stat().st_size)}")

        if audio_path and audio_path.exists():
            dest = ep_dir / "episode.mp3"
            shutil.copy2(audio_path, dest)
            files_info["audio"] = format_size(dest.stat().st_size)
            print(f"  ✅ Copied audio: {format_size(dest.stat().st_size)}")

        if script_path and script_path.exists():
            dest = ep_dir / "episode.txt"
            shutil.copy2(script_path, dest)
            files_info["script"] = f"{len(dest.read_text().split())} words"
            print(f"  ✅ Copied script: {len(dest.read_text().split())} words")

        # Create episode metadata
        episode_json = {
            "id": episode_id,
            "date": date,
            "title": title,
            "description": description or f"Episode: {title}",
            "created_at": utc_now_iso(),
            "video_url": f"/episodes/{episode_id}/episode.mp4",
            "audio_url": f"/episodes/{episode_id}/episode.mp3",
            "script_url": f"/episodes/{episode_id}/episode.txt",
            "thumbnail_url": thumbnail_url,
            "series": series,
            "meta": meta or {},
            "files_info": files_info,
        }

        # Write episode.json
        write_json(ep_dir / "episode.json", episode_json)

        # Update index
        self._update_index(episode_json)

        # Update latest
        self._update_latest(episode_json)

        return episode_json

    def edit_episode(
        self,
        episode_id: str,
        title: Optional[str] = None,
        description: Optional[str] = None,
        date: Optional[str] = None,
        series: Optional[str] = None,
        thumbnail_url: Optional[str] = None,
        meta: Optional[Dict[str, Any]] = None,
    ) -> Optional[Dict[str, Any]]:
        """Edit episode metadata"""
        episode = self.get_episode(episode_id)
        if not episode:
            print(f"❌ Episode not found: {episode_id}")
            return None

        # Update fields
        if title is not None:
            episode["title"] = title
        if description is not None:
            episode["description"] = description
        if date is not None:
            episode["date"] = date
        if series is not None:
            episode["series"] = series
        if thumbnail_url is not None:
            episode["thumbnail_url"] = thumbnail_url
        if meta is not None:
            episode["meta"].update(meta)

        episode["updated_at"] = utc_now_iso()

        # Save
        ep_dir = self.episodes_dir / episode_id
        write_json(ep_dir / "episode.json", episode)

        # Update index
        self._update_index(episode)

        # Update latest if this is the latest episode
        index = read_json(INDEX_JSON, {"episodes": []})
        episodes = index.get("episodes", [])
        if episodes and episodes[0].get("id") == episode_id:
            self._update_latest(episode)

        return episode

    def delete_episode(self, episode_id: str) -> bool:
        """Delete an episode"""
        ep_dir = self.episodes_dir / episode_id
        if not ep_dir.exists():
            print(f"❌ Episode not found: {episode_id}")
            return False

        # Remove directory
        shutil.rmtree(ep_dir)

        # Update index
        index = read_json(INDEX_JSON, {"episodes": []})
        episodes = [e for e in index.get("episodes", []) if e.get("id") != episode_id]
        index["episodes"] = episodes
        index["updated_at"] = utc_now_iso()
        write_json(INDEX_JSON, index)

        # Update latest if needed
        if episodes:
            latest_ep = self.get_episode(episodes[0]["id"])
            if latest_ep:
                self._update_latest(latest_ep)
        else:
            # No episodes left, clear latest
            if LATEST_JSON.exists():
                LATEST_JSON.unlink()

        return True

    def _update_index(self, episode: Dict[str, Any]) -> None:
        """Update the episode index"""
        index = read_json(INDEX_JSON, {"episodes": []})
        episodes = index.get("episodes", [])

        # Remove existing entry for this episode
        episodes = [e for e in episodes if e.get("id") != episode["id"]]

        # Add new entry at the beginning
        episodes.insert(0, {
            "id": episode["id"],
            "date": episode["date"],
            "title": episode["title"],
            "description": episode.get("description", ""),
            "video_url": episode["video_url"],
            "series": episode.get("series", ""),
            "thumbnail_url": episode.get("thumbnail_url", ""),
        })

        # Keep only last 100 episodes
        index["episodes"] = episodes[:100]
        index["updated_at"] = utc_now_iso()
        write_json(INDEX_JSON, index)

    def _update_latest(self, episode: Dict[str, Any]) -> None:
        """Update the latest episode"""
        write_json(LATEST_JSON, episode)


# ============================================================================
# R2 SYNC (Optional - requires boto3)
# ============================================================================

class R2Sync:
    """Sync episodes with Cloudflare R2"""

    def __init__(self, bucket: str, endpoint: str, access_key: str, secret_key: str, prefix: str = "episodes/"):
        try:
            import boto3
            self.s3 = boto3.client(
                "s3",
                endpoint_url=endpoint,
                aws_access_key_id=access_key,
                aws_secret_access_key=secret_key,
            )
            self.bucket = bucket
            self.prefix = prefix
        except ImportError:
            print("❌ boto3 not installed. Install with: pip install boto3")
            sys.exit(1)

    def upload_episodes(self, episodes_dir: Path = EPISODES_DIR) -> None:
        """Upload all episodes to R2"""
        if not episodes_dir.exists():
            print(f"❌ Episodes directory not found: {episodes_dir}")
            return

        print(f"\n📤 Uploading episodes to R2 bucket: {self.bucket}")
        print(f"   Prefix: {self.prefix}")

        uploaded = 0
        for ep_dir in episodes_dir.iterdir():
            if not ep_dir.is_dir():
                continue

            episode_id = ep_dir.name
            if episode_id in [".", ".."]:
                continue

            print(f"\n  📁 {episode_id}")

            for file_path in ep_dir.iterdir():
                if file_path.is_file():
                    key = f"{self.prefix}{episode_id}/{file_path.name}"
                    try:
                        self.s3.upload_file(
                            str(file_path),
                            self.bucket,
                            key,
                            ExtraArgs={"ContentType": self._get_content_type(file_path.name)}
                        )
                        size = format_size(file_path.stat().st_size)
                        print(f"    ✅ {file_path.name} ({size})")
                        uploaded += 1
                    except Exception as e:
                        print(f"    ❌ {file_path.name}: {e}")

        # Upload index files
        for index_file in [INDEX_JSON, LATEST_JSON]:
            if index_file.exists():
                key = f"{self.prefix}{index_file.name}"
                try:
                    self.s3.upload_file(
                        str(index_file),
                        self.bucket,
                        key,
                        ExtraArgs={"ContentType": "application/json"}
                    )
                    print(f"  ✅ {index_file.name}")
                    uploaded += 1
                except Exception as e:
                    print(f"  ❌ {index_file.name}: {e}")

        print(f"\n✅ Uploaded {uploaded} files to R2")

    def download_episodes(self, episodes_dir: Path = EPISODES_DIR) -> None:
        """Download all episodes from R2"""
        print(f"\n📥 Downloading episodes from R2 bucket: {self.bucket}")
        print(f"   Prefix: {self.prefix}")

        episodes_dir.mkdir(parents=True, exist_ok=True)

        try:
            # List all objects with prefix
            response = self.s3.list_objects_v2(Bucket=self.bucket, Prefix=self.prefix)

            if "Contents" not in response:
                print("  ℹ️  No files found in R2")
                return

            downloaded = 0
            for obj in response["Contents"]:
                key = obj["Key"]
                # Remove prefix to get relative path
                rel_path = key[len(self.prefix):]
                if not rel_path:
                    continue

                dest_path = episodes_dir / rel_path
                dest_path.parent.mkdir(parents=True, exist_ok=True)

                try:
                    self.s3.download_file(self.bucket, key, str(dest_path))
                    size = format_size(obj["Size"])
                    print(f"  ✅ {rel_path} ({size})")
                    downloaded += 1
                except Exception as e:
                    print(f"  ❌ {rel_path}: {e}")

            print(f"\n✅ Downloaded {downloaded} files from R2")

        except Exception as e:
            print(f"❌ Error listing R2 objects: {e}")

    @staticmethod
    def _get_content_type(filename: str) -> str:
        """Get content type based on file extension"""
        ext = filename.lower().split(".")[-1]
        content_types = {
            "mp4": "video/mp4",
            "mp3": "audio/mpeg",
            "txt": "text/plain",
            "json": "application/json",
            "jpg": "image/jpeg",
            "jpeg": "image/jpeg",
            "png": "image/png",
        }
        return content_types.get(ext, "application/octet-stream")


# ============================================================================
# SERIES MANAGEMENT
# ============================================================================

class SeriesManager:
    """Manage series metadata"""

    def __init__(self, episodes_dir: Path = EPISODES_DIR):
        self.episodes_dir = episodes_dir
        self.series_file = episodes_dir / "series.json"

    def list_series(self) -> List[Dict[str, Any]]:
        """List all series"""
        data = read_json(self.series_file, {"series": []})
        return data.get("series", [])

    def get_series_episodes(self, series_slug: str) -> List[Dict[str, Any]]:
        """Get all episodes in a series"""
        index = read_json(INDEX_JSON, {"episodes": []})
        episodes = [e for e in index.get("episodes", []) if e.get("series") == series_slug]
        return episodes

    def add_series(
        self,
        slug: str,
        title: str,
        description: str = "",
        cover_url: str = "",
        meta: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Add a new series"""
        data = read_json(self.series_file, {"series": []})
        series_list = data.get("series", [])

        # Check if series already exists
        existing = [s for s in series_list if s.get("slug") == slug]
        if existing:
            print(f"⚠️  Series already exists: {slug}")
            return existing[0]

        series = {
            "slug": slug,
            "title": title,
            "description": description,
            "cover_url": cover_url,
            "created_at": utc_now_iso(),
            "meta": meta or {},
        }

        series_list.append(series)
        data["series"] = series_list
        data["updated_at"] = utc_now_iso()
        write_json(self.series_file, data)

        return series

    def delete_series(self, slug: str) -> bool:
        """Delete a series (does not delete episodes)"""
        data = read_json(self.series_file, {"series": []})
        series_list = data.get("series", [])

        new_list = [s for s in series_list if s.get("slug") != slug]
        if len(new_list) == len(series_list):
            print(f"❌ Series not found: {slug}")
            return False

        data["series"] = new_list
        data["updated_at"] = utc_now_iso()
        write_json(self.series_file, data)
        return True


# ============================================================================
# CLI COMMANDS
# ============================================================================

def cmd_list(args):
    """List all episodes"""
    manager = EpisodeManager()
    episodes = manager.list_episodes()

    if not episodes:
        print("📭 No episodes found")
        return

    print(f"\n📺 Total Episodes: {len(episodes)}\n")
    print(f"{'ID':<40} {'Date':<12} {'Series':<20} {'Title'}")
    print("=" * 120)

    for ep in episodes:
        ep_id = ep.get("id", "")[:40]
        date = ep.get("date", "")[:12]
        series = ep.get("series", "")[:20]
        title = ep.get("title", "")

        print(f"{ep_id:<40} {date:<12} {series:<20} {title}")


def cmd_add(args):
    """Add a new episode"""
    manager = EpisodeManager()

    print(f"\n➕ Adding episode: {args.id}")

    # Parse meta if provided
    meta = {}
    if args.meta:
        try:
            meta = json.loads(args.meta)
        except json.JSONDecodeError:
            print(f"⚠️  Warning: Invalid JSON in --meta, ignoring")

    # Add episode
    episode = manager.add_episode(
        episode_id=args.id,
        title=args.title,
        date=args.date,
        video_path=Path(args.video) if args.video else None,
        audio_path=Path(args.audio) if args.audio else None,
        script_path=Path(args.script) if args.script else None,
        description=args.description or "",
        series=args.series or "",
        thumbnail_url=args.thumbnail or "",
        meta=meta,
    )

    print(f"\n✅ Episode added: {args.id}")
    print(f"   Title: {episode['title']}")
    print(f"   Date: {episode['date']}")
    if episode.get("series"):
        print(f"   Series: {episode['series']}")
    print(f"   Location: frontend/public/episodes/{args.id}/")


def cmd_edit(args):
    """Edit an episode"""
    manager = EpisodeManager()

    print(f"\n✏️  Editing episode: {args.id}")

    # Parse meta if provided
    meta = None
    if args.meta:
        try:
            meta = json.loads(args.meta)
        except json.JSONDecodeError:
            print(f"⚠️  Warning: Invalid JSON in --meta, ignoring")

    # Edit episode
    episode = manager.edit_episode(
        episode_id=args.id,
        title=args.title,
        description=args.description,
        date=args.date,
        series=args.series,
        thumbnail_url=args.thumbnail,
        meta=meta,
    )

    if episode:
        print(f"\n✅ Episode updated: {args.id}")
        print(f"   Title: {episode['title']}")
        print(f"   Date: {episode['date']}")
        if episode.get("series"):
            print(f"   Series: {episode['series']}")


def cmd_delete(args):
    """Delete an episode"""
    manager = EpisodeManager()

    if not args.yes:
        confirm = input(f"⚠️  Delete episode '{args.id}'? This cannot be undone. (y/N): ")
        if confirm.lower() != 'y':
            print("❌ Cancelled")
            return

    print(f"\n🗑️  Deleting episode: {args.id}")

    if manager.delete_episode(args.id):
        print(f"✅ Episode deleted: {args.id}")


def cmd_r2_upload(args):
    """Upload episodes to R2"""
    sync = R2Sync(
        bucket=args.bucket,
        endpoint=args.endpoint,
        access_key=args.access_key,
        secret_key=args.secret_key,
        prefix=args.prefix,
    )
    sync.upload_episodes()


def cmd_r2_download(args):
    """Download episodes from R2"""
    sync = R2Sync(
        bucket=args.bucket,
        endpoint=args.endpoint,
        access_key=args.access_key,
        secret_key=args.secret_key,
        prefix=args.prefix,
    )
    sync.download_episodes()


def cmd_series_list(args):
    """List all series"""
    manager = SeriesManager()
    series_list = manager.list_series()

    if not series_list:
        print("📭 No series found")
        return

    print(f"\n📚 Total Series: {len(series_list)}\n")

    for s in series_list:
        ep_manager = EpisodeManager()
        episodes = ep_manager.list_episodes()
        ep_count = len([e for e in episodes if e.get("series") == s.get("slug")])

        print(f"  {s.get('title')}")
        print(f"    Slug: {s.get('slug')}")
        print(f"    Episodes: {ep_count}")
        if s.get("description"):
            print(f"    Description: {s.get('description')}")
        print()


def cmd_series_add(args):
    """Add a new series"""
    manager = SeriesManager()

    meta = {}
    if args.meta:
        try:
            meta = json.loads(args.meta)
        except json.JSONDecodeError:
            print(f"⚠️  Warning: Invalid JSON in --meta, ignoring")

    series = manager.add_series(
        slug=args.slug,
        title=args.title,
        description=args.description or "",
        cover_url=args.cover or "",
        meta=meta,
    )

    print(f"\n✅ Series added: {args.slug}")
    print(f"   Title: {series['title']}")


def cmd_series_delete(args):
    """Delete a series"""
    manager = SeriesManager()

    if not args.yes:
        confirm = input(f"⚠️  Delete series '{args.slug}'? Episodes will not be deleted. (y/N): ")
        if confirm.lower() != 'y':
            print("❌ Cancelled")
            return

    if manager.delete_series(args.slug):
        print(f"✅ Series deleted: {args.slug}")


# ============================================================================
# MAIN
# ============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="TV.RuslanMV Admin CLI - Manage episodes, series, and sync with R2",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )

    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # LIST command
    parser_list = subparsers.add_parser("list", help="List all episodes")

    # ADD command
    parser_add = subparsers.add_parser("add", help="Add a new episode")
    parser_add.add_argument("--id", required=True, help="Episode ID (slug)")
    parser_add.add_argument("--title", required=True, help="Episode title")
    parser_add.add_argument("--date", required=True, help="Episode date (YYYY-MM-DD)")
    parser_add.add_argument("--video", help="Path to video file (mp4)")
    parser_add.add_argument("--audio", help="Path to audio file (mp3)")
    parser_add.add_argument("--script", help="Path to script file (txt)")
    parser_add.add_argument("--description", help="Episode description")
    parser_add.add_argument("--series", help="Series slug")
    parser_add.add_argument("--thumbnail", help="Thumbnail URL")
    parser_add.add_argument("--meta", help="Additional metadata (JSON string)")

    # EDIT command
    parser_edit = subparsers.add_parser("edit", help="Edit episode metadata")
    parser_edit.add_argument("--id", required=True, help="Episode ID")
    parser_edit.add_argument("--title", help="New title")
    parser_edit.add_argument("--description", help="New description")
    parser_edit.add_argument("--date", help="New date (YYYY-MM-DD)")
    parser_edit.add_argument("--series", help="New series slug")
    parser_edit.add_argument("--thumbnail", help="New thumbnail URL")
    parser_edit.add_argument("--meta", help="Additional metadata (JSON string)")

    # DELETE command
    parser_delete = subparsers.add_parser("delete", help="Delete an episode")
    parser_delete.add_argument("--id", required=True, help="Episode ID")
    parser_delete.add_argument("-y", "--yes", action="store_true", help="Skip confirmation")

    # R2 UPLOAD command
    parser_r2_upload = subparsers.add_parser("r2-upload", help="Upload episodes to R2")
    parser_r2_upload.add_argument("--bucket", required=True, help="R2 bucket name")
    parser_r2_upload.add_argument("--endpoint", required=True, help="R2 endpoint URL")
    parser_r2_upload.add_argument("--access-key", required=True, help="R2 access key")
    parser_r2_upload.add_argument("--secret-key", required=True, help="R2 secret key")
    parser_r2_upload.add_argument("--prefix", default="episodes/", help="S3 key prefix (default: episodes/)")

    # R2 DOWNLOAD command
    parser_r2_download = subparsers.add_parser("r2-download", help="Download episodes from R2")
    parser_r2_download.add_argument("--bucket", required=True, help="R2 bucket name")
    parser_r2_download.add_argument("--endpoint", required=True, help="R2 endpoint URL")
    parser_r2_download.add_argument("--access-key", required=True, help="R2 access key")
    parser_r2_download.add_argument("--secret-key", required=True, help="R2 secret key")
    parser_r2_download.add_argument("--prefix", default="episodes/", help="S3 key prefix (default: episodes/)")

    # SERIES commands
    parser_series_list = subparsers.add_parser("series-list", help="List all series")

    parser_series_add = subparsers.add_parser("series-add", help="Add a new series")
    parser_series_add.add_argument("--slug", required=True, help="Series slug")
    parser_series_add.add_argument("--title", required=True, help="Series title")
    parser_series_add.add_argument("--description", help="Series description")
    parser_series_add.add_argument("--cover", help="Cover image URL")
    parser_series_add.add_argument("--meta", help="Additional metadata (JSON string)")

    parser_series_delete = subparsers.add_parser("series-delete", help="Delete a series")
    parser_series_delete.add_argument("--slug", required=True, help="Series slug")
    parser_series_delete.add_argument("-y", "--yes", action="store_true", help="Skip confirmation")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return

    # Execute command
    commands = {
        "list": cmd_list,
        "add": cmd_add,
        "edit": cmd_edit,
        "delete": cmd_delete,
        "r2-upload": cmd_r2_upload,
        "r2-download": cmd_r2_download,
        "series-list": cmd_series_list,
        "series-add": cmd_series_add,
        "series-delete": cmd_series_delete,
    }

    if args.command in commands:
        try:
            commands[args.command](args)
        except KeyboardInterrupt:
            print("\n\n❌ Cancelled by user")
            sys.exit(1)
        except Exception as e:
            print(f"\n❌ Error: {e}")
            import traceback
            traceback.print_exc()
            sys.exit(1)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
