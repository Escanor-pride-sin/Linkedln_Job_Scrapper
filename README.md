# LinkedIn Job Post Scraper

A web application that searches LinkedIn posts (not job boards) for hiring intent, filters by role and location, and exports results to Excel.

## Features

- Search LinkedIn posts with hiring language
- Filter by location, role, and posting date
- Distinguish between hiring posts and job seekers
- Display results in sortable table
- Export to formatted Excel file (.xlsx)
- Limit results (default: 10, max: 50)

## Tech Stack

**Frontend:**
- React 18
- Axios for API calls
- CSS for styling

**Backend:**
- Node.js with Express
- Puppeteer for browser automation
- ExcelJS for Excel generation
- CORS enabled

## Prerequisites

- Node.js 16+ and npm
- 2GB+ free RAM (for Puppeteer)
- Internet connection
- Valid LinkedIn account

## Installation

### 1. Clone Repository

```bash
cd Linkedln_Job_Scrapper
```

### 2. Install Dependencies

**Option A - Install all at once:**
```bash
npm run install-all
```

**Option B - Install separately:**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env` if needed (defaults should work for local development):
```
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
PUPPETEER_HEADLESS=true
```

## Running the Application

### Option A - Run both together

From repository root:
```bash
npm run dev
```

This requires `concurrently` to be installed (included in root package.json).

### Option B - Run separately in two terminals

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
# Server starts on http://localhost:5000
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm start
# Opens browser at http://localhost:3000
```

## Usage

1. Open http://localhost:3000 in your browser
2. Enter your LinkedIn credentials (used only for this session, not stored)
3. Fill in search parameters:
   - **Job Role**: e.g., "Data Analyst", "Software Engineer"
   - **Location**: e.g., "Bangalore", "London", "Remote"
   - **Time Range**: "Last 24 hours", "Last Week", or "Last Month"
   - **Max Results**: 1-50 (default: 10)
4. Click "Search LinkedIn Posts"
5. Wait 15-30 seconds for results
6. Sort results by clicking column headers
7. Click "Export to Excel" to download .xlsx file

## How It Works

1. **Authentication**: Puppeteer logs into LinkedIn with your credentials
2. **Search**: Constructs search query with role, location, and hiring keywords
3. **Extraction**: Scrapes post data (poster, date, content, URL)
4. **Filtering**: Uses hiring intent detection to exclude job seekers
5. **Display**: Shows results in sortable table
6. **Export**: Generates formatted Excel file on demand

## Hiring Intent Detection

The app filters posts to **include** those with:
- "we're hiring", "join our team", "now hiring"
- "looking for a [role]", "seeking a [role]"
- "apply now", "DM me to apply"
- Poster is recruiter/HR/founder

And **excludes** posts with:
- "I'm looking for", "seeking opportunities"
- "open to work", "anyone hiring"
- Job seeker language

## Project Structure

```
Linkedln_Job_Scrapper/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── scrape.js       # POST /api/scrape endpoint
│   │   │   └── export.js       # POST /api/export endpoint
│   │   ├── services/
│   │   │   └── LinkedInScraper.js  # Puppeteer scraping logic
│   │   ├── utils/
│   │   │   ├── HiringIntentDetector.js  # Filtering logic
│   │   │   └── ExcelExporter.js         # Excel generation
│   │   └── server.js           # Express server
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── SearchForm.jsx
│   │   │   ├── ResultsTable.jsx
│   │   │   └── ErrorMessage.jsx
│   │   ├── services/
│   │   │   └── api.js          # Backend API calls
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   ├── public/
│   │   └── index.html
│   └── package.json
├── package.json               # Root workspace config
└── README.md
```

## API Endpoints

### POST /api/scrape

Search LinkedIn for hiring posts.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password",
  "role": "Data Analyst",
  "location": "Bangalore",
  "timeRange": "Last 24 hours",
  "maxResults": 10
}
```

**Response (200):**
```json
{
  "success": true,
  "count": 8,
  "results": [
    {
      "id": "unique-id",
      "posterName": "John Smith",
      "posterTitle": "Recruiter at TechCorp",
      "jobTitle": "Data Analyst",
      "location": "Bangalore, India",
      "datePosted": "2025-10-28T10:30:00Z",
      "hiringIntent": "We're hiring a Data Analyst! 3+ years exp...",
      "postUrl": "https://www.linkedin.com/posts/..."
    }
  ]
}
```

**Error Responses:**
- **400**: Invalid parameters
- **401**: Authentication failed
- **404**: No posts found
- **408**: Search timeout
- **429**: Rate limit reached
- **500**: Server error

### POST /api/export

Generate Excel file from results.

**Request:**
```json
{
  "results": [...]  // Array of post objects
}
```

**Response (200):**
- Binary Excel file (.xlsx)
- Filename: `linkedin-jobs-{timestamp}.xlsx`

## Troubleshooting

### Puppeteer Can't Launch Browser (Linux)

Install required dependencies:
```bash
sudo apt-get install -y libx11-xcb1 libxcomposite1 libxcursor1 libxdamage1 libxi6 libxtst6 libnss3 libcups2 libxss1 libxrandr2 libasound2 libpangocairo-1.0-0 libatk1.0-0 libatk-bridge2.0-0 libgtk-3-0
```

### CAPTCHA Detected

LinkedIn may show CAPTCHA if:
- Too many searches in short time
- Unusual activity detected

**Solution**: Wait 30+ minutes, or log into LinkedIn manually to verify account.

### Port Already in Use

Change port in `backend/.env`:
```
PORT=5001
```

### No Results Found

- Try broader search terms
- Expand time range
- Check role/location spelling
- Verify there are recent posts matching criteria

## Security Notes

- Credentials are sent directly to LinkedIn (not stored anywhere)
- Never logged or saved in backend
- Used only for current search session
- Cleared from memory after use

## Limitations

- Maximum 50 results per search
- Two-factor authentication (2FA) not supported
- Requires valid LinkedIn account
- Subject to LinkedIn's rate limiting
- May trigger CAPTCHA with frequent use

## Future Enhancements

- Persistent login sessions (session cookies)
- Scheduled/automated scraping
- Email notifications for new posts
- 2FA support
- Google Sheets export
- Advanced filtering (salary, company size)

## License

MIT

## Contributing

Pull requests welcome. For major changes, please open an issue first.

## Support

For issues or questions, please open an issue on GitHub.
