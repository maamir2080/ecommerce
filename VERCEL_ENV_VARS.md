# Environment Variables for Vercel

Before deploying, you need to set these environment variables in your Vercel project:

## Required Environment Variables

### 1. MONGODB_URI
- **Description**: MongoDB Atlas connection string
- **Format**: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`
- **How to get it**:
  1. Go to MongoDB Atlas dashboard
  2. Click "Connect" on your cluster
  3. Choose "Connect your application"
  4. Copy the connection string
  5. Replace `<password>` with your database password
  6. Replace `<database>` with your database name (e.g., `ecommerce`)

### 2. NODE_ENV
- **Description**: Environment mode
- **Value**: `production`

### 3. API_URL
- **Description**: Base URL for your API (used in Swagger documentation)
- **Format**: `https://your-app-name.vercel.app`
- **Note**: Set this AFTER your first deployment. You'll get the URL from Vercel after deploying.

## Setting Environment Variables in Vercel

### Via Dashboard:
1. Go to your project in Vercel dashboard
2. Click on "Settings" tab
3. Click on "Environment Variables" in the left sidebar
4. Add each variable:
   - Name: `MONGODB_URI`
   - Value: `your-connection-string`
   - Environment: Production, Preview, Development (check all)
   - Click "Save"
5. Repeat for other variables

### Via CLI:
```bash
vercel env add MONGODB_URI production
vercel env add NODE_ENV production
vercel env add API_URL production
```

Enter the values when prompted.

## Important Notes

- Never commit `.env` files to git
- Environment variables are encrypted in Vercel
- Update `API_URL` after first deployment with your actual deployment URL
- If you update environment variables, redeploy for changes to take effect

