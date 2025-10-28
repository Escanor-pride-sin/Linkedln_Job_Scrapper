require('dotenv').config();
const express = require('express');
const cors = require('cors');
const scrapeRoute = require('./routes/scrape');
const exportRoute = require('./routes/export');

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/scrape', scrapeRoute);
app.use('/api/export', exportRoute);

// Global browser instance
let browserInstance = null;

// Initialize browser on startup
const initBrowser = async () => {
  try {
    const puppeteer = require('puppeteer');
    browserInstance = await puppeteer.launch({
      headless: process.env.PUPPETEER_HEADLESS !== 'false',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      defaultViewport: { width: 1920, height: 1080 }
    });
    console.log('Browser instance initialized');
  } catch (error) {
    console.error('Failed to initialize browser:', error.message);
  }
};

// Export browser getter
app.locals.getBrowser = () => browserInstance;

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'An unexpected error occurred. Try again.'
  });
});

// Graceful shutdown
const shutdown = async () => {
  console.log('Shutting down gracefully...');
  if (browserInstance) {
    await browserInstance.close();
    console.log('Browser closed');
  }
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start server
const startServer = async () => {
  await initBrowser();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
