# Purchase API Documentation

## Overview
Complete CRUD operations for managing purchases/orders linking users to products with inventory tracking and order status management.

## Base URL
```
http://localhost:3000/purchases
```

---

## Endpoints

### 1. Create Purchase
**POST** `/purchases`

**Description:** Create a new purchase order

**Request Body:**
```json
{
  "user_id": 1,
  "product_id": 2,
  "quantity": 5,
  "price_per_unit": 99.99,
  "payment_method": "credit_card",
  "notes": "Express delivery requested"
}
```

**Required Fields:**
- `user_id` (integer) - ID of the user making the purchase
- `product_id` (integer) - ID of the product
- `quantity` (integer, > 0) - Number of units
- `price_per_unit` (number, >= 0) - Price per unit

**Optional Fields:**
- `payment_method` (string) - e.g., "credit_card", "bank_transfer", "cash"
- `notes` (string) - Additional notes about the purchase

**Response (201):**
```json
{
  "success": true,
  "message": "Purchase created successfully",
  "data": {
    "id": 1,
    "user_id": 1,
    "product_id": 2,
    "quantity": 5,
    "price_per_unit": 99.99,
    "total_price": 499.95,
    "status": "pending",
    "payment_method": "credit_card",
    "notes": "Express delivery requested",
    "created_at": "2026-05-10T10:00:00.000Z"
  }
}
```

**Error Cases:**
- `400` - Missing required fields or invalid values
- `400` - Insufficient stock
- `404` - User or product not found
- `500` - Server error

---

### 2. Get All Purchases
**GET** `/purchases`

**Description:** Retrieve all purchases with pagination

**Query Parameters:**
- `page` (integer, default: 1) - Page number
- `limit` (integer, default: 10, max: 100) - Items per page

**Example Request:**
```
GET /purchases?page=1&limit=10
```

**Response (200):**
```json
{
  "success": true,
  "message": "Purchases retrieved successfully",
  "data": {
    "purchases": [
      {
        "id": 1,
        "user_id": 1,
        "product_id": 2,
        "quantity": 5,
        "price_per_unit": 99.99,
        "total_price": 499.95,
        "status": "pending",
        "payment_method": "credit_card",
        "notes": "Express delivery requested",
        "username": "john_doe",
        "product_name": "Laptop",
        "created_at": "2026-05-10T10:00:00.000Z",
        "updated_at": "2026-05-10T10:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  }
}
```

---

### 3. Get Purchase by ID
**GET** `/purchases/:id`

**Description:** Retrieve a single purchase by ID

**Path Parameters:**
- `id` (integer) - Purchase ID

**Example Request:**
```
GET /purchases/1
```

**Response (200):**
```json
{
  "success": true,
  "message": "Purchase retrieved successfully",
  "data": {
    "id": 1,
    "user_id": 1,
    "product_id": 2,
    "quantity": 5,
    "price_per_unit": 99.99,
    "total_price": 499.95,
    "status": "pending",
    "payment_method": "credit_card",
    "notes": "Express delivery requested",
    "username": "john_doe",
    "product_name": "Laptop",
    "created_at": "2026-05-10T10:00:00.000Z",
    "updated_at": "2026-05-10T10:00:00.000Z"
  }
}
```

**Error Cases:**
- `400` - Invalid purchase ID
- `404` - Purchase not found
- `500` - Server error

---

### 4. Get Purchases by User
**GET** `/purchases/user/:user_id`

**Description:** Retrieve all purchases made by a specific user

**Path Parameters:**
- `user_id` (integer) - User ID

**Query Parameters:**
- `page` (integer, default: 1)
- `limit` (integer, default: 10, max: 100)

**Example Request:**
```
GET /purchases/user/1?page=1&limit=10
```

