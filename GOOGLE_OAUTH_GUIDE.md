# Google OAuth Implementation Guide

## Overview
This guide explains how to set up Google OAuth login and registration for your Node.js application.

## Prerequisites
- Node.js and npm installed
- MySQL database running
- Google Cloud Console account

## Step 1: Set Up Google OAuth Credentials

### 1.1 Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the Google+ API
4. Go to "Credentials" and create a new OAuth 2.0 Client ID
5. Select "Web application"
6. Add authorized redirect URI: `http://localhost:3000/auth/google/callback` (for development)
7. Copy the Client ID and Client Secret

### 1.2 Update Environment Variables
Create or update `.env` file with:
```
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
FRONTEND_URL=http://localhost:3000
COOKIE_KEY=your_cookie_key_here
```

## Step 2: Database Changes

The User table has been updated to support Google OAuth:
```sql
ALTER TABLE users ADD COLUMN googleId VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN email VARCHAR(255);
ALTER TABLE users MODIFY COLUMN password VARCHAR(255);
```

New columns:
- `googleId`: Stores Google's unique identifier
- `email`: Stores user's email from Google
- `password`: Now optional (NULL for Google-only accounts)

## Step 3: Available Endpoints

### Authentication Routes

#### 1. Login with Google
```
GET /auth/google
```
Redirects user to Google login page.

#### 2. Google OAuth Callback
```
GET /auth/google/callback
```
Handled automatically by Passport. On success, redirects to:
```
{FRONTEND_URL}/auth/success?token={accessToken}&refreshToken={refreshToken}&userId={userId}&username={username}
```

#### 3. Get Current User
```
GET /auth/user
```
Returns current authenticated user info.

#### 4. Logout
```
GET /auth/logout
```
Logs out the user and clears session.

### User Registration & Login (Traditional)

#### Register with Username/Password
```
POST /users/register
Body: {
  "username": "string",
  "password": "string (min 6 chars)",
  "phone": "string (optional)"
}
```

#### Login with Username/Password
```
POST /users/login
Body: {
  "username": "string",
  "password": "string"
}
```

## Step 4: Frontend Integration

### Example Login Button
```html
<a href="http://localhost:3000/auth/google">
  <button>Sign in with Google</button>
</a>
```

### Handle Google Callback
```javascript
// After Google redirects to /auth/success
const params = new URLSearchParams(window.location.search);
const accessToken = params.get('token');
const refreshToken = params.get('refreshToken');
const userId = params.get('userId');
const username = params.get('username');

// Store tokens in localStorage/sessionStorage
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);
```

### API Calls with Token
```javascript
const headers = {
  'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
  'Content-Type': 'application/json'
};

// Get user profile
fetch('/users/:userId', { headers })
  .then(res => res.json())
  .then(data => console.log(data));
```

## Step 5: Key Features

✓ **Automatic User Registration**: First-time Google login automatically creates user account
✓ **Unique Username Generation**: Auto-generates username from email if not provided
✓ **JWT Token System**: Generates access and refresh tokens
✓ **Session Management**: Uses cookie-session for session persistence
✓ **Mixed Authentication**: Support both Google OAuth and traditional username/password login
✓ **Profile Updates**: Users can update phone and other profile info
✓ **Refresh Token**: Automatically creates and manages refresh tokens via Redis

## Step 6: User Flow

### Google OAuth Flow:
```
User clicks "Sign in with Google"
    ↓
Redirected to /auth/google
    ↓
Google login page
    ↓
User approves permission
    ↓
Google redirects to /auth/google/callback with code
    ↓
Backend exchanges code for user info
    ↓
Check if user exists by googleId:
    - If yes: Login user
    - If no: Create new user with googleId + email
    ↓
Generate access token + refresh token
    ↓
Redirect to frontend with tokens in URL
    ↓
Frontend stores tokens and redirects to dashboard
```

## Step 7: Testing

### Test Google Login
1. Start the server: `npm start`
2. Visit: `http://localhost:3000/auth/google`
3. Login with Google account
4. Should redirect back with tokens

### Test Traditional Login
```bash
# Register
curl -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'

# Login
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

## Troubleshooting

### Issue: "Invalid OAuth Redirect URI"
**Solution**: Make sure the redirect URI in Google Console matches exactly:
- Development: `http://localhost:3000/auth/google/callback`
- Production: `https://yourdomain.com/auth/google/callback`

### Issue: "Error creating refresh token"
**Solution**: Make sure Redis is running on `localhost:6379`

### Issue: "User not authenticated"
**Solution**: Make sure session cookie is being sent with requests

### Issue: Username already exists
**Solution**: The app auto-generates unique usernames, but if there are conflicts, it appends a counter

## Production Deployment

1. Update `GOOGLE_CALLBACK_URL` to your production domain
2. Update `FRONTEND_URL` to your production frontend domain
3. Use secure session keys in production
4. Set `NODE_ENV=production`
5. Use HTTPS for OAuth
6. Add your production domain to Google Console authorized URIs

## File Changes Summary

- ✓ Updated `models/User.js` - Added googleId, email fields
- ✓ Created `config/passport.js` - Passport strategies configuration
- ✓ Updated `app.js` - Added Passport initialization
- ✓ Created `routes/auth.js` - Google OAuth routes
- ✓ Updated `.env.example` - Added Google OAuth env variables
- ✓ Updated `package.json` - Added Passport packages

## Additional Notes

- Google OAuth users don't have a password (password is NULL in database)
- Email is stored from Google profile
- Username is auto-generated from email if not provided
- Users can mix authentication methods (some logins via Google, some via username/password - different accounts)
- Refresh tokens are stored in Redis for fast access and revocation
