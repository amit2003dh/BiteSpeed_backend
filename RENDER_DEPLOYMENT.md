# 🚀 Render Deployment Guide

## ✅ **Fixed Issues**
- **NODE_ENV**: Changed from `development` to `production`
- **Error Handling**: Added better logging and timeout handling
- **Database Connection**: Enhanced error reporting

## 📋 **Render Setup Steps**

### **1. Create PostgreSQL Database**
1. Go to https://render.com/dashboard
2. Click **New** → **PostgreSQL**
3. Choose a name (e.g., `bitespeed-db`)
4. Select region closest to you
5. Click **Create Database**

### **2. Get Database Credentials**
After database is created, go to **Database** → **Connections**:
- **Internal Database URL**: `postgresql://username:password@host:port/dbname`
- **External Database URL**: Same format but accessible externally

### **3. Create Web Service**
1. Click **New** → **Web Service**
2. Connect your GitHub: `amit2003dh/BiteSpeed_backend`
3. Configure:
   - **Name**: `bitespeed-api`
   - **Region**: Same as database
   - **Branch**: `master`
   - **Root Directory**: `./`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`

### **4. Set Environment Variables**
In your Web Service → **Environment**:
```bash
NODE_ENV=production
DB_HOST=your-db-hostname.render.com
DB_PORT=5432
DB_NAME=bitespeed_identity_x7q1
DB_USER=bitespeed_identity_x7q1_user
DB_PASSWORD=your-actual-password
PORT=3000
LOG_LEVEL=info
```

### **5. Connect Database**
1. Go to your Web Service
2. Click **Dependencies**
3. Add your PostgreSQL database as a dependency

## 🔍 **Troubleshooting**

### **If Deployment Fails:**
1. **Check Logs**: Go to **Logs** tab in Render dashboard
2. **Common Issues**:
   - Database connection timeout
   - Wrong database credentials
   - Missing environment variables

### **Database Connection Issues:**
```bash
# Test database connection locally
psql "postgresql://username:password@host:port/dbname"

# Or use the External URL from Render
```

### **Environment Variables:**
- Ensure `NODE_ENV=production`
- Check all database variables are set
- Verify no typos in credentials

## 🎯 **Expected Behavior**

### **Successful Deployment:**
- Build: ✅ `npm install` succeeds
- Deploy: ✅ Server starts on port 3000
- Database: ✅ PostgreSQL connection established
- API: ✅ Endpoints accessible at your Render URL

### **Test Your Deployment:**
```bash
# Health check
curl https://your-app-name.onrender.com/api/health

# Identity test
curl -X POST https://your-app-name.onrender.com/api/identify \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","phoneNumber":"1234567890"}'
```

## 📊 **Monitoring**

### **Render Dashboard:**
- **Metrics**: CPU, Memory, Response times
- **Logs**: Real-time application logs
- **Events**: Deployments, restarts, errors

### **Health Checks:**
- Automatic health monitoring
- Restart on failure
- Zero-downtime deployments

## 🚀 **Production Tips**

1. **Database**: Use Render's managed PostgreSQL
2. **Environment**: Keep `NODE_ENV=production`
3. **Logging**: Set `LOG_LEVEL=info` or `warn`
4. **Security**: Never commit `.env` file
5. **Monitoring**: Check Render logs regularly

## 🆘 **Support**

If deployment still fails:
1. Check Render logs for specific error messages
2. Verify database is running and accessible
3. Ensure all environment variables are correct
4. Check that your code is pushed to GitHub

Your app should now deploy successfully on Render! 🎉