**Response (200):**
```json
{
  "success": true,
  "message": "User purchases retrieved successfully",
  "data": {
    "user_id": 1,
    "username": "john_doe",
    "purchases": [
      {
        "id": 1,
        "user_id": 1,
        "product_id": 2,
        "quantity": 5,
        "price_per_unit": 99.99,
        "total_price": 499.95,
        "status": "completed",
        "payment_method": "credit_card",
        "notes": "Express delivery requested",
        "username": "john_doe",
        "product_name": "Laptop",
        "created_at": "2026-05-10T10:00:00.000Z",
        "updated_at": "2026-05-10T10:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 5,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

---

### 5. Get Purchases by Product
**GET** `/purchases/product/:product_id`

**Description:** Retrieve all purchases of a specific product

**Path Parameters:**
- `product_id` (integer) - Product ID

**Query Parameters:**
- `page` (integer, default: 1)
- `limit` (integer, default: 10, max: 100)

**Example Request:**
```
GET /purchases/product/2?page=1&limit=10
```

**Response (200):**
```json
{
  "success": true,
  "message": "Product purchases retrieved successfully",
  "data": {
    "product_id": 2,
    "product_name": "Laptop",
    "purchases": [
      {
        "id": 1,
        "user_id": 1,
        "product_id": 2,
        "quantity": 5,
        "price_per_unit": 99.99,
        "total_price": 499.95,
        "status": "completed",
        "payment_method": "credit_card",
        "notes": "Express delivery requested",
        "username": "john_doe",
        "product_name": "Laptop",
        "created_at": "2026-05-10T10:00:00.000Z",
        "updated_at": "2026-05-10T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "count": 1
    }
  }
}
```

---

### 6. Get Purchases by Status
**GET** `/purchases/status/:status`

**Description:** Retrieve purchases filtered by status

**Path Parameters:**
- `status` (string) - Status filter: `pending`, `completed`, or `cancelled`

**Query Parameters:**
- `page` (integer, default: 1)
- `limit` (integer, default: 10, max: 100)

**Example Request:**
```
GET /purchases/status/completed?page=1&limit=10
```

**Response (200):**
```json
{
  "success": true,
  "message": "Purchases retrieved successfully",
  "data": {
    "status": "completed",
    "purchases": [
      {
        "id": 1,
        "user_id": 1,
        "product_id": 2,
        "quantity": 5,
        "price_per_unit": 99.99,
        "total_price": 499.95,
        "status": "completed",
        "payment_method": "credit_card",
        "notes": "Express delivery requested",
        "username": "john_doe",
        "product_name": "Laptop",
        "created_at": "2026-05-10T10:00:00.000Z",
        "updated_at": "2026-05-10T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "count": 1
    }
  }
}
```

---

### 7. Update Purchase
**PUT** `/purchases/:id`

**Description:** Update purchase information

**Path Parameters:**
- `id` (integer) - Purchase ID

**Request Body (all optional):**
```json
{
  "quantity": 10,
  "price_per_unit": 89.99,
  "status": "completed",
  "payment_method": "bank_transfer",
  "notes": "Updated delivery address"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Purchase updated successfully",
  "data": {
    "id": 1,
    "user_id": 1,
    "product_id": 2,
    "quantity": 10,
    "price_per_unit": 89.99,
    "total_price": 899.90,
    "status": "completed",
    "payment_method": "bank_transfer",
    "notes": "Updated delivery address",
    "username": "john_doe",
    "product_name": "Laptop",
    "created_at": "2026-05-10T10:00:00.000Z",
    "updated_at": "2026-05-10T10:30:00.000Z"
  }
}
```

**Error Cases:**
- `400` - Invalid input data or no fields to update
- `404` - Purchase not found
- `500` - Server error

---

### 8. Update Purchase Status
**PATCH** `/purchases/:id/status`

**Description:** Update the status of a purchase

**Path Parameters:**
- `id` (integer) - Purchase ID

**Request Body:**
```json
{
  "status": "completed"
}
```

**Valid Status Values:**
- `pending` - Order pending processing
- `completed` - Order completed
- `cancelled` - Order cancelled

**Response (200):**
```json
{
  "success": true,
  "message": "Purchase status updated successfully",
  "data": {
    "id": 1,
    "user_id": 1,
    "product_id": 2,
    "quantity": 5,
    "price_per_unit": 99.99,
    "total_price": 499.95,
    "status": "completed",
    "payment_method": "credit_card",
    "notes": "Express delivery requested",
    "username": "john_doe",
    "product_name": "Laptop",
    "created_at": "2026-05-10T10:00:00.000Z",
    "updated_at": "2026-05-10T10:30:00.000Z"
  }
}
```

**Error Cases:**
- `400` - Invalid status value
- `404` - Purchase not found
- `500` - Server error

---

### 9. Delete Purchase
**DELETE** `/purchases/:id`

**Description:** Delete a purchase record

**Path Parameters:**
- `id` (integer) - Purchase ID

**Example Request:**
```
DELETE /purchases/1
```

**Response (200):**
```json
{
  "success": true,
  "message": "Purchase deleted successfully",
  "data": {
    "id": 1,
    "user_id": 1,
    "product_id": 2
  }
}
```

**Error Cases:**
- `400` - Invalid purchase ID
- `404` - Purchase not found
- `500` - Server error

---

### 10. Get User Purchase Summary
**GET** `/purchases/user/:user_id/summary`

**Description:** Get purchase statistics for a specific user

**Path Parameters:**
- `user_id` (integer) - User ID

**Example Request:**
```
GET /purchases/user/1/summary
```

**Response (200):**
```json
{
  "success": true,
  "message": "User summary retrieved successfully",
  "data": {
    "user_id": 1,
    "username": "john_doe",
    "summary": {
      "total_purchases": 5,
      "total_items": 25,
      "total_spent": 2499.75,
      "completed_purchases": 3,
      "pending_purchases": 1,
      "cancelled_purchases": 1
    }
  }
}
```

---

### 11. Get Product Sales Summary
**GET** `/purchases/product/:product_id/summary`

**Description:** Get sales statistics for a specific product

**Path Parameters:**
- `product_id` (integer) - Product ID

**Example Request:**
```
GET /purchases/product/2/summary
```

**Response (200):**
```json
{
  "success": true,
  "message": "Product summary retrieved successfully",
  "data": {
    "product_id": 2,
    "product_name": "Laptop",
    "summary": {
      "total_sales": 10,
      "total_units_sold": 50,
      "total_revenue": 4999.50,
      "average_order_value": 499.95
    }
  }
}
```

---

## cURL Examples

### Create Purchase
```bash
curl -X POST http://localhost:3000/purchases \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "product_id": 2,
    "quantity": 5,
    "price_per_unit": 99.99,
    "payment_method": "credit_card",
    "notes": "Express delivery requested"
  }'
```

### Get All Purchases
```bash
curl http://localhost:3000/purchases?page=1&limit=10
```

### Get Purchase by ID
```bash
curl http://localhost:3000/purchases/1
```

### Get User Purchases
```bash
curl http://localhost:3000/purchases/user/1?page=1&limit=10
```

### Get Product Purchases
```bash
curl http://localhost:3000/purchases/product/2?page=1&limit=10
```

### Get Purchases by Status
```bash
curl http://localhost:3000/purchases/status/completed?page=1&limit=10
```

### Update Purchase
```bash
curl -X PUT http://localhost:3000/purchases/1 \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 10,
    "status": "completed"
  }'
