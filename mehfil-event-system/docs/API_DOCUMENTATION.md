# Mehfil Event System API Documentation

## Overview
The Mehfil Event System is a comprehensive event management platform designed for organizing, booking, and managing cultural events. This API provides all the necessary endpoints for users, organizers, artists, and administrators to interact with the system.

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## User Roles
- **Admin**: Full system access, can moderate content and manage users
- **Organizer**: Can create and manage events, view analytics
- **Artist**: Can create portfolio, accept event invitations
- **Attendee**: Can book tickets, write reviews, attend events

---

## 🔐 Authentication Endpoints

### Register User
```http
POST /api/users/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "attendee"
}
```

### Login User
```http
POST /api/users/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "name": "John Doe",
    "role": "attendee"
  }
}
```

---

## 🎭 Event Management

### Get All Events
```http
GET /api/events
```

**Query Parameters:**
- `page` (optional): Page number for pagination
- `limit` (optional): Number of events per page
- `category` (optional): Filter by category
- `city` (optional): Filter by city
- `status` (optional): Filter by status

### Get Event by ID
```http
GET /api/events/:id
```

### Create Event (Organizer/Admin)
```http
POST /api/events
```

**Request Body:**
```json
{
  "title": "Poetry Night",
  "description": "An evening of beautiful Urdu poetry",
  "category": "poetry",
  "dateTime": {
    "start": "2025-08-15T19:00:00Z",
    "end": "2025-08-15T22:00:00Z"
  },
  "venue": {
    "name": "Cultural Center",
    "address": {
      "street": "123 Main Street",
      "city": "New York",
      "country": "USA"
    },
    "capacity": 200
  },
  "ticketing": {
    "isTicketed": true,
    "ticketTypes": [
      {
        "name": "Standard",
        "price": 25,
        "quantity": 150
      },
      {
        "name": "VIP",
        "price": 50,
        "quantity": 50
      }
    ]
  }
}
```

### Update Event
```http
PUT /api/events/:id
```

### Delete Event
```http
DELETE /api/events/:id
```

---

## 🎫 Booking System

### Create Booking
```http
POST /api/bookings
```

**Request Body:**
```json
{
  "eventId": "event_id_here",
  "tickets": [
    {
      "ticketType": "Standard",
      "quantity": 2
    }
  ],
  "attendeeDetails": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    {
      "name": "Jane Doe",
      "email": "jane@example.com",
      "phone": "+1234567891"
    }
  ],
  "paymentMethod": "credit_card"
}
```

### Get User Bookings
```http
GET /api/bookings/user
```

### Get Booking Details
```http
GET /api/bookings/:bookingId
```

### Cancel Booking
```http
PUT /api/bookings/:bookingId/cancel
```

### Check-in Attendee (Organizer)
```http
POST /api/bookings/:bookingId/checkin
```

### Get Event Bookings (Organizer)
```http
GET /api/bookings/event/:eventId
```

---

## 💳 Payment Processing

### Process Payment
```http
POST /api/payments/process
```

**Request Body:**
```json
{
  "bookingId": "booking_id_here",
  "paymentMethod": "credit_card",
  "cardDetails": {
    "token": "card_token_here"
  },
  "billingAddress": {
    "name": "John Doe",
    "street": "123 Main St",
    "city": "New York",
    "country": "USA",
    "zipCode": "10001"
  }
}
```

### Get Payment Details
```http
GET /api/payments/:paymentId
```

### Process Refund (Organizer/Admin)
```http
POST /api/payments/refund
```

**Request Body:**
```json
{
  "paymentId": "payment_id_here",
  "amount": 25.00,
  "reason": "Event cancelled"
}
```

### Get Payment Analytics (Organizer)
```http
GET /api/payments/analytics/:eventId
```

---

## ⭐ Review System

### Create Review
```http
POST /api/reviews
```

