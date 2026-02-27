# BiteSpeed Identity Reconciliation System

A production-grade identity reconciliation system that links customer contacts across multiple identifiers (email + phone) and maintains unified customer profiles.

## 🏗️ Architecture

```
src/
 ├── controllers/     # Request handling and validation
 ├── services/        # Core business logic
 ├── models/          # Database schema and models
 ├── routes/          # API endpoint mapping
 ├── config/          # Database configuration
 ├── utils/           # Logging and utilities
 ├── app.js          # Express app setup
 └── server.js       # Server initialization
```

## 🚀 Features

- **Identity Resolution**: Links contacts by email and/or phone number
- **Primary-Secondary Model**: Maintains primary contact with linked secondary contacts
- **Cluster Merging**: Intelligently merges separate identity clusters
- **Comprehensive Validation**: Input validation with Joi
- **Structured Logging**: Winston-based logging system
- **Database Optimization**: Optimized queries with proper indexes
- **Error Handling**: Graceful error handling and recovery
- **Health Checks**: Built-in health check endpoints

## � Quick Start

### **Local Development**
```bash
# Install dependencies
npm install

# Start the server (uses SQLite for development)
npm start

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

### **Manual Testing**
```powershell
# Health check
Invoke-WebRequest -Uri "http://localhost:3000/api/health" -Method GET -UseBasicParsing

# Test identity resolution
Invoke-WebRequest -Uri "http://localhost:3000/api/identify" -Method POST -ContentType "application/json" -Body '{"email":"test@example.com","phoneNumber":"1234567890"}' -UseBasicParsing
```

### **Server Status**
- **Development**: Runs on `http://localhost:3000`
- **Database**: SQLite (automatically created)
- **Environment**: Development mode
- **Logs**: Stored in `logs/` directory

## � Requirements

- Node.js >= 16.0.0
- Render account (for PostgreSQL database)

## ⚙️ Setup for Render

### **Step 1: Create Render PostgreSQL Database**
1. Go to https://render.com
2. Sign up and create a new PostgreSQL database
3. Note your connection details

### **Step 2: Update Environment Variables**
Edit `.env` file with your Render PostgreSQL credentials:
```bash
DB_HOST=your-hostname-here.render.com
DB_PORT=5432
DB_NAME=bitespeed_identity
DB_USER=bitespeed_user
DB_PASSWORD=your-actual-password
```

### **Step 3: Deploy to Render**
1. Push your code to GitHub
2. Go to Render Dashboard → New Web Service
3. Connect your GitHub repository
4. Set environment variables from your .env file
5. Deploy!

## 🗄️ Database Schema

### Contacts Table

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PRIMARY KEY | Unique identifier |
| phoneNumber | VARCHAR | Phone number |
| email | VARCHAR | Email address |
| linkedId | INTEGER | FK to primary contact |
| linkPrecedence | ENUM('primary','secondary') | Contact type |
| createdAt | TIMESTAMP | Creation time |
| updatedAt | TIMESTAMP | Last update |
| deletedAt | TIMESTAMP | Soft delete timestamp |

## 📡 API Endpoints

### POST /api/identify

**Request:**
```json
{
  "email": "user@example.com",
  "phoneNumber": "1234567890"
}
```

**Response:**
```json
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["user@example.com", "alt@example.com"],
    "phoneNumbers": ["1234567890", "0987654321"],
    "secondaryContactIds": [2, 3]
  }
}
```

### GET /api/health

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "identity-reconciliation"
}
```

## 🧪 Testing Examples

### **Scenario 1: New User**
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/identify" -Method POST -ContentType "application/json" -Body '{"email":"alice@example.com","phoneNumber":"1111111111"}' -UseBasicParsing
```

### **Scenario 2: Same Email, Different Phone**
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/identify" -Method POST -ContentType "application/json" -Body '{"email":"alice@example.com","phoneNumber":"2222222222"}' -UseBasicParsing
```

### **Scenario 3: Same Phone, Different Email**
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/identify" -Method POST -ContentType "application/json" -Body '{"email":"bob@example.com","phoneNumber":"1111111111"}' -UseBasicParsing
```

### **Scenario 4: Email Only**
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/identify" -Method POST -ContentType "application/json" -Body '{"email":"charlie@example.com"}' -UseBasicParsing
```

### **Scenario 5: Phone Only**
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/identify" -Method POST -ContentType "application/json" -Body '{"phoneNumber":"3333333333"}' -UseBasicParsing
```

### **Scenario 6: Validation Error**
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/identify" -Method POST -ContentType "application/json" -Body '{}' -UseBasicParsing
```

## 🧪 Testing

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 🎯 Identity Resolution Logic

### Case 1: New User
- No existing matches → Create new primary contact

### Case 2: Single Match Found
- Find matching contacts by email/phone
- Identify oldest primary contact
- Link all contacts to primary
- Create secondary if exact combination doesn't exist

### Case 3: Multiple Primary Clusters
- Detect separate identity clusters
- Merge clusters using oldest primary as winner
- Convert newer primaries to secondary
- Update all linked relationships

## 📊 Edge Cases Handled

- Empty request body
- Only email provided
- Only phone provided
- Invalid email format
- Duplicate records
- Concurrent requests
- Database connection failures

## 🚀 Render Deployment

### Environment Variables Required
```bash
NODE_ENV=production
PORT=3000
DB_HOST=your-hostname.render.com
DB_PORT=5432
DB_NAME=bitespeed_identity
DB_USER=bitespeed_user
DB_PASSWORD=your-password
LOG_LEVEL=info
```

### Quick Deploy Steps
1. **Create PostgreSQL Database** on Render
2. **Copy connection details** from Render dashboard
3. **Update .env** with your actual values
4. **Create Web Service** on Render
5. **Set environment variables** in Render dashboard
6. **Deploy!**

## 📝 Sample Usage

### New User Registration
```bash
curl -X POST https://your-app.onrender.com/api/identify \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "phoneNumber": "1234567890"}'
```

### Health Check
```bash
curl https://your-app.onrender.com/api/health
```

## 📄 License

MIT License - see LICENSE file for details.
