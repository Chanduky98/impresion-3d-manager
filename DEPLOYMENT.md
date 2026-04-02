# Deployment Guide - Vercel + Turso

This guide explains how to deploy the 3D Printing Management Application to Vercel with Turso as the database.

## Prerequisites

1. Vercel account (free at vercel.com)
2. Turso Cloud account (free at turso.io)
3. Git repository with the application code
4. Turso database created (migrations already applied)

## Step-by-Step Deployment

### 1. Prepare Turso Database

The migrations have already been applied to your Turso database. Verify by running:

```bash
npm run prisma:migrate:turso
```

This command will:
- Connect to your Turso database
- Create the `_prisma_migrations` table
- Apply any pending migrations
- Output success messages for each migration

**Note**: The DATABASE_URL environment variable must be set before running this command.

### 2. Deploy to Vercel

#### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

#### Option B: Using GitHub Integration (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Continue to the configuration

### 3. Set Environment Variables in Vercel

In your Vercel project settings, add the following environment variables:

```
NODE_ENV=production
DATABASE_URL=libsql://your-database-url.turso.io?authToken=your-auth-token
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
ALLOWED_ORIGINS=https://your-vercel-domain.vercel.app
```

Replace:
- `your-database-url` with your Turso database URL (from Turso console)
- `your-auth-token` with your Turso auth token
- `your-vercel-domain` with your actual Vercel domain

### 4. Configure CORS

The application has CORS protection. Update the `ALLOWED_ORIGINS` environment variable to match your deployed domain.

## After Deployment

### Verify Database Connection

1. Go to your Vercel deployment URL
2. Register a new admin user
3. Check the dashboard - it should load data from Turso

### Troubleshooting

**Database Connection Errors**:
- Verify DATABASE_URL is correctly set in Vercel environment variables
- Ensure the token hasn't expired in Turso console
- Check Turso network settings allow Vercel's IP ranges

**CORS Errors**:
- Update ALLOWED_ORIGINS to include your Vercel domain
- Redeploy after changing environment variables

**Authentication Issues**:
- Clear browser localStorage and try logging in again
- Check server logs in Vercel dashboard

## Local Development

For local development:

```bash
# Install dependencies
npm install

# Run dev server
npm run dev
```

The app uses `file:./dev.db` for local SQLite database.

## Syncing Data

If you want to migrate existing data from local SQLite to Turso:

1. Export data from local database
2. Import to Turso using Turso Studio or direct SQL
3. Verify data integrity

## Monitoring

After deployment:
- Monitor Turso usage in Turso console
- Check Vercel analytics and logs
- Set up alerts for database quota

## Security Notes

- Never commit `.env.local` file
- Rotate Turso auth tokens periodically
- Use Vercel's secret management for sensitive data
- Keep dependencies updated with `npm audit`
