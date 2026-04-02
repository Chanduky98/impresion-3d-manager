# Deployment Checklist

Use this checklist to deploy your application to Vercel.

## Pre-Deployment ✓

- [x] Turso database created and configured
- [x] All migrations applied to Turso
- [x] Local development tested and working
- [x] Environment variables configured
- [x] Vercel configuration created
- [x] Code committed to git

## Deployment Steps

### 1. Push Code to GitHub
```bash
git add .
git commit -m "Setup: Ready for Vercel deployment with Turso"
git push origin main
```
**Expected**: Code pushed successfully

### 2. Connect to Vercel
- [ ] Create new Vercel project at https://vercel.com/new
- [ ] Select your GitHub repository
- [ ] Click "Import"

### 3. Configure Environment Variables in Vercel
Go to Project Settings → Environment Variables and add:

- [ ] `NODE_ENV` = `production`
- [ ] `DATABASE_URL` = `libsql://impresora-chanduky.aws-eu-west-1.turso.io?authToken=<your-token>`
- [ ] `NEXT_PUBLIC_APP_URL` = `https://<your-vercel-domain>.vercel.app`
- [ ] `ALLOWED_ORIGINS` = `https://<your-vercel-domain>.vercel.app`

**Note**: Replace `<your-token>` and `<your-vercel-domain>` with actual values

### 4. Deploy
- [ ] Click "Deploy" in Vercel
- [ ] Wait for build to complete (usually 2-5 minutes)
- [ ] Verify deployment URL is generated

## Post-Deployment Testing

### 1. Visit Your Application
- [ ] Go to `https://<your-vercel-domain>.vercel.app`
- [ ] Should see login/register page
- [ ] No CORS or database errors

### 2. Register Admin User
- [ ] Email: `admin@impresion3d.local`
- [ ] Password: `Chanduk11`
- [ ] Register and login

### 3. Verify Database Connection
- [ ] Dashboard page loads
- [ ] Check "Estadísticas" (Statistics)
- [ ] Verify printers, orders, and other data appear
- [ ] No "Error fetching data" messages

### 4. Test Core Features
- [ ] Register a new printer
- [ ] Create a new order
- [ ] Add a new piece
- [ ] Check maintenance page
- [ ] Check pieces costing page

## Troubleshooting

### Database Connection Issues
- [ ] Verify DATABASE_URL is correct in Vercel dashboard
- [ ] Check Turso token hasn't expired
- [ ] Verify ALLOWED_ORIGINS includes your domain

### Build Fails
- [ ] Check Vercel build logs for errors
- [ ] Verify all dependencies are in package.json
- [ ] Run `npm run build` locally to test

### CORS Errors
- [ ] Update ALLOWED_ORIGINS in Vercel
- [ ] Redeploy after changing env vars
- [ ] Clear browser cache

### Authentication Issues
- [ ] Verify auth tokens work with Turso database
- [ ] Check email/password format during registration
- [ ] Clear localStorage and try again

## Data Management

### If You Have Local Data to Migrate
1. Export data from `dev.db` (local SQLite)
2. Create SQL insert statements
3. Execute in Turso Studio console
4. Verify data appears in production app

### Ongoing Maintenance
- [ ] Monitor Turso quota usage
- [ ] Check Vercel analytics
- [ ] Keep dependencies updated
- [ ] Backup important data

## Success Criteria

✓ Application is live on Vercel
✓ Database connection works
✓ Users can register and login
✓ Dashboard shows data
✓ All pages load without errors

---

**You're all set! Follow these steps and your 3D Printing Manager will be live online!**
