# User Management API Testing Guide

## Setup Requirements

1. **MySQL Database**
   - Make sure MySQL is running on localhost:3306
   - Database name: `mysql_redis` (or update in `.env`)
   - User: `root` (or update in `.env`)

2. **Redis Server** (optional for this phase)
   - Make sure Redis is running on localhost:6379

3. **Environment Variables**
   - Update `.env` file with your database credentials and JWT secret

## API Endpoints

### 1. Register User
**Endpoint:** `POST /users/register`

**Request:**
```bash
curl -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "password123",
    "phone": "+66812345678"
  }'
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "username": "john_doe",
    "phone": "+66812345678",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Response (Error - Duplicate Username - 409):**
```json
{
  "success": false,
  "message": "Username already exists",
  "error": "Duplicate username"
}
```

**Response (Error - Invalid Password - 400):**
```json
{
  "success": false,
  "message": "Password must be at least 6 characters",
  "error": "Password too weak"
}
```

---

### 2. Update User
**Endpoint:** `PUT /users/:id`

**Requirements:** JWT token in Authorization header

**Description:** Update any combination of username, password, and phone. Send only the fields you want to update.

**Request Examples:**

Update phone only:
```bash
curl -X PUT http://localhost:3000/users/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "phone": "+66887654321"
  }'
```

Update username and phone:
```bash
curl -X PUT http://localhost:3000/users/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "username": "new_username",
    "phone": "+66887654321"
  }'
```

Update password only:
```bash
curl -X PUT http://localhost:3000/users/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "password": "newpassword123"
  }'
```

Update all fields:
```bash
curl -X PUT http://localhost:3000/users/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "username": "new_username",
    "password": "newpassword123",
    "phone": "+66887654321"
  }'
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": 1,
    "username": "new_username",
    "phone": "+66887654321",
    "created_at": "2026-05-10T10:30:00.000Z",
    "updated_at": "2026-05-10T10:35:00.000Z"
  }
}
```

**Response (Error - No Token - 401):**
```json
{
  "success": false,
  "message": "Access token required",
  "error": "No token provided"
}
```

**Response (Error - Invalid Token - 401):**
```json
{
  "success": false,
  "message": "Invalid or expired token",
  "error": "Token verification failed"
}
```

**Response (Error - Unauthorized - 403):**
```json
{
  "success": false,
  "message": "Unauthorized to update this user",
  "error": "Permission denied"
}
```

---

### 3. Get User Profile
**Endpoint:** `GET /users/:id`

**Requirements:** JWT token in Authorization header

**Request:**
```bash
curl -X GET http://localhost:3000/users/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "id": 1,
    "username": "john_doe",
    "phone": "+66812345678",
    "created_at": "2026-05-10T10:30:00.000Z",
    "updated_at": "2026-05-10T10:35:00.000Z"
  }
}
```

**Response (Error - No Token - 401):**
```json
{
  "success": false,
  "message": "Access token required",
  "error": "No token provided"
}
```

**Response (Error - Invalid Token - 401):**
```json
{
  "success": false,
  "message": "Invalid or expired token",
  "error": "Token verification failed"
}
```

**Response (Error - User Not Found - 404):**
```json
{
  "success": false,
  "message": "User not found",
  "error": "Invalid user ID"
}
```

---

### 4. Delete User
**Endpoint:** `DELETE /users/:id`

**Requirements:** JWT token in Authorization header

**Request:**
```bash
curl -X DELETE http://localhost:3000/users/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": {
    "id": 1
  }
}
```

**Response (Error - User Not Found - 404):**
```json
{
  "success": false,
  "message": "User not found",
  "error": "Invalid user ID"
}
```

**Response (Error - Unauthorized - 403):**
```json
{
  "success": false,
  "message": "Unauthorized to delete this user",
  "error": "Permission denied"
}
```

---

## Testing with Postman

### 1. Create Register Request
- Method: `POST`
- URL: `http://localhost:3000/users/register`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "username": "testuser",
  "password": "test@1234",
  "phone": "+66812345678"
}
```

### 2. Save Token from Register Response
- Copy the `token` value from the response
- This will be used for Update and Delete operations

### 3. Create Update Request
- Method: `PUT`
- URL: `http://localhost:3000/users/1`
- Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer <YOUR_TOKEN_HERE>`
- Body (raw JSON) - Choose any combination:

**Option A: Update phone only**
```json
{
  "phone": "+66899999999"
}
```

**Option B: Update username and password**
```json
{
  "username": "newtestuser",
  "password": "newpass@123"
}
```

**Option C: Update all fields**
```json
{
  "username": "newtestuser",
  "password": "newpass@123",
  "phone": "+66899999999"
}
```

### 4. Create Get Profile Request
- Method: `GET`
- URL: `http://localhost:3000/users/1`
- Headers:
  - `Authorization: Bearer <YOUR_TOKEN_HERE>`

