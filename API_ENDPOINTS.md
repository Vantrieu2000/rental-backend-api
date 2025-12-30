# API Endpoints Documentation

Complete reference for all API endpoints in the Rental Management Backend API.

**Base URL**: `http://localhost:3000`

**API Documentation**: `http://localhost:3000/api/docs` (Swagger UI)

## Table of Contents

- [Authentication](#authentication)
- [Users](#users)
- [Properties](#properties)
- [Rooms](#rooms)
- [Tenants](#tenants)
- [Payments](#payments)
- [Reminders](#reminders)
- [Notifications](#notifications)

---

## Authentication

All endpoints except `/auth/login` and `/auth/register` require JWT authentication.

**Authentication Header**:
```
Authorization: Bearer <access_token>
```

### POST /auth/register

Register a new user account.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "+84901234567",
  "role": "owner",
  "language": "vi",
  "currency": "VND",
  "timezone": "Asia/Ho_Chi_Minh"
}
```

**Response**: `201 Created`
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "owner"
  }
}
```

### POST /auth/login

Login with email and password.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**: `200 OK` (same as register)

### POST /auth/refresh

Refresh access token using refresh token.

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response**: `200 OK`
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST /auth/logout

Logout current user (requires authentication).

**Response**: `200 OK`
```json
{
  "message": "Logout successful"
}
```

---

## Properties

### GET /properties

Get all properties for the authenticated user.

**Query Parameters**:
- `search` (optional): Search by name or address
- `sortBy` (optional): Sort field (name, createdAt)
- `sortOrder` (optional): Sort order (asc, desc)

**Response**: `200 OK`
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Building A",
    "address": "123 Main St, District 1, HCMC",
    "totalRooms": 10,
    "defaultElectricityRate": 3500,
    "defaultWaterRate": 20000,
    "defaultGarbageRate": 50000,
    "defaultParkingRate": 100000,
    "billingDayOfMonth": 1,
    "reminderDaysBefore": 3,
    "ownerId": "507f1f77bcf86cd799439012",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### GET /properties/:id

Get property by ID.

**Response**: `200 OK` (single property object)

### POST /properties

Create a new property.

**Request Body**:
```json
{
  "name": "Building A",
  "address": "123 Main St, District 1, HCMC",
  "totalRooms": 10,
  "defaultElectricityRate": 3500,
  "defaultWaterRate": 20000,
  "defaultGarbageRate": 50000,
  "defaultParkingRate": 100000,
  "billingDayOfMonth": 1,
  "reminderDaysBefore": 3
}
```

**Response**: `201 Created` (property object)

### PATCH /properties/:id

Update property.

**Request Body**: (partial property fields)

**Response**: `200 OK` (updated property object)

### DELETE /properties/:id

Delete property (only if no rooms exist).

**Response**: `204 No Content`

### GET /properties/:id/statistics

Get property statistics.

**Response**: `200 OK`
```json
{
  "totalRooms": 10,
  "occupiedRooms": 7,
  "vacantRooms": 3,
  "vacancyRate": 30,
  "totalRevenue": 50000000,
  "unpaidAmount": 5000000
}
```

---

## Rooms

### GET /rooms

Get all rooms with filters.

**Query Parameters**:
- `propertyId` (optional): Filter by property
- `status` (optional): Filter by status (vacant, occupied, maintenance)
- `minPrice` (optional): Minimum rental price
- `maxPrice` (optional): Maximum rental price

**Response**: `200 OK`
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "propertyId": "507f1f77bcf86cd799439012",
    "roomCode": "A101",
    "roomName": "Room 101",
    "status": "occupied",
    "rentalPrice": 5000000,
    "electricityFee": 3500,
    "waterFee": 20000,
    "garbageFee": 50000,
    "parkingFee": 100000,
    "currentTenantId": "507f1f77bcf86cd799439013",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### GET /rooms/:id

Get room by ID with populated tenant data.

**Response**: `200 OK` (room object with tenant)

### POST /rooms

Create a new room.

**Request Body**:
```json
{
  "propertyId": "507f1f77bcf86cd799439012",
  "roomCode": "A101",
  "roomName": "Room 101",
  "status": "vacant",
  "rentalPrice": 5000000,
  "electricityFee": 3500,
  "waterFee": 20000,
  "garbageFee": 50000,
  "parkingFee": 100000
}
```

**Response**: `201 Created` (room object)

### PATCH /rooms/:id

Update room.

**Request Body**: (partial room fields)

**Response**: `200 OK` (updated room object)

### POST /rooms/:id/assign-tenant

Assign tenant to room.

**Request Body**:
```json
{
  "tenantId": "507f1f77bcf86cd799439013"
}
```

**Response**: `200 OK` (updated room object)

### POST /rooms/:id/vacate

Vacate room (remove tenant).

**Response**: `200 OK` (updated room object)

---

## Tenants

### GET /tenants

Get all tenants with filters.

**Query Parameters**:
- `roomId` (optional): Filter by room
- `active` (optional): Filter by active status (true/false)
- `search` (optional): Search by name or phone

**Response**: `200 OK`
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "phone": "+84901234567",
    "email": "john@example.com",
    "idNumber": "123456789",
    "roomId": "507f1f77bcf86cd799439012",
    "moveInDate": "2024-01-01T00:00:00.000Z",
    "moveOutDate": null,
    "emergencyContact": {
      "name": "Jane Doe",
      "phone": "+84907654321",
      "relationship": "Sister"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### GET /tenants/:id

Get tenant by ID.

**Response**: `200 OK` (tenant object)

### POST /tenants

Create a new tenant.

**Request Body**:
```json
{
  "name": "John Doe",
  "phone": "+84901234567",
  "email": "john@example.com",
  "idNumber": "123456789",
  "roomId": "507f1f77bcf86cd799439012",
  "moveInDate": "2024-01-01T00:00:00.000Z",
  "emergencyContact": {
    "name": "Jane Doe",
    "phone": "+84907654321",
    "relationship": "Sister"
  }
}
```

**Response**: `201 Created` (tenant object)

### PATCH /tenants/:id

Update tenant.

**Request Body**: (partial tenant fields)

**Response**: `200 OK` (updated tenant object)

### POST /tenants/:id/assign

Assign tenant to a room.

**Request Body**:
```json
{
  "roomId": "507f1f77bcf86cd799439012",
  "moveInDate": "2024-01-01T00:00:00.000Z"
}
```

**Response**: `200 OK` (updated tenant object)

### POST /tenants/:id/vacate

Vacate tenant from room.

**Request Body**:
```json
{
  "moveOutDate": "2024-12-31T00:00:00.000Z"
}
```

**Response**: `200 OK` (updated tenant object)

### GET /tenants/:id/history

Get tenant rental history.

**Response**: `200 OK`
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "tenantId": "507f1f77bcf86cd799439012",
    "roomId": "507f1f77bcf86cd799439013",
    "moveInDate": "2024-01-01T00:00:00.000Z",
    "moveOutDate": "2024-12-31T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

## Payments

### GET /payments

Get all payments with filters.

**Query Parameters**:
- `propertyId` (optional): Filter by property
- `roomId` (optional): Filter by room
- `tenantId` (optional): Filter by tenant
- `status` (optional): Filter by status (unpaid, partial, paid, overdue)
- `dueDateFrom` (optional): Filter by due date from
- `dueDateTo` (optional): Filter by due date to

**Response**: `200 OK`
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "roomId": "507f1f77bcf86cd799439012",
    "tenantId": "507f1f77bcf86cd799439013",
    "propertyId": "507f1f77bcf86cd799439014",
    "billingMonth": 1,
    "billingYear": 2024,
    "dueDate": "2024-01-05T00:00:00.000Z",
    "rentalAmount": 5000000,
    "electricityAmount": 350000,
    "waterAmount": 100000,
    "garbageAmount": 50000,
    "parkingAmount": 100000,
    "adjustments": 0,
    "totalAmount": 5600000,
    "status": "unpaid",
    "paidAmount": 0,
    "paidDate": null,
    "paymentMethod": null,
    "notes": "",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### GET /payments/:id

Get payment by ID.

**Response**: `200 OK` (payment object)

### POST /payments

Create a new payment.

**Request Body**:
```json
{
  "roomId": "507f1f77bcf86cd799439012",
  "tenantId": "507f1f77bcf86cd799439013",
  "propertyId": "507f1f77bcf86cd799439014",
  "billingMonth": 1,
  "billingYear": 2024,
  "dueDate": "2024-01-05T00:00:00.000Z",
  "rentalAmount": 5000000,
  "electricityAmount": 350000,
  "waterAmount": 100000,
  "garbageAmount": 50000,
  "parkingAmount": 100000,
  "adjustments": 0,
  "notes": ""
}
```

**Response**: `201 Created` (payment object)

### PUT /payments/:id/mark-paid

Mark payment as paid.

**Request Body**:
```json
{
  "paidAmount": 5600000,
  "paidDate": "2024-01-05T00:00:00.000Z",
  "paymentMethod": "bank_transfer",
  "notes": "Paid via bank transfer"
}
```

**Response**: `200 OK` (updated payment object)

### GET /payments/overdue

Get overdue payments for a property.

**Query Parameters**:
- `propertyId` (required): Property ID

**Response**: `200 OK` (array of overdue payments)

### GET /rooms/:roomId/payment-history

Get payment history for a room.

**Response**: `200 OK` (array of payments)

### POST /payments/calculate-fees

Calculate fees for a room and billing period.

**Request Body**:
```json
{
  "roomId": "507f1f77bcf86cd799439012",
  "month": 1,
  "year": 2024
}
```

**Response**: `200 OK`
```json
{
  "rentalAmount": 5000000,
  "electricityAmount": 350000,
  "waterAmount": 100000,
  "garbageAmount": 50000,
  "parkingAmount": 100000,
  "totalAmount": 5600000
}
```

### GET /payments/statistics

Get payment statistics for a property.

**Query Parameters**:
- `propertyId` (required): Property ID
- `startDate` (optional): Start date for statistics
- `endDate` (optional): End date for statistics

**Response**: `200 OK`
```json
{
  "totalRevenue": 50000000,
  "paidCount": 45,
  "unpaidCount": 5,
  "overdueCount": 2,
  "latePaymentRate": 4.4
}
```

---

## Reminders

### GET /reminders

Get all reminders with filters.

**Query Parameters**:
- `propertyId` (optional): Filter by property
- `roomId` (optional): Filter by room
- `paymentId` (optional): Filter by payment
- `type` (optional): Filter by type (due_date, recurring, custom)
- `status` (optional): Filter by status (scheduled, sent, cancelled)
- `scheduledDateFrom` (optional): Filter by scheduled date from
- `scheduledDateTo` (optional): Filter by scheduled date to

**Response**: `200 OK`
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "paymentId": "507f1f77bcf86cd799439012",
    "roomId": "507f1f77bcf86cd799439013",
    "propertyId": "507f1f77bcf86cd799439014",
    "type": "due_date",
    "scheduledDate": "2024-01-02T00:00:00.000Z",
    "intervalDays": null,
    "status": "scheduled",
    "sentAt": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### GET /reminders/:id

Get reminder by ID.

**Response**: `200 OK` (reminder object)

### POST /reminders

Create a new reminder.

**Request Body**:
```json
{
  "paymentId": "507f1f77bcf86cd799439012",
  "roomId": "507f1f77bcf86cd799439013",
  "propertyId": "507f1f77bcf86cd799439014",
  "type": "due_date",
  "scheduledDate": "2024-01-02T00:00:00.000Z",
  "intervalDays": 7
}
```

**Response**: `201 Created` (reminder object)

### PATCH /reminders/:id

Update reminder.

**Request Body**: (partial reminder fields)

**Response**: `200 OK` (updated reminder object)

### DELETE /reminders/:id

Delete reminder.

**Response**: `204 No Content`

### POST /reminders/:id/process

Process a reminder (mark as sent and create log).

**Request Body**:
```json
{
  "recipientId": "507f1f77bcf86cd799439012",
  "delivered": true,
  "notificationId": "notif-123",
  "error": null
}
```

**Response**: `200 OK` (updated reminder object)

### GET /reminders/:id/logs

Get reminder logs.

**Response**: `200 OK`
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "reminderId": "507f1f77bcf86cd799439012",
    "paymentId": "507f1f77bcf86cd799439013",
    "roomId": "507f1f77bcf86cd799439014",
    "sentAt": "2024-01-02T00:00:00.000Z",
    "recipientId": "507f1f77bcf86cd799439015",
    "notificationId": "notif-123",
    "delivered": true,
    "error": null,
    "createdAt": "2024-01-02T00:00:00.000Z"
  }
]
```

---

## Notifications

### GET /notifications

Get all notifications with filters.

**Query Parameters**:
- `propertyId` (optional): Filter by property
- `roomId` (optional): Filter by room
- `type` (optional): Filter by type (overdue, due_soon, unpaid)
- `priority` (optional): Filter by priority (high, medium, low)

**Response**: `200 OK`
```json
[
  {
    "paymentId": "507f1f77bcf86cd799439011",
    "roomId": "507f1f77bcf86cd799439012",
    "roomName": "Room 101",
    "tenantId": "507f1f77bcf86cd799439013",
    "tenantName": "John Doe",
    "type": "overdue",
    "message": "Payment is 5 days overdue",
    "dueDate": "2024-01-05T00:00:00.000Z",
    "amount": 5600000,
    "daysOverdue": 5,
    "priority": "high"
  }
]
```

### GET /notifications/summary

Get notification summary for a property.

**Query Parameters**:
- `propertyId` (required): Property ID

**Response**: `200 OK`
```json
{
  "total": 15,
  "overdue": 5,
  "dueSoon": 7,
  "unpaid": 3,
  "highPriority": 5,
  "mediumPriority": 7,
  "lowPriority": 3
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/endpoint"
}
```

### Common Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `204 No Content`: Request successful, no content to return
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required or failed
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., duplicate email)
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

---

## Rate Limiting

API requests are rate-limited to prevent abuse:

- **Default**: 100 requests per 15 minutes per IP
- **Response Header**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- **Error**: `429 Too Many Requests` when limit exceeded

---

## Pagination

For endpoints that return lists, pagination is supported:

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

**Response Headers**:
- `X-Total-Count`: Total number of items
- `X-Page`: Current page number
- `X-Page-Count`: Total number of pages

---

## Additional Notes

1. All dates are in ISO 8601 format (UTC)
2. All monetary amounts are in the smallest currency unit (e.g., VND)
3. All IDs are MongoDB ObjectIds (24-character hex strings)
4. Authentication tokens expire after 15 minutes (access) and 7 days (refresh)
5. For detailed request/response schemas, see Swagger documentation at `/api/docs`
