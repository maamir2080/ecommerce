# Quick Deployment Guide

## Step 1: Login to Vercel (First time only)

```bash
vercel login
```

This will open your browser to authenticate.

## Step 2: Deploy to Vercel

Run one of these commands:

**For initial deployment (will create new project):**
```bash
vercel
```

**For production deployment (after initial setup):**
```bash
vercel --prod
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? (Select your account/team)
- Link to existing project? **No** (for first time)
- What's your project's name? (Enter a name, e.g., `ecommerce-backend`)
- In which directory is your code located? **./** (press Enter)
- Want to override settings? **No** (press Enter)

## Step 3: Set Environment Variables

After deployment, set your environment variables:

```bash
vercel env add MONGODB_URI production
```
Enter your MongoDB Atlas connection string when prompted.

```bash
vercel env add NODE_ENV production
```
Enter: `production`

```bash
vercel env add API_URL production
```
Enter your deployment URL (you'll get this after first deployment, e.g., `https://your-app.vercel.app`)

## Step 4: Redeploy with Environment Variables

```bash
vercel --prod
```

## Alternative: Deploy via Dashboard

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push
   ```

2. Go to [vercel.com](https://vercel.com)

3. Click "Add New..." → "Project"

4. Import your GitHub repository

5. Configure:
   - Framework: Other
   - Root Directory: ./
   - Build Command: (leave empty)
   - Output Directory: (leave empty)

6. Add Environment Variables:
   - MONGODB_URI
   - NODE_ENV = production
   - API_URL (after first deployment)

7. Click "Deploy"

## Verify Deployment

After deployment, visit:
- Health check: `https://your-app.vercel.app/health`
- API docs: `https://your-app.vercel.app/api-docs`

## Need Help?

See `DEPLOYMENT.md` for detailed instructions.

