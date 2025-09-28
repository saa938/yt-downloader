# YouTube Downloader

A modern web application for downloading YouTube videos as MP3 or MP4 files. Built with React and Node.js.

## Features

- 🎥 Download YouTube videos as MP4
- 🎵 Convert and download as MP3 audio
- 📱 Responsive design that works on all devices
- ⚡ Fast and efficient downloading
- 🎨 Modern, beautiful UI with glassmorphism effects
- 🔧 Quality selection (Best, 720p, 480p, 360p, 240p)

## Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (version 14 or higher)
- npm or yarn
- FFmpeg (for MP3 conversion)

### Installing FFmpeg

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg
```

**macOS:**
```bash
brew install ffmpeg
```

**Windows:**
Download from [https://ffmpeg.org/download.html](https://ffmpeg.org/download.html) and add to PATH.

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd youtube-downloader
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

### Development Mode

To run both frontend and backend simultaneously:
```bash
npm run dev
```

This will start:
- React development server on http://localhost:3000
- Express server on http://localhost:5000

### Production Mode

1. Build the React app:
```bash
npm run build
```

2. Start the server:
```bash
npm run server
```

The application will be available at http://localhost:5000

## Usage

1. Open the application in your web browser
2. Paste a YouTube URL in the input field
3. Choose your preferred format (MP3 or MP4)
4. Select the quality you want
5. Click "Get Video Info" to preview the video details
6. Click "Download" to start the download

## API Endpoints

- `POST /api/get-info` - Get video information
- `POST /api/download` - Download video/audio file

## Technical Details

- **Frontend**: React with TypeScript
- **Backend**: Node.js with Express
- **Video Processing**: ytdl-core for YouTube video extraction
- **Audio Conversion**: FFmpeg for MP3 conversion
- **Styling**: Custom CSS with glassmorphism design

## Troubleshooting

### Common Issues

1. **"FFmpeg not found" error**: Make sure FFmpeg is installed and available in your PATH
2. **Download fails**: Check if the YouTube URL is valid and accessible
3. **CORS errors**: Ensure the backend server is running on port 5000

### Performance Notes

- Large video files may take time to download
- MP3 conversion requires additional processing time
- The application automatically cleans up temporary files after download

## License

This project is for educational purposes only. Please respect YouTube's Terms of Service and copyright laws when using this application.

## Contributing

Feel free to submit issues and enhancement requests!