# Testing Google OAuth - Examples & Curl Commands

## 📌 Base URL
```
http://localhost:3000
```

## 🌐 Browser Tests

### 1. Visit Demo Page
```
http://localhost:3000/index.html
```
Interactive UI with Google, Register, and Login buttons.

### 2. Google OAuth Login (Browser)
```
http://localhost:3000/auth/google
```
Redirects to Google login page.

### 3. Check Auth Status (Browser)
```
http://localhost:3000/auth/user
```
Returns current user info (requires authentication).

---

## 🔧 API Tests via Curl/Postman

### Register with Username/Password
```bash
curl -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "MySecurePassword123",
    "phone": "+1-555-0123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "username": "john_doe",
    "phone": "+1-555-0123",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "5a8c9f2e-1234-5678-abcd-ef0123456789"
  }
}
```

---

### Login with Username/Password
```bash
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "MySecurePassword123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": 1,
    "username": "john_doe",
    "phone": "+1-555-0123",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "5a8c9f2e-1234-5678-abcd-ef0123456789"
  }
}
```

---

### Get User Profile
```bash
curl -X GET http://localhost:3000/users/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "id": 1,
    "username": "john_doe",
    "password": "$2a$10$...",
    "phone": "+1-555-0123",
    "googleId": null,
    "email": null,
    "created_at": "2024-05-12 10:30:00",
    "updated_at": "2024-05-12 10:30:00"
  }
}
```

---

### Update User Profile
```bash
curl -X PUT http://localhost:3000/users/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+1-555-9999"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": 1,
    "username": "john_doe",
    "phone": "+1-555-9999",
    "googleId": null,
    "email": null,
    "created_at": "2024-05-12 10:30:00",
    "updated_at": "2024-05-12 10:35:00"
  }
}
```

---

### Refresh Access Token
```bash
curl -X POST http://localhost:3000/users/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "5a8c9f2e-1234-5678-abcd-ef0123456789"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "5a8c9f2e-1234-5678-abcd-ef0123456789"
  }
}
```

---

### Logout
```bash
curl -X POST http://localhost:3000/users/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "5a8c9f2e-1234-5678-abcd-ef0123456789"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": {
    "userId": 1
  }
}
```

---

### Delete User Account
```bash
curl -X DELETE http://localhost:3000/users/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": {
    "id": 1
  }
}
```

---

### Get Current Auth Status
```bash
curl -X GET http://localhost:3000/auth/user \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": null,
    "phone": "+1-555-0123",
    "googleId": null
  }
}
```

---

### Logout via Auth Route
```bash
curl -X GET http://localhost:3000/auth/logout
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## 🍪 Using With Cookies (If Session-Based)

Add cookies to request:
```bash
curl -X GET http://localhost:3000/auth/user \
  -b "session=<session_cookie_value>"
```

---

## 🧪 JavaScript/Fetch Examples

### Register
```javascript
async function register() {
  const response = await fetch('http://localhost:3000/users/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'john_doe',
      password: 'MySecurePassword123',
      phone: '+1-555-0123'
    })
  });
  const data = await response.json();
  console.log(data);
}
```

### Login
```javascript
async function login() {
  const response = await fetch('http://localhost:3000/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'john_doe',
      password: 'MySecurePassword123'
    })
  });
  const data = await response.json();
  if (data.success) {
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
  }
  console.log(data);
}
```

### Get User Profile
```javascript
async function getProfile(userId) {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(`http://localhost:3000/users/${userId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  console.log(data);
}
```

### Google Login Redirect
```javascript
function googleLogin() {
  window.location.href = 'http://localhost:3000/auth/google';
}
```

### Handle Google Callback
```javascript
window.addEventListener('load', () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  
  if (token) {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('refreshToken', params.get('refreshToken'));
    console.log('User ID:', params.get('userId'));
    console.log('Username:', params.get('username'));
    
    // Redirect to dashboard
    window.location.href = '/dashboard';
  }
});
```

---

## 📊 Error Responses

### Missing Required Fields
```json
{
  "success": false,
  "message": "Username and password are required",
  "error": "Missing required fields"
}
```

### Invalid Credentials
```json
{
  "success": false,
  "message": "Invalid username or password",
  "error": "Password mismatch"
}
```

### User Not Found
```json
{
  "success": false,
  "message": "User not found",
  "error": "Invalid user ID"
}
```

### Duplicate Username
```json
{
  "success": false,
  "message": "Username already exists",
  "error": "Duplicate username"
}
```

### Not Authenticated
```json
{
  "success": false,
  "message": "Not authenticated"
}
```

---

## 🚀 Integration Checklist

- [ ] Install packages: `npm install`
- [ ] Update `.env` with Google credentials
- [ ] Start server: `npm start`
- [ ] Test register endpoint
- [ ] Test login endpoint
- [ ] Test Google OAuth button
- [ ] Check user profile
- [ ] Test token refresh
- [ ] Test logout
- [ ] Verify MongoDB data (if using)

---

Happy Testing! 🎉
