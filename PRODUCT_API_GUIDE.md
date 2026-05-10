# Product API Documentation

## Overview
Complete CRUD operations for managing products with support for stock management, categorization, and pagination.

## Base URL
```
http://localhost:3000/products
```

---

## Endpoints

### 1. Create Product
**POST** `/products`

**Description:** Create a new product

**Request Body:**
```json
{
  "name": "Product Name",
  "description": "Product description",
  "price": 99.99,
  "stock": 100,
  "category": "Electronics",
  "image_url": "https://example.com/image.jpg"
}
```

**Required Fields:**
- `name` (string, 1-255 chars)
- `price` (number, >= 0)
- `stock` (number, >= 0)

**Optional Fields:**
- `description` (string)
- `category` (string)
- `image_url` (string)

**Response (201):**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": 1,
    "name": "Product Name",
    "description": "Product description",
    "price": 99.99,
    "stock": 100,
    "category": "Electronics",
    "image_url": "https://example.com/image.jpg",
    "created_at": "2026-05-10T10:00:00.000Z"
  }
}
```

**Error Cases:**
- `400` - Missing or invalid required fields
- `409` - Product name already exists
- `500` - Server error

---

### 2. Get All Products
**GET** `/products`

**Description:** Retrieve all products with pagination

**Query Parameters:**
- `page` (integer, default: 1) - Page number
- `limit` (integer, default: 10, max: 100) - Items per page

**Example Request:**
```
GET /products?page=1&limit=10
```

**Response (200):**
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": {
    "products": [
      {
        "id": 1,
        "name": "Product 1",
        "description": "Description 1",
        "price": 99.99,
        "stock": 100,
        "category": "Electronics",
        "image_url": "https://example.com/image1.jpg",
        "created_at": "2026-05-10T10:00:00.000Z",
        "updated_at": "2026-05-10T10:00:00.000Z"
      },
      {
        "id": 2,
        "name": "Product 2",
        "description": "Description 2",
        "price": 149.99,
        "stock": 50,
        "category": "Electronics",
        "image_url": "https://example.com/image2.jpg",
        "created_at": "2026-05-10T10:01:00.000Z",
        "updated_at": "2026-05-10T10:01:00.000Z"
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

### 3. Get Product by ID
**GET** `/products/:id`

**Description:** Retrieve a single product by ID

**Path Parameters:**
- `id` (integer) - Product ID

**Example Request:**
```
GET /products/1
```

**Response (200):**
```json
{
  "success": true,
  "message": "Product retrieved successfully",
  "data": {
    "id": 1,
    "name": "Product Name",
    "description": "Product description",
    "price": 99.99,
    "stock": 100,
    "category": "Electronics",
    "image_url": "https://example.com/image.jpg",
    "created_at": "2026-05-10T10:00:00.000Z",
    "updated_at": "2026-05-10T10:00:00.000Z"
  }
}
```

**Error Cases:**
- `400` - Invalid product ID
- `404` - Product not found
- `500` - Server error

---

### 4. Get Products by Category
**GET** `/products/category/:category`

**Description:** Retrieve all products in a specific category

**Path Parameters:**
- `category` (string) - Category name

**Example Request:**
```
GET /products/category/Electronics
```

**Response (200):**
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": {
    "category": "Electronics",
    "count": 5,
    "products": [
      {
        "id": 1,
        "name": "Product 1",
        "description": "Description 1",
        "price": 99.99,
        "stock": 100,
        "category": "Electronics",
        "image_url": "https://example.com/image1.jpg",
        "created_at": "2026-05-10T10:00:00.000Z",
        "updated_at": "2026-05-10T10:00:00.000Z"
      }
    ]
  }
}
```

---

### 5. Update Product
**PUT** `/products/:id`

**Description:** Update product information

**Path Parameters:**
- `id` (integer) - Product ID

