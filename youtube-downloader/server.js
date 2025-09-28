const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'build')));

// Create downloads directory if it doesn't exist
const downloadsDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}

// Get video info endpoint
app.post('/api/get-info', async (req, res) => {
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
    res.status(500).json({ error: 'Failed to get video info' });
  }
});

// Download video endpoint
app.post('/api/download', async (req, res) => {
  try {
    const { url, format, quality } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    // Get video title for filename
    const infoCommand = `yt-dlp --get-title "${url}"`;
    const { stdout: title } = await execAsync(infoCommand);
    const safeTitle = title.trim().replace(/[^\w\s-]/g, '').trim();
    
    let filename = `${safeTitle}.${format}`;
    let filepath = path.join(downloadsDir, filename);

    // Clean up old files
    const files = fs.readdirSync(downloadsDir);
    files.forEach(file => {
      if (file.startsWith(safeTitle)) {
        fs.unlinkSync(path.join(downloadsDir, file));
      }
    });

    let command;
    if (format === 'mp3') {
      // Download as MP3
      command = `yt-dlp -x --audio-format mp3 --audio-quality 192K -o "${path.join(downloadsDir, safeTitle)}.%(ext)s" "${url}"`;
    } else {
      // Download as video - use a very flexible approach
      let qualityOption = '';
      if (quality === 'best') {
        qualityOption = '-f "best"';
      } else if (quality === 'worst') {
        qualityOption = '-f "worst"';
      } else {
        const height = quality.replace('p', '');
        qualityOption = `-f "best[height<=${height}]/best"`;
      }
      command = `yt-dlp ${qualityOption} -o "${path.join(downloadsDir, safeTitle)}.%(ext)s" "${url}"`;
    }

    await execAsync(command);

    // Find the downloaded file
    const downloadedFiles = fs.readdirSync(downloadsDir);
    const downloadedFile = downloadedFiles.find(file => file.startsWith(safeTitle));
    
    if (!downloadedFile) {
      throw new Error('File not found after download');
    }

    const finalPath = path.join(downloadsDir, downloadedFile);
    const finalFilename = `${safeTitle}.${format}`;

    // Send file
    res.download(finalPath, finalFilename, (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(500).json({ error: 'Download failed' });
      } else {
        // Clean up file after download
        setTimeout(() => {
          if (fs.existsSync(finalPath)) {
            fs.unlinkSync(finalPath);
          }
        }, 5000);
      }
    });

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Download failed' });
  }
});

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

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Make sure you have ffmpeg installed for MP3 conversion`);
});