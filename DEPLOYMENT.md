# Deployment Guide - Vercel

This guide will help you deploy the Ecommerce Backend API to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com) (free account works)
2. **MongoDB Atlas**: Free tier MongoDB Atlas cluster
   - Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster
   - Get your connection string
3. **GitHub Repository** (recommended): Push your code to GitHub

## Environment Variables Required

Before deploying, ensure you have these environment variables ready:

- `MONGODB_URI` - Your MongoDB Atlas connection string
  - Format: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`
- `NODE_ENV` - Set to `production`
- `API_URL` - Your Vercel deployment URL (will be provided after first deployment)
- `PORT` - Optional (Vercel handles this automatically)

## Deployment Methods

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Push code to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Go to Vercel Dashboard**:
   - Visit [vercel.com](https://vercel.com)
   - Click "Add New..." → "Project"

3. **Import Your Repository**:
   - Connect your GitHub account if not already connected
   - Select your repository
   - Click "Import"

4. **Configure Project**:
   - Framework Preset: "Other" (Vercel will auto-detect from `vercel.json`)
   - Root Directory: `./` (leave as default)
   - Build Command: Leave empty (not needed for Node.js)
   - Output Directory: Leave empty

5. **Set Environment Variables**:
   Before deploying, click "Environment Variables" and add:
   - `MONGODB_URI` = `your-mongodb-atlas-connection-string`
   - `NODE_ENV` = `production`
   - `API_URL` = (Leave empty for now, add after first deployment)

6. **Deploy**:
   - Click "Deploy"
   - Wait for deployment to complete (2-3 minutes)

7. **Update API_URL**:
   - After deployment, copy your deployment URL (e.g., `https://your-app.vercel.app`)
   - Go to Project Settings → Environment Variables
   - Update `API_URL` with your deployment URL
   - Redeploy (or it will update on next deployment)

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```
   - Follow the prompts
   - Select your account/team
   - Link to existing project or create new
   - Confirm settings

4. **Set Environment Variables**:
   ```bash
   vercel env add MONGODB_URI
   vercel env add NODE_ENV
   vercel env add API_URL
   ```
   Enter values when prompted.

5. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

## Post-Deployment

### 1. Verify Deployment

- Visit your deployment URL (e.g., `https://your-app.vercel.app`)
- Check health endpoint: `https://your-app.vercel.app/health`
- Should return: `{"success":true,"message":"Server is running","timestamp":"..."}`

### 2. Test API Endpoints

- API Documentation: `https://your-app.vercel.app/api-docs`
- Test a simple endpoint:
  ```bash
  curl https://your-app.vercel.app/health
  ```

### 3. Seed Database (Optional)

If you want to seed the database with sample data, you can:
- Run the seed script locally and point it to your production database
- Or create a one-time API endpoint for seeding (not recommended for production)

### 4. MongoDB Atlas Configuration

Ensure your MongoDB Atlas cluster allows connections from anywhere:
1. Go to MongoDB Atlas Dashboard
2. Network Access → Add IP Address
3. Add `0.0.0.0/0` (allow from anywhere) OR add Vercel's IP ranges

## Important Notes

1. **Serverless Functions**: Vercel uses serverless functions, so each request may create a new connection. The code handles this with connection pooling.

2. **Cold Starts**: First request after inactivity may be slower (cold start). This is normal for serverless functions.

3. **Environment Variables**: Never commit `.env` files. Use Vercel's environment variables in the dashboard.

4. **Database Connections**: The code automatically handles database connections with pooling for serverless environments.

5. **API Documentation**: Swagger docs are available at `/api-docs` after deployment.

6. **Custom Domain**: You can add a custom domain in Vercel project settings.

## Troubleshooting

### Database Connection Issues

- Verify `MONGODB_URI` is set correctly in Vercel environment variables
- Check MongoDB Atlas network access settings
- Verify database user has correct permissions

### 500 Errors

- Check Vercel function logs: Project → Deployments → Click deployment → Functions tab
- Verify all environment variables are set
- Check database connection string format

### Timeout Errors

- Vercel serverless functions have a default timeout of 10 seconds
- Increased to 30 seconds in `vercel.json` configuration
- For longer operations, consider using background jobs

## Updating Deployment

After making code changes:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Vercel will automatically deploy on push (if connected via GitHub).

Or manually:
```bash
vercel --prod
```

## Support

- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- MongoDB Atlas Docs: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)

