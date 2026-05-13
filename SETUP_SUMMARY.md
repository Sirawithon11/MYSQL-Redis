# Google OAuth Implementation - Quick Start

## ✅ What's Been Added

### 1. **New Files Created**
- `config/passport.js` - Passport strategies configuration
- `routes/auth.js` - Google OAuth routes
- `public/index.html` - Demo login/register page
- `GOOGLE_OAUTH_GUIDE.md` - Complete implementation guide

### 2. **Files Updated**
- `models/User.js` - Added `googleId` and `email` fields
- `app.js` - Integrated Passport authentication
- `package.json` - New dependencies installed
- `.env` - Added Google OAuth environment variables

### 3. **New NPM Packages**
```
✓ passport
✓ passport-google-oauth20
✓ passport-local
✓ express-session
```

---

## 🚀 Getting Started

### Step 1: Get Google OAuth Credentials
1. Visit: https://console.cloud.google.com/
2. Create a new project (or use existing)
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Type: Web application
   - Authorized redirect URIs:
     - `http://localhost:3000/auth/google/callback` (dev)
     - `https://yourdomain.com/auth/google/callback` (prod)
5. Copy **Client ID** and **Client Secret**

### Step 2: Update Environment Variables
Edit `.env` file:
```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
FRONTEND_URL=http://localhost:3000
```

### Step 3: Run the Server
```bash
npm start
```

Server will start on `http://localhost:3000`

### Step 4: Test Google Login
Open: `http://localhost:3000/index.html`

You'll see a demo page with:
- ✓ Google Sign In button
- ✓ Traditional Register form
- ✓ Traditional Login form
- ✓ User profile display

---

## 🔌 API Endpoints

### Google OAuth
- `GET /auth/google` - Redirect to Google login
- `GET /auth/google/callback` - Google callback (auto-handled)
- `GET /auth/logout` - Logout user
- `GET /auth/user` - Get current user

### User Management
- `POST /users/register` - Register with username/password
- `POST /users/login` - Login with username/password
- `GET /users/:id` - Get user profile
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete account
- `POST /users/refresh` - Refresh access token

---

## 💾 Database Changes

Your MySQL users table now supports:
- **googleId** - Unique identifier from Google
- **email** - Email from Google profile
- **password** - Optional (NULL for Google-only accounts)

New users from Google get:
- Auto-generated username from email
- Email stored from Google profile
- No password (OAuth only)

---

## 🧪 Testing Endpoints

### Test Google Login (Browser)
```
http://localhost:3000/index.html → Click "Sign in with Google"
```

### Test Register (Terminal)
```bash
curl -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123",
    "phone": "1234567890"
  }'
```

### Test Login (Terminal)
```bash
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": 1,
    "username": "testuser",
    "phone": "1234567890",
    "accessToken": "eyJ...",
    "refreshToken": "abc..."
  }
}
```

---

## 📊 User Flow Diagram

### Google OAuth Flow
```
┌─────────────────┐
│  User clicks    │
│  "Sign in with  │
│    Google"      │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  Redirect to /auth/     │
│  google (Passport)      │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  User logs in via       │
│  Google login page      │
└────────┬────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Google redirects to     │
│  /auth/google/callback   │
│  with auth code          │
└────────┬─────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Server exchanges code  │
│  for user info          │
└────────┬────────────────┘
         │
         ▼
    ┌────────────────┐
    │ Check if user  │
    │ exists by ID   │
    └───────┬────────┘
            │
    ┌───────┴───────┐
    │               │
    ▼               ▼
  YES              NO
    │               │
    │      ┌────────┴────────┐
    │      │  Create new     │
    │      │  user with      │
    │      │  googleId       │
    │      └────────┬────────┘
    │               │
    └───────┬───────┘
            │
            ▼
    ┌─────────────────┐
    │  Generate JWT   │
    │  access token   │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │  Create refresh │
    │  token in Redis │
    └────────┬────────┘
             │
             ▼
    ┌────────────────────┐
    │  Redirect to       │
    │  frontend with     │
    │  tokens in URL     │
    └────────┬───────────┘
             │
             ▼
    ┌────────────────────┐
    │  Frontend stores   │
    │  tokens &          │
    │  redirects to      │
    │  dashboard         │
    └────────────────────┘
```

---

## 🔐 Security Notes

- ✓ Passwords are hashed with bcryptjs
- ✓ JWT tokens for API authentication
- ✓ Refresh tokens stored in Redis
- ✓ Session cookies with expiration
- ✓ HTTPS recommended for production
- ✓ Never commit .env with real credentials

---

## 📝 Additional Resources

- [Passport.js Documentation](http://www.passportjs.org/)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- Complete guide: See `GOOGLE_OAUTH_GUIDE.md`

---

## 🆘 Troubleshooting

### Issue: "Invalid OAuth Redirect URI"
**Fix**: Ensure redirect URI in Google Console matches your app exactly

### Issue: "GOOGLE_CLIENT_ID is undefined"
**Fix**: Add credentials to `.env` file and restart server

### Issue: "User not found after login"
**Fix**: Make sure database migration completed (check MySQL users table)

### Issue: "Session not persisting"
**Fix**: Verify Redis is running and accessible

---

## ✨ What You Can Do Now

✓ Users can register with username/password  
✓ Users can login with username/password  
✓ Users can login with Google  
✓ New Google users get auto-registered  
✓ Access and refresh tokens are generated  
✓ Sessions are maintained across requests  
✓ Users can logout and clear session  

---

Enjoy! 🎉 Your app now has full Google OAuth integration!
