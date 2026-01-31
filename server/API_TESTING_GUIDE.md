## ✅ **SOLUTION - The Issue Was Fixed!**

The "500 Internal Server Error" was caused by a compatibility issue with the Mongoose pre-save hook in the Ticket model. The issue has been resolved by updating the pre-save middleware to work with the current version of Mongoose.

### ✅ **Working Example:**

**Step 1 - Register:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Student",
    "email": "newstudent@test.com",
    "password": "password123",
    "role": "student"
  }'
```

**Step 2 - Login (copy the token from response):**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newstudent@test.com",
    "password": "password123"
  }'
```

**Step 3 - Create Ticket (replace TOKEN_HERE with your actual token):**
```bash
curl -X POST http://localhost:3001/api/tickets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_HERE" \
  -d '{
    "title": "Issue with course enrollment",
    "description": "Cannot enroll in CS101 course",
    "category": "Exam",
    "priority": "medium"
  }'
```

---

# API Testing Guide - UniSupport Portal

## Step-by-Step Testing Instructions

### Step 1: Register a New User (Student)
**POST** `http://localhost:3001/api/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "Test Student",
  "email": "student@test.com",
  "password": "password123",
  "role": "student"
}
```

### Step 2: Login to Get JWT Token
**POST** `http://localhost:3001/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "student@test.com",
  "password": "password123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "...",
      "name": "Test Student",
      "email": "student@test.com",
      "role": "student"
    }
  }
}
```

**Copy the `token` value from the response!**

### Step 3: Create a Ticket (Using the Token)
**POST** `http://localhost:3001/api/tickets`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

**Body (JSON):**
```json
{
  "title": "Issue with course enrollment",
  "description": "Cannot enroll in CS101 course",
  "category": "Exam",
  "priority": "medium"
}
```

### Step 4: Get My Tickets
**GET** `http://localhost:3001/api/tickets/my`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

## Testing Different Roles

### For Admin Testing:
1. Register with `"role": "admin"`
2. Login to get admin token
3. Use **GET** `http://localhost:3001/api/tickets` to see all tickets

### For Department Testing:
1. Register with `"role": "department"` **and include a departmentId**
2. Login to get department token
3. Use **PUT** `http://localhost:3001/api/tickets/:ticketId/status` to update status

**Sample Department Registration:**
```json
{
  "name": "IT Department Staff",
  "email": "dept@test.com", 
  "password": "123456",
  "role": "department",
  "departmentId": "697dcc970aaf7f6e411f6d38"
}
```

**Available Department IDs:**
- CS (Computer Science): `697dcc970aaf7f6e411f6d2f`
- IT Support: `697dcc970aaf7f6e411f6d38`
- Student Affairs: `697dcc970aaf7f6e411f6d37`
- Registrar Office: `697dcc970aaf7f6e411f6d36`
- (Run `node seedDatabase.js` to see all department IDs)

## Common Issues & Solutions

### 401 Unauthorized Error
- **Problem**: No token provided or invalid token
- **Solution**: Make sure you include the `Authorization: Bearer <token>` header

### 403 Forbidden Error
- **Problem**: User doesn't have the required role
- **Solution**: Check if you're using the correct role (student/admin/department)

### Token Format
The Authorization header must be exactly:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
(Note: "Bearer " with a space before the token)

## Postman Collection Setup

1. Create a new collection
2. Add an environment variable called `token`
3. After login, set the token variable
4. Use `{{token}}` in Authorization headers

## Valid Categories
- "Exam"
- "Attendance"  
- "Internship"
- "Scholarship"
- "Other"

## Valid Priorities
- "low"
- "medium"
- "high"

## Valid Status Updates (Department only)
- "in_progress"
- "resolved" 
- "closed"
