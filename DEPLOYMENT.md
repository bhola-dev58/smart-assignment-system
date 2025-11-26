# 🚀 Deployment Guide

## Production Deployment Options

### Option 1: Deploy to Vercel (Frontend) + Render (Backend)

#### Backend Deployment (Render)

1. **Prepare Backend for Production**
   - Ensure `.gitignore` includes `node_modules` and `.env`
   - Push code to GitHub repository

2. **Deploy on Render**
   - Go to https://render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - Name: smart-assignment-backend
     - Root Directory: `backend`
     - Environment: `Node`
     - Build Command: `npm install`
     - Start Command: `npm start`
   
3. **Set Environment Variables**
   ```
   PORT=5000
   MONGO_URI=your_mongodb_atlas_uri
   JWT_SECRET=your_production_secret_key
   ```

4. **Note Your Backend URL**
   - Example: `https://smart-assignment-backend.onrender.com`

#### Frontend Deployment (Vercel)

1. **Update API Base URL**
   ```javascript
   // frontend/src/api.js
   baseURL: 'https://smart-assignment-backend.onrender.com/api'
   ```

2. **Deploy on Vercel**
   - Go to https://vercel.com
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure:
     - Framework Preset: Vite
     - Root Directory: `frontend`
     - Build Command: `npm run build`
     - Output Directory: `dist`
   - Deploy

3. **Your Frontend URL**
   - Example: `https://smart-assignment.vercel.app`

4. **Update Backend CORS**
   ```javascript
   // backend/server.js
   app.use(cors({
     origin: 'https://smart-assignment.vercel.app'
   }));
   ```

---

### Option 2: Deploy to Heroku (Full Stack)

1. **Install Heroku CLI**
   ```powershell
   # Download from: https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Prepare for Heroku**
   ```powershell
   # Create Procfile in backend/
   echo "web: node server.js" > backend/Procfile
   ```

3. **Deploy Backend**
   ```powershell
   cd backend
   heroku create smart-assignment-backend
   heroku config:set MONGO_URI="your_mongodb_uri"
   heroku config:set JWT_SECRET="your_secret"
   git init
   git add .
   git commit -m "Initial commit"
   git push heroku main
   ```

4. **Deploy Frontend**
   - Update API URL in frontend/src/api.js
   - Deploy to Vercel or Netlify

---

### Option 3: VPS Deployment (DigitalOcean/AWS/Azure)

#### Prerequisites
- Ubuntu 20.04+ server
- Domain name (optional)
- SSH access

#### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB (or use MongoDB Atlas)
sudo apt install -y mongodb

# Install Nginx
sudo apt install -y nginx

# Install PM2 for process management
sudo npm install -g pm2
```

#### 2. Deploy Backend

```bash
# Clone repository
git clone your-repo-url
cd smart-assignment-system/backend

# Install dependencies
npm install

# Create .env file
nano .env
# Add your production environment variables

# Start with PM2
pm2 start server.js --name "smart-assignment-backend"
pm2 save
pm2 startup
```

#### 3. Configure Nginx for Backend

```bash
sudo nano /etc/nginx/sites-available/backend
```

Add:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable:
```bash
sudo ln -s /etc/nginx/sites-available/backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 4. Deploy Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Build for production
npm run build

# Move build to nginx directory
sudo rm -rf /var/www/html/*
sudo cp -r dist/* /var/www/html/
```

#### 5. Configure Nginx for Frontend

```bash
sudo nano /etc/nginx/sites-available/frontend
```

Add:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Enable:
```bash
sudo ln -s /etc/nginx/sites-available/frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 6. Setup SSL with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
sudo certbot --nginx -d api.yourdomain.com
```

---

## Environment Variables (Production)

### Backend (.env)
```env
# Production Settings
NODE_ENV=production
PORT=5000

# MongoDB - Use MongoDB Atlas for production
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/smart-assignment

# JWT Secret - Generate a strong key
JWT_SECRET=<generate-using-crypto.randomBytes(64).toString('hex')>

# Frontend URL for CORS
FRONTEND_URL=https://yourdomain.com
```

### Frontend
Update `frontend/src/api.js`:
```javascript
const baseURL = import.meta.env.PROD
  ? 'https://api.yourdomain.com/api'  // Production
  : 'http://localhost:5000/api';      // Development
```

---

## Security Checklist

### Before Deployment
- [ ] Change default JWT_SECRET to a strong random string
- [ ] Update MongoDB credentials
- [ ] Enable MongoDB IP whitelist (if using Atlas)
- [ ] Remove console.logs from production code
- [ ] Set secure CORS origins (not '*')
- [ ] Enable HTTPS/SSL certificates
- [ ] Set secure HTTP headers
- [ ] Validate all user inputs
- [ ] Rate limit API endpoints
- [ ] Set up monitoring and logging

### Recommended Additions

#### Add Rate Limiting
```bash
cd backend
npm install express-rate-limit
```

```javascript
// backend/server.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

#### Add Helmet for Security Headers
```bash
npm install helmet
```

```javascript
// backend/server.js
const helmet = require('helmet');
app.use(helmet());
```

#### Add Compression
```bash
npm install compression
```

```javascript
// backend/server.js
const compression = require('compression');
app.use(compression());
```

---

## Monitoring & Maintenance

### 1. Setup Logging
```javascript
// Use Winston or Morgan for logging
npm install winston morgan
```

### 2. Database Backups
- Setup automated MongoDB backups
- Use MongoDB Atlas automated backups
- Or setup cron job for mongodump

### 3. Uptime Monitoring
- Use UptimeRobot (free)
- Setup alerts for downtime
- Monitor API response times

### 4. Error Tracking
- Integrate Sentry for error tracking
- Monitor server logs
- Track user issues

---

## Performance Optimization

### Frontend
- [ ] Enable Vite production build optimizations
- [ ] Compress images
- [ ] Lazy load components
- [ ] Use CDN for static assets
- [ ] Enable gzip compression

### Backend
- [ ] Add database indexing
- [ ] Cache frequently accessed data
- [ ] Optimize MongoDB queries
- [ ] Use connection pooling
- [ ] Compress API responses

---

## Rollback Strategy

### Quick Rollback
```bash
# Using PM2
pm2 list
pm2 restart smart-assignment-backend

# Or revert git commit
git revert HEAD
git push origin main
```

### Database Rollback
```bash
# Restore from backup
mongorestore --uri="mongodb+srv://..." --archive=backup.gz
```

---

## Support & Maintenance

### Regular Tasks
- Monitor server resources (CPU, RAM, Disk)
- Check error logs weekly
- Update dependencies monthly
- Review security patches
- Database maintenance and optimization

### Cost Estimation (Monthly)

**Free Tier:**
- Vercel (Frontend): Free
- Render (Backend): Free
- MongoDB Atlas: Free (512MB)
- **Total: $0/month**

**Paid Tier:**
- VPS (DigitalOcean): $5-10
- MongoDB Atlas M10: $57
- Domain: $12/year
- SSL: Free (Let's Encrypt)
- **Total: ~$65-75/month**

---

## Contact & Support

For deployment issues:
1. Check server logs
2. Verify environment variables
3. Check MongoDB connection
4. Review nginx configuration
5. Check SSL certificates

---

**Your app is now production-ready! 🎉**
