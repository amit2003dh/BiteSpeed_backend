# 🧪 Testing Guide for BiteSpeed Identity Reconciliation

## 🚀 Quick Start

Server is running on: **http://localhost:3000**

## 📋 Test Scenarios

### **Scenario 1: New User Registration**
**Request:**
```bash
POST /api/identify
Content-Type: application/json

{
  "email": "alice@example.com",
  "phoneNumber": "1111111111"
}
```

**Expected Response:**
```json
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["alice@example.com"],
    "phoneNumbers": ["1111111111"],
    "secondaryContactIds": []
  }
}
```

### **Scenario 2: Same Email, Different Phone**
**Request:**
```bash
POST /api/identify
Content-Type: application/json

{
  "email": "alice@example.com",
  "phoneNumber": "2222222222"
}
```

**Expected Response:**
```json
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["alice@example.com"],
    "phoneNumbers": ["1111111111", "2222222222"],
    "secondaryContactIds": [2]
  }
}
```

### **Scenario 3: Same Phone, Different Email**
**Request:**
```bash
POST /api/identify
Content-Type: application/json

{
  "email": "bob@example.com",
  "phoneNumber": "1111111111"
}
```

**Expected Response:**
```json
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["alice@example.com", "bob@example.com"],
    "phoneNumbers": ["1111111111", "2222222222"],
    "secondaryContactIds": [2, 3]
  }
}
```

### **Scenario 4: Email Only**
**Request:**
```bash
POST /api/identify
Content-Type: application/json

{
  "email": "charlie@example.com"
}
```

### **Scenario 5: Phone Only**
**Request:**
```bash
POST /api/identify
Content-Type: application/json

{
  "phoneNumber": "3333333333"
}
```

### **Scenario 6: Invalid Request**
**Request:**
```bash
POST /api/identify
Content-Type: application/json

{}
```

**Expected Response:**
```json
{
  "error": "Validation failed",
  "details": "\"value\" must contain at least one of [email, phoneNumber]"
}
```

## 🛠️ Testing Methods

### **Method 1: Command Line**
```bash
# Health check
curl http://localhost:3000/api/health

# Test identity
curl -X POST http://localhost:3000/api/identify \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","phoneNumber":"1234567890"}'
```

### **Method 2: Postman**
1. Import `POSTMAN_COLLECTION.json` file
2. Use the pre-configured test scenarios
3. Modify values as needed

### **Method 3: Browser**
- Health check: http://localhost:3000/api/health
- (POST endpoints require API client)

### **Method 4: Automated Tests**
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📊 Test Results Interpretation

### **Success Response (200)**
```json
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["email1@example.com", "email2@example.com"],
    "phoneNumbers": ["1234567890", "0987654321"],
    "secondaryContactIds": [2, 3]
  }
}
```

### **Validation Error (400)**
```json
{
  "error": "Validation failed",
  "details": "Error message explaining what went wrong"
}
```

### **Server Error (500)**
```json
{
  "error": "Internal server error",
  "message": "Detailed error message (in development mode)"
}
```

## 🎯 Key Things to Test

1. **New Contact Creation**: First-time users
2. **Identity Linking**: Same email/phone across requests
3. **Cluster Merging**: Multiple primary contacts getting merged
4. **Edge Cases**: Empty requests, invalid data
5. **Idempotency**: Same request multiple times

## 🔍 Debugging Tips

- Check logs in `logs/combined.log` for detailed request/response info
- Use the health endpoint to verify server is running
- Test with simple cases first, then complex scenarios
- Verify database state by checking `database.sqlite` file

## 🚀 Advanced Testing

### **Load Testing**
```bash
# Install artillery for load testing
npm install -g artillery

# Create test script and run
artillery run load-test.yml
```

### **Integration Testing**
The Jest test suite covers all scenarios:
```bash
npm test
```

This will test:
- New user creation
- Email/phone linking
- Cluster merging
- Validation errors
- Edge cases
