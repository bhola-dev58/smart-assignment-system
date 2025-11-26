# 🚀 CI/CD Pipeline Documentation

## Overview

This project uses **GitHub Actions** for continuous integration and deployment. The pipeline is configured to automatically test, build, and prepare the application for deployment.

## Workflows

### 1. CI/CD Pipeline (`ci-cd.yml`)
**Triggers:** Push to `main` or `develop`, Pull requests to `main`

**Jobs:**
- **Backend CI**: Installs dependencies, checks syntax, runs tests
- **Frontend CI**: Installs dependencies, lints, builds the application
- **Security Scan**: Runs npm audit on both backend and frontend
- **Deploy Staging**: Prepares artifacts for deployment (only on main branch)
- **Deployment Status**: Provides summary of pipeline execution

### 2. Manual Deployment (`deploy.yml`)
**Triggers:** Manual workflow dispatch

**Features:**
- Choose deployment environment (production/staging)
- Separate jobs for backend and frontend deployment
- Ready for integration with Vercel, Render, Netlify, etc.

### 3. Pull Request Checks (`pr-checks.yml`)
**Triggers:** Pull requests to `main` or `develop`

**Features:**
- Validates code changes
- Checks for potential secrets in code
- Provides PR summary with changed files

## Setup Instructions

### 1. GitHub Repository Setup

Your repository is already configured with GitHub Actions. The workflows will run automatically on:
- Every push to `main` branch
- Every pull request to `main`
- Manual deployment trigger

### 2. Adding Secrets (for Automatic Deployment)

To enable automatic deployment, add these secrets to your GitHub repository:

**Go to:** Repository → Settings → Secrets and variables → Actions → New repository secret

#### For Vercel Deployment (Frontend):
```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
```

#### For Render Deployment (Backend):
```
RENDER_API_KEY=your_render_api_key
RENDER_SERVICE_ID=your_service_id
```

### 3. Environment Variables

The pipeline uses these environment configurations:

**Backend (.env):**
- `PORT=5000`
- `MONGO_URI=your_mongodb_uri`
- `JWT_SECRET=your_jwt_secret`

**Frontend:**
- API base URL is configured in `src/api.js`

## Pipeline Status Badges

Add these badges to your README.md:

```markdown
![CI/CD Pipeline](https://github.com/bhola-dev58/smart-assignment-system/actions/workflows/ci-cd.yml/badge.svg)
![Deployment](https://github.com/bhola-dev58/smart-assignment-system/actions/workflows/deploy.yml/badge.svg)
```

## Workflow Execution

### Viewing Pipeline Results

1. Go to your repository on GitHub
2. Click on **Actions** tab
3. Select a workflow run to view details
4. Check individual job logs for debugging

### Manual Deployment

1. Go to **Actions** tab
2. Select **Deploy to Production** workflow
3. Click **Run workflow**
4. Choose environment (production/staging)
5. Click **Run workflow** button

## Deployment Platforms Integration

### Vercel (Frontend)

**Option 1: Manual Setup**
1. Go to https://vercel.com
2. Import your GitHub repository
3. Configure:
   - Framework: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add environment variables if needed
5. Deploy

**Option 2: Automatic via GitHub Actions**
1. Get Vercel token and project IDs
2. Add secrets to GitHub
3. Uncomment Vercel deployment step in `deploy.yml`
4. Push changes

### Render (Backend)

**Option 1: Manual Setup**
1. Go to https://render.com
2. New → Web Service
3. Connect GitHub repository
4. Configure:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Add environment variables:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `PORT=5000`
6. Deploy

**Option 2: Automatic via GitHub Actions**
1. Get Render API key and service ID
2. Add secrets to GitHub
3. Uncomment Render deployment step in `deploy.yml`
4. Push changes

### Railway (Alternative Backend)

1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select your repository
4. Configure:
   - Root Directory: `backend`
   - Start Command: `npm start`
5. Add environment variables
6. Deploy

## CI/CD Best Practices

### ✅ What's Implemented

1. **Automated Testing**
   - Syntax checks on every commit
   - Build validation
   - Security audits

2. **Code Quality**
   - Lint checks (if configured)
   - Build verification
   - Secret detection

3. **Deployment Ready**
   - Artifact generation
   - Environment-specific deployments
   - Manual deployment trigger

4. **Pull Request Validation**
   - Automatic checks on PRs
   - Changed files summary
   - Build validation before merge

### 📋 Recommended Additions

1. **Add Tests**
   ```json
   // package.json
   "scripts": {
     "test": "jest",
     "test:watch": "jest --watch"
   }
   ```

2. **Add Linting**
   ```json
   // package.json
   "scripts": {
     "lint": "eslint . --ext .js,.jsx",
     "lint:fix": "eslint . --ext .js,.jsx --fix"
   }
   ```

3. **Environment-specific Builds**
   - Separate staging and production environments
   - Different API URLs for each environment
   - Environment-specific secrets

## Troubleshooting

### Pipeline Fails on npm ci

**Problem:** `package-lock.json` not in sync
**Solution:**
```powershell
# In backend and frontend folders
npm install
git add package-lock.json
git commit -m "Update package-lock.json"
git push
```

### Build Artifacts Not Created

**Problem:** Build command fails
**Solution:** Check the build logs in Actions tab, fix any build errors locally first

### Secrets Not Working

**Problem:** Deployment fails due to missing secrets
**Solution:** Verify secrets are correctly added in GitHub repository settings

## Next Steps

1. **Test the Pipeline**
   ```powershell
   git add .
   git commit -m "Add CI/CD pipeline"
   git push origin main
   ```
   Then check the Actions tab to see the pipeline run

2. **Set Up Deployment Platforms**
   - Create accounts on Vercel and Render
   - Connect your repositories
   - Configure environment variables

3. **Enable Automatic Deployment**
   - Add platform secrets to GitHub
   - Uncomment deployment steps in workflows
   - Push changes to trigger automatic deployment

4. **Monitor Your Pipelines**
   - Check Actions tab regularly
   - Review failed builds
   - Optimize build times

## Pipeline Metrics

Expected pipeline execution times:
- Backend CI: ~2-3 minutes
- Frontend CI: ~3-5 minutes
- Security Scan: ~1-2 minutes
- Total: ~6-10 minutes per run

## Support

If you encounter issues:
1. Check the Actions tab for detailed logs
2. Review the workflow YAML files
3. Verify all dependencies are correctly specified
4. Check environment variables and secrets

---

**Your CI/CD pipeline is now ready! 🎉**

Every push to `main` will trigger automatic testing and deployment preparation.
