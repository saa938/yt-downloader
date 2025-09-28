const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Helper function to format duration
function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate YouTube URL
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    // Get video info using yt-dlp
    const command = `yt-dlp --dump-json --no-download "${url}"`;
    const { stdout } = await execAsync(command);
    const info = JSON.parse(stdout);

    const videoInfo = {
      title: info.title,
      duration: formatDuration(info.duration),
      thumbnail: info.thumbnail,
      formats: info.formats
        .filter(format => format.vcodec !== 'none' || format.acodec !== 'none')
        .map(format => ({
          format_id: format.format_id,
          ext: format.ext,
          resolution: format.resolution || 'audio',
          filesize: format.filesize || 0,
          quality: format.quality || 'audio'
        }))
    };

    res.json(videoInfo);
  } catch (error) {
    console.error('Error getting video info:', error);
    res.status(500).json({ error: 'Failed to get video info. Make sure yt-dlp is installed.' });
  }
}