**Request Body:**
```json
{
  "eventId": "event_id_here",
  "ratings": {
    "overall": 5,
    "venue": 4,
    "organization": 5,
    "performance": 5,
    "valueForMoney": 4
  },
  "title": "Amazing Poetry Night!",
  "content": "The event was beautifully organized...",
  "pros": ["Great venue", "Excellent performers"],
  "cons": ["Could have been longer"]
}
```

### Get Event Reviews
```http
GET /api/reviews/event/:eventId
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Reviews per page
- `sortBy` (optional): Sort by field
- `order` (optional): 'asc' or 'desc'

### Update Review
```http
PUT /api/reviews/:reviewId
```

### Delete Review
```http
DELETE /api/reviews/:reviewId
```

### Moderate Review (Organizer/Admin)
```http
PUT /api/reviews/:reviewId/moderate
```

**Request Body:**
```json
{
  "status": "approved",
  "reason": "Review meets guidelines"
}
```

### Add Organizer Response
```http
POST /api/reviews/:reviewId/response
```

**Request Body:**
```json
{
  "content": "Thank you for the wonderful feedback!"
}
```

### Vote on Review
```http
POST /api/reviews/:reviewId/vote
```

**Request Body:**
```json
{
  "helpful": true
}
```

---

## 👑 Admin Dashboard

### Get Dashboard Statistics
```http
GET /api/admin/dashboard
```

### Get Users List
```http
GET /api/admin/users
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Users per page
- `role` (optional): Filter by role
- `status` (optional): 'active' or 'inactive'
- `search` (optional): Search by name or email

### Update User Status
```http
PUT /api/admin/users/:userId
```

**Request Body:**
```json
{
  "isActive": true,
  "isVerified": true,
  "role": "organizer"
}
```

### Get Events List
```http
GET /api/admin/events
```

### Get Transactions List
```http
GET /api/admin/transactions
```

### Get System Analytics
```http
GET /api/admin/analytics
```

**Query Parameters:**
- `period` (optional): '7d', '30d', or '90d'

---

## 📊 Response Formats

### Success Response
```json
{
  "message": "Success message",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

### Paginated Response
```json
{
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 100,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## 🔒 Security Features

1. **JWT Authentication**: Secure token-based authentication
2. **Role-based Access Control**: Different permissions for different user roles
3. **Input Validation**: All inputs are validated and sanitized
4. **Fraud Detection**: Suspicious transactions are flagged
5. **SSL Encryption**: All payment data is encrypted
6. **Rate Limiting**: API calls are rate-limited to prevent abuse

---

## 📝 Event Booking Flow

1. **Browse Events**: User views available events
2. **Select Event**: User selects an event and ticket type
3. **Create Booking**: System creates a temporary booking (15 min expiry)
4. **Process Payment**: User completes payment
5. **Confirm Booking**: Booking is confirmed and QR code generated
6. **Check-in**: User presents QR code at venue for entry
7. **Review**: User can review the event after attending

---

## 🎫 Ticket Types

- **Standard**: Regular admission tickets
- **VIP**: Premium tickets with additional benefits
- **Early Bird**: Discounted tickets for early purchases
- **Student**: Discounted tickets for students
- **Group**: Bulk purchase discounts

---

## 📱 QR Code Integration

Each confirmed booking generates a unique QR code containing:
- Booking ID
- Event ID
- Attendee ID
- Security hash

This QR code is used for:
- Ticket verification
- Entry check-in
- Attendance tracking

---

## 🚀 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Set Environment Variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start MongoDB**:
   ```bash
   mongod
   ```

4. **Run the Server**:
   ```bash
   npm run dev
   ```

5. **Test the API**:
   ```bash
   curl http://localhost:5000/api/health
   ```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

---

## 📞 Support

For API support and questions:
- Email: support@mehfil.com
- Documentation: https://docs.mehfil.com
- GitHub Issues: https://github.com/mehfil/event-system/issues
