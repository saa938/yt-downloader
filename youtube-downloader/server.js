const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Import serverless function handlers
const getInfoHandler = require('../api/get-info.js');
const downloadHandler = require('../api/download.js');

// API Routes
app.post('/api/get-info', async (req, res) => {
  try {
    await getInfoHandler.default(req, res);
  } catch (error) {
    console.error('Error in get-info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/download', async (req, res) => {
  try {
    await downloadHandler.default(req, res);
  } catch (error) {
    console.error('Error in download:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'build')));

// Catch all handler: send back React's index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});