const express = require('express');
const LinkedInScraper = require('../services/LinkedInScraper');
const HiringIntentDetector = require('../utils/HiringIntentDetector');

const router = express.Router();

// POST /api/scrape
router.post('/', async (req, res) => {
  try {
    const { email, password, role, location, timeRange, maxResults = 10 } = req.body;

    // Validation
    if (!email || !password || !role || !location || !timeRange) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: email, password, role, location, timeRange'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters'
      });
    }

    // Role and location validation
    if (!role.trim() || !location.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Role and location must be non-empty strings'
      });
    }

    // Time range validation
    const validTimeRanges = ['Last 24 hours', 'Last Week', 'Last Month'];
    if (!validTimeRanges.includes(timeRange)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid time range. Must be one of: Last 24 hours, Last Week, Last Month'
      });
    }

    // Max results validation
    if (maxResults < 1 || maxResults > 50) {
      return res.status(400).json({
        success: false,
        error: 'maxResults must be between 1 and 50'
      });
    }

    // DEMO MODE: Return mock data for testing
    if (email === 'demo@example.com' && password === 'demo123') {
      console.log('Demo mode activated - returning mock data');
      const mockResults = [
        {
          id: 'demo-post-1',
          posterName: 'Sarah Johnson',
          posterTitle: 'Senior Recruiter at TechCorp',
          jobTitle: role,
          location: location,
          datePosted: new Date().toISOString(),
          hiringIntent: `We're hiring a ${role}! 3+ years experience required. Join our amazing team. Apply now!`,
          postUrl: 'https://www.linkedin.com/posts/demo-1'
        },
        {
          id: 'demo-post-2',
          posterName: 'Michael Chen',
          posterTitle: 'HR Manager at DataTech Solutions',
          jobTitle: role,
          location: location,
          datePosted: new Date(Date.now() - 86400000).toISOString(),
          hiringIntent: `Looking for a talented ${role} to join our team in ${location}. Great benefits and growth opportunities!`,
          postUrl: 'https://www.linkedin.com/posts/demo-2'
        },
        {
          id: 'demo-post-3',
          posterName: 'Emily Rodriguez',
          posterTitle: 'Talent Acquisition Lead at InnovateCo',
          jobTitle: role,
          location: location,
          datePosted: new Date(Date.now() - 172800000).toISOString(),
          hiringIntent: `Exciting opportunity! We're hiring for ${role} position. Remote work available. DM me to apply!`,
          postUrl: 'https://www.linkedin.com/posts/demo-3'
        },
        {
          id: 'demo-post-4',
          posterName: 'David Park',
          posterTitle: 'Founder & CEO at StartupXYZ',
          jobTitle: role,
          location: location,
          datePosted: new Date(Date.now() - 259200000).toISOString(),
          hiringIntent: `Join our team! ${role} needed urgently. Competitive salary and equity. Apply today!`,
          postUrl: 'https://www.linkedin.com/posts/demo-4'
        },
        {
          id: 'demo-post-5',
          posterName: 'Lisa Thompson',
          posterTitle: 'Head of People Operations at CloudTech',
          jobTitle: role,
          location: location,
          datePosted: new Date(Date.now() - 345600000).toISOString(),
          hiringIntent: `We're expanding! Looking for experienced ${role} professionals. Great company culture. Apply now!`,
          postUrl: 'https://www.linkedin.com/posts/demo-5'
        }
      ];

      // Return only the requested number of results
      const limitedResults = mockResults.slice(0, Math.min(maxResults, mockResults.length));

      return res.status(200).json({
        success: true,
        count: limitedResults.length,
        results: limitedResults
      });
    }

    // Get browser instance
    const browser = req.app.locals.getBrowser();
    if (!browser) {
      return res.status(500).json({
        success: false,
        error: 'Browser not initialized. Please try again.'
      });
    }

    // Set timeout for request
    const timeoutId = setTimeout(() => {
      return res.status(408).json({
        success: false,
        error: 'Search timeout. Try narrower criteria.'
      });
    }, 60000);

    // Create scraper instance
    const scraper = new LinkedInScraper(browser);

    // Perform scraping
    const result = await scraper.scrape(
      { email, password },
      { role, location, timeRange, maxResults }
    );

    clearTimeout(timeoutId);

    // Check for errors from scraper
    if (!result.success) {
      // Map error to appropriate status code
      let statusCode = 500;
      if (result.error.includes('authentication failed') || result.error.includes('credentials')) {
        statusCode = 401;
      } else if (result.error.includes('CAPTCHA')) {
        statusCode = 401;
      } else if (result.error.includes('timeout')) {
        statusCode = 408;
      } else if (result.error.includes('rate limit')) {
        statusCode = 429;
      }

      return res.status(statusCode).json({
        success: false,
        error: result.error
      });
    }

    // Filter for hiring intent
    const hiringIntentDetector = new HiringIntentDetector();
    const filteredPosts = hiringIntentDetector.filterHiringPosts(result.posts);

    // Check if any posts found after filtering
    if (filteredPosts.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No hiring posts found for your criteria.'
      });
    }

    // Return success response
    return res.status(200).json({
      success: true,
      count: filteredPosts.length,
      results: filteredPosts
    });

  } catch (error) {
    console.error('Error in scrape route:', error.message);
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred. Try again.'
    });
  }
});

module.exports = router;
