import React, { useState } from 'react';
import './App.css';

interface VideoInfo {
  title: string;
  duration: string;
  thumbnail: string;
  formats: Array<{
    format_id: string;
    ext: string;
    resolution: string;
    filesize: number;
    quality: string;
  }>;
}

function App() {
  const [url, setUrl] = useState('');
  const [format, setFormat] = useState<'mp3' | 'mp4'>('mp4');
  const [quality, setQuality] = useState('best');
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGetInfo = async () => {
    if (!url) {
      setError('Please enter a YouTube URL');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/get-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get video info');
      }

      const data = await response.json();
      setVideoInfo(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!url || !videoInfo) {
      setError('Please get video info first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, format, quality }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Download failed');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${videoInfo.title}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>YouTube Downloader</h1>
        <p>Download YouTube videos as MP3 or MP4</p>
      </header>

      <main className="main-content">
        <div className="input-section">
          <div className="input-group">
            <label htmlFor="url">YouTube URL:</label>
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="url-input"
            />
          </div>

          <div className="format-group">
            <label>Format:</label>
            <div className="format-options">
              <label className="format-option">
                <input
                  type="radio"
                  value="mp4"
                  checked={format === 'mp4'}
                  onChange={(e) => setFormat(e.target.value as 'mp4')}
                />
                MP4 (Video)
              </label>
              <label className="format-option">
                <input
                  type="radio"
                  value="mp3"
                  checked={format === 'mp3'}
                  onChange={(e) => setFormat(e.target.value as 'mp3')}
                />
                MP3 (Audio)
              </label>
            </div>
          </div>

          <div className="quality-group">
            <label htmlFor="quality">Quality:</label>
            <select
              id="quality"
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
              className="quality-select"
            >
              <option value="best">Best</option>
              <option value="worst">Worst</option>
              <option value="720p">720p</option>
              <option value="480p">480p</option>
              <option value="360p">360p</option>
              <option value="240p">240p</option>
            </select>
          </div>

          <div className="button-group">
            <button
              onClick={handleGetInfo}
              disabled={loading}
              className="btn btn-info"
            >
              {loading ? 'Getting Info...' : 'Get Video Info'}
            </button>
            <button
              onClick={handleDownload}
              disabled={loading || !videoInfo}
              className="btn btn-download"
            >
              {loading ? 'Downloading...' : 'Download'}
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}
        </div>

        {videoInfo && (
          <div className="video-info">
            <h3>Video Information</h3>
            <div className="video-details">
              <img
                src={videoInfo.thumbnail}
                alt="Video thumbnail"
                className="thumbnail"
              />
              <div className="video-meta">
                <h4>{videoInfo.title}</h4>
                <p>Duration: {videoInfo.duration}</p>
                <p>Format: {format.toUpperCase()}</p>
                <p>Quality: {quality}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
