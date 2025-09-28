const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

const execAsync = promisify(exec);

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
    
    // Use /tmp directory for serverless environment
    const tmpDir = '/tmp';
    let filename = `${safeTitle}.${format}`;
    let filepath = path.join(tmpDir, filename);

    // Clean up old files in tmp
    try {
      const files = fs.readdirSync(tmpDir);
      files.forEach(file => {
        if (file.startsWith(safeTitle)) {
          fs.unlinkSync(path.join(tmpDir, file));
        }
      });
    } catch (e) {
      // Ignore cleanup errors
    }

    let command;
    if (format === 'mp3') {
      // Download as MP3
      command = `yt-dlp -x --audio-format mp3 --audio-quality 192K -o "${path.join(tmpDir, safeTitle)}.%(ext)s" "${url}"`;
    } else {
      // Download as video
      let qualityOption = '';
      if (quality === 'best') {
        qualityOption = '-f "best"';
      } else if (quality === 'worst') {
        qualityOption = '-f "worst"';
      } else {
        const height = quality.replace('p', '');
        qualityOption = `-f "best[height<=${height}]/best"`;
      }
      command = `yt-dlp ${qualityOption} -o "${path.join(tmpDir, safeTitle)}.%(ext)s" "${url}"`;
    }

    await execAsync(command);

    // Find the downloaded file
    const downloadedFiles = fs.readdirSync(tmpDir);
    const downloadedFile = downloadedFiles.find(file => file.startsWith(safeTitle));
    
    if (!downloadedFile) {
      throw new Error('File not found after download');
    }

    const finalPath = path.join(tmpDir, downloadedFile);
    const finalFilename = `${safeTitle}.${format}`;

    // Read file and send as response
    const fileBuffer = fs.readFileSync(finalPath);
    
    // Set appropriate headers
    res.setHeader('Content-Type', format === 'mp3' ? 'audio/mpeg' : 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="${finalFilename}"`);
    res.setHeader('Content-Length', fileBuffer.length);
    
    // Clean up file
    try {
      fs.unlinkSync(finalPath);
    } catch (e) {
      // Ignore cleanup errors
    }

    res.send(fileBuffer);

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Download failed. Make sure yt-dlp and ffmpeg are available.' });
  }
}