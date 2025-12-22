# Video Management Studio Guide

A comprehensive YouTube Studio-style interface for managing your TV.RuslanMV video content.

## Overview

The Video Management Studio (`/manage_videos.html`) provides a professional, feature-rich interface for managing all aspects of your video content, modeled after YouTube Studio's Content tab.

## Features

### 📹 Content Manager
- **Video Library**: Browse all published videos in a data table format
- **Advanced Filtering**: Search and filter videos by title, description, visibility, and more
- **Batch Operations**: Select multiple videos for bulk actions
- **Real-time Stats**: View views, comments, and likes for each video

### ✏️ Video Details Editor
Full-screen editor overlay for comprehensive video editing:
- **Title & Description**: Edit video metadata with character counters
- **Thumbnails**: Select or upload custom thumbnails
- **Visibility Settings**:
  - Private (only you can view)
  - Unlisted (anyone with link)
  - Public (everyone can watch)
- **Tags & Series**: Organize videos with tags and assign to series
- **Live Preview**: See changes in real-time

### 📊 Analytics Dashboard
- **Overview Metrics**: Total views, watch time, total videos, avg duration
- **Views Chart**: Interactive Chart.js visualization of views over time
- **Top Content**: See your best performing videos

### 💬 Comments Manager
- **Comment Review**: View and manage all video comments
- **Quick Actions**: Like, reply, or flag comments
- **Video Context**: See which video each comment belongs to

### 📺 Content Tabs
- **Videos**: Main video library (default view)
- **Live**: Schedule and manage live streams (coming soon)
- **Playlists**: Organize videos into playlists/series
- **Podcasts**: Audio content management (coming soon)

### ⚙️ Settings
- **General Settings**: Default visibility, appearance (light/dark)
- **Channel Settings**: Configure channel-wide preferences
- **Upload Defaults**: Set default metadata for new uploads
- **Permissions**: Manage access control (coming soon)

## How to Access

### From Admin Dashboard
1. Navigate to `/admin`
2. Click **"Video Studio"** in the sidebar
   OR
3. Click **"Manage All Videos"** link in the Recent Uploads section

### Direct Access
Navigate directly to: `https://your-domain.com/manage_videos.html`

## Interface Tour

### Main Navigation
```
├── Dashboard (link back to admin)
├── Content ✓ (default view)
├── Analytics
├── Comments
└── Settings
```

### Content View Tabs
```
Content
├── Videos (main table)
├── Live (streaming)
├── Playlists (series organization)
└── Podcasts (audio content)
```

## Using the Video Editor

### Opening the Editor
1. Click anywhere on a video row in the table
   OR
2. Click the pencil (✏️) icon in the row actions

### Editor Sections

**Left Panel - Edit Form:**
- Title (required, max 100 chars)
- Description (max 5000 chars)
- Thumbnails (select or upload)
- Tags (comma-separated)
- Series assignment

**Right Panel - Preview & Settings:**
- Visibility options
- Live video preview
- Video ID reference

### Saving Changes
1. Make your edits
2. Click **"SAVE"** in the top-right
3. Changes are applied (in production, this would update the backend)

### Undoing Changes
Click **"UNDO CHANGES"** to reset the form to original values

### Closing Editor
Click the back arrow (←) or ESC key

## Video Table Features

### Row Actions
Hover over any video row to reveal action buttons:
- **Edit (✏️)**: Open video editor
- **Analytics (📊)**: View detailed stats
- **Comments (💬)**: Jump to comments for this video

### Bulk Selection
- Check the checkbox in the header row to select all
- Check individual video checkboxes for batch operations
- Actions available: Delete, Change visibility, Add to playlist

### Sorting & Filtering
- **Search Bar**: Filter by title or description
- **Filter Chips**:
  - Visibility (Public, Unlisted, Private)
  - Views (High to Low, Low to High)
  - Date (Newest, Oldest)

## Analytics Features

### Metric Cards
- **Views**: Total views with % change
- **Watch Time**: Total hours watched
- **Total Videos**: Count of published content
- **Avg Duration**: Average view duration

### Views Chart
- Interactive line chart powered by Chart.js
- Shows views over last 28 days
- Hover for exact values

### Top Content
- Ranked list of best-performing videos
- Sortable by views, watch time, engagement

## Integration with Backend

### Current State (Demo)
The video manager currently uses:
- Sample data for demonstration
- Local state management
- Simulated API calls

### Production Integration

To connect with your backend:

1. **Load Videos**: Update `loadVideosFromAPI()` function
```javascript
async function loadVideosFromAPI() {
    const response = await fetch('/api/episodes');
    const data = await response.json();
    videosData = data.episodes;
    renderVideosTable();
}
```

