# Deployment Guide - LinkedIn Job Scraper

## GitHub Repository

Your code is available at: **https://github.com/Escanor-pride-sin/Linkedln_Job_Scrapper**

---

## Recommended Deployment Options

This is a full-stack application with:
- **Frontend**: React application
- **Backend**: Node.js + Express + Puppeteer (needs server environment)

### ⚠️ Important Notes

- **Puppeteer** requires a server with Chrome/Chromium installed
- **Free tier** hosting works, but has limitations
- **Backend must support headless browser** automation

---

## Option 1: Render.com (Recommended - Best for Puppeteer)

**Why Render?**
- ✅ Free tier available
- ✅ Native Puppeteer support
- ✅ Automatic deployments from GitHub
- ✅ Easy environment variable management

### Steps:

1. **Go to [Render.com](https://render.com)** and sign up

2. **Deploy Backend:**
   - Click "New +" → "Web Service"
   - Connect your GitHub: `Escanor-pride-sin/Linkedln_Job_Scrapper`
   - Settings:
     - **Name**: `linkedin-scraper-backend`
     - **Root Directory**: `backend`
     - **Environment**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Plan**: Free

   - **Environment Variables** (Add these):
     ```
     NODE_ENV=production
     PORT=5000
     PUPPETEER_HEADLESS=true
     FRONTEND_URL=https://your-frontend-url.vercel.app
     ```

   - Click "Create Web Service"
   - Wait 5-10 minutes for deployment
   - **Save your backend URL**: `https://linkedin-scraper-backend.onrender.com`

3. **Deploy Frontend:**
   - Use Vercel (see Option 2 below)
   - Or deploy frontend on Render too (similar steps)

---

## Option 2: Vercel (Frontend) + Render (Backend)

### Deploy Frontend on Vercel:

1. **Go to [Vercel.com](https://vercel.com)** and sign up

2. **Import GitHub Repository:**
   - Click "Add New" → "Project"
   - Import: `Escanor-pride-sin/Linkedln_Job_Scrapper`
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

3. **Environment Variables:**
   ```
   REACT_APP_API_URL=https://linkedin-scraper-backend.onrender.com
   ```
   (Use the backend URL from Render)

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - **Your frontend URL**: `https://linkedin-scraper.vercel.app`

### Update Backend CORS:

Go back to Render backend settings and update:
```
FRONTEND_URL=https://linkedin-scraper.vercel.app
```

---

## Option 3: Railway.app (Alternative to Render)

**Why Railway?**
- ✅ Free $5 credit monthly
- ✅ Supports Puppeteer
- ✅ Easy GitHub integration

### Steps:

1. **Go to [Railway.app](https://railway.app)** and sign up

2. **New Project** → "Deploy from GitHub repo"

3. **Deploy Backend:**
   - Select: `Linkedln_Job_Scrapper`
   - Root directory: `backend`
   - Add environment variables (same as Render)

4. **Deploy Frontend:**
   - Can use Railway or Vercel

---

## Option 4: Fly.io (Advanced Users)

**Why Fly.io?**
- ✅ Free tier includes persistent apps
- ✅ Full Docker support
- ✅ Great for Puppeteer

### Steps:

1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`

2. Login: `flyctl auth login`

3. **Deploy Backend:**
   ```bash
   cd backend
   flyctl launch
   ```

4. **Deploy Frontend:**
   - Use Vercel (easier) or deploy to Fly.io

---

## Option 5: Heroku (Classic Option)

**Note**: Heroku removed free tier, but still popular.

### Steps:

1. **Install Heroku CLI**

2. **Create Heroku app:**
   ```bash
   heroku create linkedin-scraper-backend
   ```

3. **Add Puppeteer buildpack:**
   ```bash
   heroku buildpacks:add jontewks/puppeteer
   heroku buildpacks:add heroku/nodejs
   ```

4. **Deploy:**
   ```bash
   git subtree push --prefix backend heroku main
   ```

---

## Quick Start - Easiest Path

### Step-by-Step (5 minutes):

1. **Deploy Backend to Render:**
   - Sign up at render.com
   - New Web Service → Connect GitHub
   - Select your repo, choose `backend` folder
   - Set environment variables
   - Deploy (wait 10 minutes)
   - Copy backend URL

2. **Deploy Frontend to Vercel:**
   - Sign up at vercel.com
   - Import GitHub project
   - Select `frontend` folder
   - Add environment variable: `REACT_APP_API_URL` = your Render backend URL
   - Deploy (wait 3 minutes)
   - Get frontend URL

3. **Update Backend CORS:**
   - Go to Render backend settings
   - Update `FRONTEND_URL` with your Vercel frontend URL
   - Restart backend

4. **Done! Visit your frontend URL**

---

## Environment Variables Reference

### Backend (.env):
```
NODE_ENV=production
PORT=5000
PUPPETEER_HEADLESS=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser  # For some platforms
FRONTEND_URL=https://your-frontend-domain.com
```

### Frontend (.env):
```
REACT_APP_API_URL=https://your-backend-domain.com
```

---

## Testing Your Deployment

1. **Test Backend:**
   ```bash
   curl https://your-backend-url.com
   ```
   Should return "Cannot GET /" (404) - this is normal

2. **Test Scrape Endpoint:**
   ```bash
   curl -X POST https://your-backend-url.com/api/scrape \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "test",
       "role": "Data Analyst",
       "location": "Bangalore",
       "timeRange": "Last 24 hours",
       "maxResults": 5
     }'
   ```

3. **Test Frontend:**
   - Open browser to your frontend URL
   - Should see the LinkedIn Job Scraper interface

---

## Troubleshooting

### Puppeteer Errors:

**Error: "Failed to launch chrome"**
- Solution: Ensure platform supports Puppeteer (Render, Railway, Fly.io do)
- Add buildpack or use Docker with Chrome installed

**Error: "Page crash"**
- Solution: Add these flags to Puppeteer launch:
  ```javascript
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  ```
  (Already included in the code)

### CORS Errors:

**Error: "CORS policy blocked"**
- Solution: Update `FRONTEND_URL` in backend environment variables
- Restart backend service

### Build Failures:

**Frontend build fails:**
- Check `REACT_APP_API_URL` is set correctly
- Ensure it starts with `https://`

**Backend build fails:**
- Check Node version (use Node 16+)
- Ensure all dependencies install correctly

---

## Cost Estimate

### Free Tier (Recommended for Testing):

- **Render Free**: Backend (spins down after 15 min inactivity)
- **Vercel Free**: Frontend (unlimited bandwidth)
- **Total**: $0/month

### Limitations:
- Backend cold start: 30-60 seconds first request
- 750 hours/month limit on Render free tier

### Paid Tier (Production):

- **Render Starter**: $7/month (always-on backend)
- **Vercel Pro**: $20/month (optional, better performance)
- **Total**: $7-27/month

---

## Support

If you encounter issues:
1. Check deployment logs on your platform
2. Review environment variables
3. Test endpoints individually
4. Check GitHub repo issues

---

## Next Steps

1. ✅ Deploy backend to Render
2. ✅ Deploy frontend to Vercel
3. ✅ Update environment variables
4. ✅ Test the application
5. ✅ Share your deployed link!

**Your Deployment URLs:**
- Frontend: `https://[your-project].vercel.app`
- Backend: `https://[your-service].onrender.com`

Good luck! 🚀