```

### Update Purchase Status
```bash
curl -X PATCH http://localhost:3000/purchases/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```

### Delete Purchase
```bash
curl -X DELETE http://localhost:3000/purchases/1
```

### Get User Summary
```bash
curl http://localhost:3000/purchases/user/1/summary
```

### Get Product Summary
```bash
curl http://localhost:3000/purchases/product/2/summary
```

---

## Database Schema

```sql
CREATE TABLE purchases (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  price_per_unit DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
  payment_method VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_product_id (product_id),
  INDEX idx_status (status)
)
```

---

## Response Format

All responses follow this format:

```json
{
  "success": true|false,
  "message": "Description of operation result",
  "data": {},
  "error": "Error message (if applicable)"
}
```

**Status Codes:**
- `200` - OK (successful GET/PUT/PATCH/DELETE)
- `201` - Created (successful POST)
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error

---

## Validation Rules

| Field | Type | Rules |
|-------|------|-------|
| user_id | integer | Required, must exist in users table |
| product_id | integer | Required, must exist in products table |
| quantity | integer | Required, > 0 |
| price_per_unit | number | Required, >= 0 |
| status | enum | 'pending', 'completed', or 'cancelled' |
| payment_method | string | Optional |
| notes | string | Optional |

---

## Business Logic

1. **Stock Validation**: When creating a purchase, system checks if product has sufficient stock
2. **Total Price**: Automatically calculated as `quantity × price_per_unit`
3. **Foreign Keys**: Both user_id and product_id are validated against respective tables
4. **Cascade Delete**: If a user or product is deleted, related purchases are also deleted
5. **Status Tracking**: Purchases track order status through lifecycle (pending → completed or cancelled)
6. **Indexes**: Optimized indexes on user_id, product_id, and status for faster queries

---

## Notes

- Purchase table is automatically initialized on first run
- All timestamps are in UTC
- Total price is automatically calculated and updated
- Stock must be checked before creating purchase
- Quantity must be positive
- Valid payment methods are customizable (not restricted)