### 5. Create Delete Request
- Method: `DELETE`
- URL: `http://localhost:3000/users/1`
- Headers:
  - `Authorization: Bearer <YOUR_TOKEN_HERE>`

---

## Validation Rules

### Username (for registration and update)
- For registration: Required
- For update: Optional
- Length: 3-30 characters
- Format: Only alphanumeric and underscores
- Must be unique in database
- Cannot change to a username that already exists

### Password (for registration and update)
- For registration: Required
- For update: Optional
- Length: Minimum 6 characters
- Hashed with bcryptjs (10 salt rounds)
- Never returned in API responses

### Phone
- Optional in both registration and update
- Length: 7-20 characters
- Format: Digits, +, -, spaces, and parentheses only

---

## Testing Workflow

### Test 1: Register New User
1. Send POST request to `/users/register` with valid data
2. ✅ Verify: Returns 201 with token
3. ✅ Save the token for later tests

### Test 2: Register with Duplicate Username
1. Send POST request with same username as Test 1
2. ✅ Verify: Returns 409 "Username already exists"

### Test 3: Register with Weak Password
1. Send POST request with password < 6 characters
2. ✅ Verify: Returns 400 "Password too weak"

### Test 4: Update User Without Token
1. Send PUT request without Authorization header
2. ✅ Verify: Returns 401 "No token provided"

### Test 5: Update User Phone Only
1. Send PUT request with token from Test 1
2. Body: `{"phone": "+66887654321"}`
3. ✅ Verify: Returns 200 with updated phone
4. ✅ Verify: Username remains unchanged

### Test 6: Update User Password Only
1. Send PUT request with token from Test 1
2. Body: `{"password": "newpassword123"}`
3. ✅ Verify: Returns 200
4. ✅ Verify: Password is NOT returned in response
5. ✅ Test: Can login with new password

### Test 7: Update User Username and Phone
1. Send PUT request with token from Test 1
2. Body: `{"username": "updated_user", "phone": "+66899999999"}`
3. ✅ Verify: Returns 200 with both fields updated

### Test 8: Update with Weak Password
1. Send PUT request with token from Test 1
2. Body: `{"password": "123"}`
3. ✅ Verify: Returns 400 "Password too weak"

### Test 9: Update with Duplicate Username
1. Register second user with username "user2"
2. Try to update first user's username to "user2"
3. ✅ Verify: Returns 409 "Username already exists"

### Test 10: Get User Profile Without Token
1. Send GET request without Authorization header
2. ✅ Verify: Returns 401 "No token provided"

### Test 11: Get User Profile With Valid Token
1. Send GET request with token from Test 1
2. ✅ Verify: Returns 200 with user profile data
3. ✅ Verify: Password is NOT returned in response

### Test 12: Delete User Without Token
1. Send DELETE request without Authorization header
2. ✅ Verify: Returns 401 "No token provided"

### Test 13: Delete User With Valid Token
1. Send DELETE request with token from Test 1
2. ✅ Verify: Returns 200 "User deleted successfully"

### Test 14: Try to Get Deleted User Profile
1. Send GET request for the deleted user
2. ✅ Verify: Returns 404 "User not found"

---

## Database Verification

### Check Users Table
```sql
SELECT * FROM users;
```

### Check User by ID
```sql
SELECT id, username, phone, created_at, updated_at FROM users WHERE id = 1;
```

### Check Username Uniqueness
```sql
SELECT COUNT(*) FROM users WHERE username = 'john_doe';
```

---

## Troubleshooting

### Connection Issues
- Verify MySQL is running: `mysql -u root -p`
- Check database name in `.env`
- Check port in `.env`

### JWT Token Issues
- Token should be in format: `Bearer <token>`
- Token expires in 7 days by default
- Check `JWT_SECRET` in `.env`

### Database Errors
- Ensure `users` table is created
- Check column names match the Model
- Verify user has proper permissions

---

## Next Steps

1. ✅ Implement API endpoints for Register, Update, Delete
2. ⬜ Add Login endpoint (POST /users/login)
3. ⬜ Add Get User Profile endpoint (GET /users/:id)
4. ⬜ Add Change Password endpoint (PUT /users/:id/change-password)
5. ⬜ Add User Roles/Permissions system
6. ⬜ Add Rate Limiting
7. ⬜ Add Swagger/API Documentation