2. **Save Video**: Update `saveVideoDetails()` function
```javascript
async function saveVideoDetails() {
    const videoId = document.getElementById('edit-video-id').value;
    const updates = { title, description, visibility, ... };

    await fetch(`/api/episodes/${videoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
    });

    closeEditor();
    loadVideosFromAPI(); // Refresh
}
```

3. **Delete Video**: Implement delete endpoint
```javascript
async function deleteVideo(videoId) {
    await fetch(`/api/episodes/${videoId}`, {
        method: 'DELETE'
    });
    loadVideosFromAPI(); // Refresh
}
```

## Using with CLI Admin Tool

The Video Management Studio integrates seamlessly with the CLI admin tool:

### Workflow Example

1. **Generate video** using pipeline:
```bash
python scripts/generate_video.py
```

2. **Publish** using CLI:
```bash
python tv_admin_cli.py add \
  --id "2025-12-22-daily-ai-news" \
  --title "Daily AI News" \
  --date "2025-12-22" \
  --video output/episode_video.mp4 \
  --series "daily-ai-news"
```

3. **Manage** in Video Studio:
   - Open `/manage_videos.html`
   - Edit metadata, thumbnails, tags
   - Update visibility settings
   - Review analytics

4. **Sync to R2** (optional):
```bash
python tv_admin_cli.py r2-upload --bucket YOUR_BUCKET ...
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `ESC` | Close video editor |
| `Ctrl/Cmd + S` | Save changes (when editor open) |
| `Ctrl/Cmd + F` | Focus search bar |
| `Ctrl/Cmd + A` | Select all videos |

## Mobile Responsiveness

The interface is optimized for desktop use but includes:
- Responsive grid layouts
- Touch-friendly buttons
- Scrollable content areas
- Mobile navigation menu (collapsible sidebar)

## Browser Compatibility

Tested and supported on:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Opera (latest)

Requires:
- JavaScript enabled
- Modern CSS support (flexbox, grid)
- Fetch API support

## Customization

### Styling
The interface uses Tailwind CSS configuration:
```javascript
// Colors can be customized in the <script> tag
tailwind.config = {
  theme: {
    extend: {
      colors: {
        accent: "#065fd4",  // Change primary color
        danger: "#cc0000",  // Change warning color
        // ... more colors
      }
    }
  }
}
```

### Adding Custom Tabs
To add new content tabs:
```javascript
// 1. Add tab button
<button onclick="switchContentTab('custom')" id="tab-btn-custom">
  Custom Tab
</button>

// 2. Add tab content
<div id="tab-custom" class="hidden content-tab">
  <!-- Your content here -->
</div>
```

## Performance Optimization

For large video libraries (1000+ videos):

1. **Pagination**: Add server-side pagination
```javascript
async function loadVideosFromAPI(page = 1, limit = 50) {
    const response = await fetch(`/api/episodes?page=${page}&limit=${limit}`);
    // ...
}
```

2. **Virtual Scrolling**: Use libraries like `react-window` for large tables

3. **Lazy Loading**: Load thumbnails on demand
```javascript
<img loading="lazy" src="${video.thumbnail}">
```

## Troubleshooting

### Videos Not Loading
- Check console for API errors
- Verify `/api/episodes` endpoint is accessible
- Ensure CORS is properly configured

### Editor Not Opening
- Check browser console for JavaScript errors
- Verify video ID exists in data
- Clear browser cache and reload

### Charts Not Rendering
- Ensure Chart.js is loaded: `<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>`
- Check that Analytics view is active
- Verify canvas element exists

### Styling Issues
- Ensure Tailwind CSS is loaded
- Check for conflicting CSS
- Verify browser compatibility

## Future Enhancements

Planned features for future releases:

- [ ] **Drag & Drop Upload**: Direct file upload in interface
- [ ] **Batch Editing**: Edit multiple videos at once
- [ ] **Advanced Analytics**: More detailed metrics and reports
- [ ] **Live Streaming**: Full live stream management
- [ ] **Playlist Editor**: Drag-and-drop playlist organization
- [ ] **Comments Moderation**: Advanced filtering and auto-moderation
- [ ] **Scheduled Publishing**: Set publish dates in advance
- [ ] **Transcript Editor**: Edit auto-generated captions
- [ ] **A/B Testing**: Test different thumbnails/titles
- [ ] **Revenue Reports**: Detailed monetization analytics

## Best Practices

1. **Regular Metadata Updates**: Keep titles and descriptions current
2. **Optimize Thumbnails**: Use high-quality, relevant images
3. **Tag Consistently**: Use consistent tagging strategy for discoverability
4. **Monitor Analytics**: Review performance weekly
5. **Engage with Comments**: Respond promptly to viewer feedback
6. **Organize with Series**: Group related content into series/playlists
7. **Set Appropriate Visibility**: Use Private for drafts, Unlisted for sharing, Public for publishing

## Support

For issues or questions:
- Check the [ADMIN_ANALYSIS.md](ADMIN_ANALYSIS.md) for architecture details
- Review [CLI_ADMIN_GUIDE.md](CLI_ADMIN_GUIDE.md) for CLI integration
- Open an issue on GitHub

---

**Enjoy managing your video content! 📹🎬**