**Request Body (all optional):**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "price": 129.99,
  "stock": 150,
  "category": "New Category",
  "image_url": "https://example.com/new-image.jpg"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "id": 1,
    "name": "Updated Name",
    "description": "Updated description",
    "price": 129.99,
    "stock": 150,
    "category": "New Category",
    "image_url": "https://example.com/new-image.jpg",
    "created_at": "2026-05-10T10:00:00.000Z",
    "updated_at": "2026-05-10T10:30:00.000Z"
  }
}
```

**Error Cases:**
- `400` - Invalid input data or no fields to update
- `404` - Product not found
- `409` - New product name already exists
- `500` - Server error

---

### 6. Update Product Stock
**PATCH** `/products/:id/stock`

**Description:** Increase or decrease product stock

**Path Parameters:**
- `id` (integer) - Product ID

**Request Body:**
```json
{
  "quantity": 50
}
```

**Parameters:**
- `quantity` (number) - Positive to increase, negative to decrease stock

**Response (200):**
```json
{
  "success": true,
  "message": "Product stock updated successfully",
  "data": {
    "id": 1,
    "name": "Product Name",
    "description": "Product description",
    "price": 99.99,
    "stock": 150,
    "category": "Electronics",
    "image_url": "https://example.com/image.jpg",
    "created_at": "2026-05-10T10:00:00.000Z",
    "updated_at": "2026-05-10T10:30:00.000Z"
  }
}
```

**Example Requests:**
```bash
# Increase stock by 50
PATCH /products/1/stock
{"quantity": 50}

# Decrease stock by 30
PATCH /products/1/stock
{"quantity": -30}
```

**Error Cases:**
- `400` - Invalid ID or stock would go negative
- `404` - Product not found
- `500` - Server error

---

### 7. Delete Product
**DELETE** `/products/:id`

**Description:** Delete a product

**Path Parameters:**
- `id` (integer) - Product ID

**Example Request:**
```
DELETE /products/1
```

**Response (200):**
```json
{
  "success": true,
  "message": "Product deleted successfully",
  "data": {
    "id": 1,
    "name": "Product Name"
  }
}
```

**Error Cases:**
- `400` - Invalid product ID
- `404` - Product not found
- `500` - Server error

---

## cURL Examples

### Create Product
```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop",
    "description": "High-performance laptop",
    "price": 999.99,
    "stock": 20,
    "category": "Electronics",
    "image_url": "https://example.com/laptop.jpg"
  }'
```

### Get All Products
```bash
curl http://localhost:3000/products?page=1&limit=10
```

### Get Product by ID
```bash
curl http://localhost:3000/products/1
```

### Get Products by Category
```bash
curl http://localhost:3000/products/category/Electronics
```

### Update Product
```bash
curl -X PUT http://localhost:3000/products/1 \
  -H "Content-Type: application/json" \
  -d '{
    "price": 899.99,
    "stock": 25
  }'
```

### Update Stock
```bash
# Increase stock
curl -X PATCH http://localhost:3000/products/1/stock \
  -H "Content-Type: application/json" \
  -d '{"quantity": 10}'

# Decrease stock
curl -X PATCH http://localhost:3000/products/1/stock \
  -H "Content-Type: application/json" \
  -d '{"quantity": -5}'
```

### Delete Product
```bash
curl -X DELETE http://localhost:3000/products/1
```

---

## Database Schema

```sql
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock INT DEFAULT 0,
  category VARCHAR(100),
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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
- `409` - Conflict (duplicate name)
- `500` - Internal Server Error

---

## Validation Rules

| Field | Type | Rules |
|-------|------|-------|
| name | string | Required, 1-255 chars, unique |
| description | string | Optional, any length |
| price | number | Required, >= 0 |
| stock | number | Required, >= 0 |
| category | string | Optional |
| image_url | string | Optional, URL format |

---

## Notes

- Product table is automatically initialized on first run
- All timestamps are in UTC
- Duplicate product names are prevented
- Stock cannot go below 0
- Price can have up to 2 decimal places
