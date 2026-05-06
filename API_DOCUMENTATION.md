# 🔌 API Documentation — EcoVault

> Complete REST API specification with endpoint details, request/response formats, and authentication requirements.

---

## Base URL

```
Production:  https://api.ecosparkhub.com/api/v1
Development: http://localhost:5000/api/v1
```

## Authentication

All protected endpoints require a valid session cookie or a Bearer token:
```
Cookie: better-auth.session-token=<token>
```
OR
```
Authorization: Bearer <session_token>
```

## Response Format (Standardized)

### Success Response
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Ideas retrieved successfully",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

### Error Response (RFC 7807)
```json
{
  "success": false,
  "statusCode": 422,
  "type": "VALIDATION_ERROR",
  "message": "Validation failed",
  "errors": [
    {
      "field": "title",
      "message": "Title must be at least 10 characters",
      "code": "min_length"
    }
  ],
  "stack": "..." // Only in development
}
```

---

## 📋 Endpoints Overview

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| **AUTH (Better-Auth)** | | | | |
| POST | `/api/auth/signUp/email` | ❌ | Public | Register with email/password |
| POST | `/api/auth/signIn/email` | ❌ | Public | Login with email/password |
| POST | `/api/auth/signIn/social` | ❌ | Public | Login with social providers |
| POST | `/api/auth/signOut` | 🔑 | Any | Logout and end session |
| POST | `/api/auth/forget-password` | ❌ | Public | Send password reset email |
| POST | `/api/auth/reset-password` | ❌ | Public | Reset password with token |
| GET | `/api/auth/getSession` | 🔑 | Any | Get current user and session |
| GET | `/api/auth/listAccounts` | 🔑 | Any | List linked social accounts |
| | | | | |
| **IDEAS** | | | | |
| GET | `/ideas` | ❌ | Public | List all approved ideas |
| GET | `/ideas/:id` | ❌ | Public | Get idea details |
| GET | `/ideas/trending` | ❌ | Public | Get trending ideas |
| GET | `/ideas/search` | ❌ | Public | Full-text search ideas |
| POST | `/ideas` | 🔑 | Member+ | Create a new idea |
| PATCH | `/ideas/:id` | 🔑 | Author | Update own idea (draft only) |
| DELETE | `/ideas/:id` | 🔑 | Author | Delete own idea (draft only) |
| POST | `/ideas/:id/submit` | 🔑 | Author | Submit idea for review |
| GET | `/ideas/:id/similar` | ❌ | Public | Get similar/recommended ideas |
| | | | | |
| **ADMIN - IDEAS** | | | | |
| GET | `/admin/ideas` | 🔑 | Admin | List all ideas (all statuses) |
| PATCH | `/admin/ideas/:id/approve` | 🔑 | Admin | Approve an idea |
| PATCH | `/admin/ideas/:id/reject` | 🔑 | Admin | Reject with feedback |
| PATCH | `/admin/ideas/:id/feature` | 🔑 | Admin | Toggle featured status |
| GET | `/admin/ideas/:id/reviews` | 🔑 | Admin | Get feedback history |
| DELETE | `/admin/ideas/:id` | 🔑 | Admin | Force delete any idea |
| | | | | |
| **VOTES** | | | | |
| POST | `/ideas/:id/vote` | 🔑 | Member+ | Upvote or downvote |
| DELETE | `/ideas/:id/vote` | 🔑 | Member+ | Remove vote |
| GET | `/ideas/:id/votes` | ❌ | Public | Get vote stats |
| | | | | |
| **COMMENTS** | | | | |
| GET | `/ideas/:id/comments` | ❌ | Public | Get comments (nested) |
| POST | `/ideas/:id/comments` | 🔑 | Member+ | Add a comment |
| POST | `/comments/:id/reply` | 🔑 | Member+ | Reply to a comment |
| PATCH | `/comments/:id` | 🔑 | Author | Edit own comment |
| DELETE | `/comments/:id` | 🔑 | Author/Admin | Delete comment |
| POST | `/comments/:id/react` | 🔑 | Member+ | React (Like, Love, etc.) |
| DELETE | `/comments/:id/react` | 🔑 | Member+ | Remove reaction |
| | | | | |
| **CATEGORIES** | | | | |
| GET | `/categories` | ❌ | Public | List all categories |
| POST | `/categories` | 🔑 | Admin | Create category |
| PATCH | `/categories/:id` | 🔑 | Admin | Update category |
| DELETE | `/categories/:id` | 🔑 | Admin | Delete category |
| | | | | |
| **USERS** | | | | |
| GET | `/users/:id` | ❌ | Public | Get public user profile |
| PATCH | `/users/profile` | 🔑 | Any | Update own profile |
| PATCH | `/users/password` | 🔑 | Any | Change password |
| GET | `/users/me/ideas` | 🔑 | Any | Get my ideas |
| GET | `/users/me/votes` | 🔑 | Any | Get my votes history |
| GET | `/users/me/purchases` | 🔑 | Any | Get purchased ideas |
| | | | | |
| **ADMIN - USERS** | | | | |
| GET | `/admin/users` | 🔑 | Admin | List all users |
| PATCH | `/admin/users/:id/role` | 🔑 | SuperAdmin | Change user role |
| PATCH | `/admin/users/:id/status` | 🔑 | Admin | Activate/deactivate user |
| DELETE | `/admin/users/:id` | 🔑 | SuperAdmin | Delete user account |
| | | | | |
| **PAYMENTS** | | | | |
| POST | `/payments/initiate` | 🔑 | Member+ | Initiate payment for paid idea |
| POST | `/payments/verify` | ❌ | System | Payment gateway callback |
| GET | `/payments/history` | 🔑 | Any | Get payment history |
| GET | `/payments/:id` | 🔑 | Owner/Admin | Get payment details |
| | | | | |
| **SUBSCRIPTIONS** | | | | |
| GET | `/subscriptions/plans` | ❌ | Public | List subscription plans |
| POST | `/subscriptions/subscribe` | 🔑 | Member+ | Subscribe to a plan |
| PATCH | `/subscriptions/upgrade` | 🔑 | Member+ | Upgrade plan |
| DELETE | `/subscriptions/cancel` | 🔑 | Member+ | Cancel subscription |
| GET | `/subscriptions/me` | 🔑 | Any | Get my subscription |
| | | | | |
| **FOLLOW SYSTEM** | | | | |
| POST | `/users/:id/follow` | 🔑 | Member+ | Follow a user |
| DELETE | `/users/:id/follow` | 🔑 | Member+ | Unfollow a user |
| GET | `/users/:id/followers` | ❌ | Public | List followers of a user |
| GET | `/users/:id/following` | ❌ | Public | List users being followed |
| | | | | |
| **WATCHLIST** | | | | |
| POST | `/watchlist/:ideaId` | 🔑 | Member+ | Add idea to watchlist |
| DELETE | `/watchlist/:ideaId` | 🔑 | Member+ | Remove from watchlist |
| GET | `/users/me/watchlist` | 🔑 | Any | Get my watchlist |
| | | | | |
| **NOTIFICATIONS** | | | | |
| GET | `/notifications` | 🔑 | Any | Get my notifications |
| GET | `/notifications/unread-count` | 🔑 | Any | Get unread count |
| PATCH | `/notifications/:id/read` | 🔑 | Any | Mark as read |
| PATCH | `/notifications/read-all` | 🔑 | Any | Mark all as read |
| DELETE | `/notifications/:id` | 🔑 | Any | Delete notification |
| PATCH | `/notifications/preferences` | 🔑 | Any | Update preferences |
| | | | | |
| **ANALYTICS** | | | | |
| GET | `/analytics/overview` | 🔑 | Admin | Dashboard overview stats |
| GET | `/analytics/ideas` | 🔑 | Admin | Idea analytics |
| GET | `/analytics/users` | 🔑 | Admin | User growth analytics |
| GET | `/analytics/revenue` | 🔑 | Admin | Revenue analytics |
| GET | `/analytics/my-ideas` | 🔑 | Member+ | My idea performance |
| GET | `/analytics/export` | 🔑 | Admin | Export report (CSV/PDF) |
| | | | | |
| **WEBHOOKS** | | | | |
| GET | `/webhooks` | 🔑 | Admin | List my webhooks |
| POST | `/webhooks` | 🔑 | Admin | Register webhook |
| PATCH | `/webhooks/:id` | 🔑 | Admin | Update webhook |
| DELETE | `/webhooks/:id` | 🔑 | Admin | Delete webhook |
| GET | `/webhooks/:id/deliveries` | 🔑 | Admin | Webhook delivery logs |
| POST | `/webhooks/:id/test` | 🔑 | Admin | Send test payload |
| | | | | |
| **AUDIT LOGS** | | | | |
| GET | `/audit-logs` | 🔑 | Admin | Get audit trail |
| GET | `/audit-logs/export` | 🔑 | Admin | Export audit logs |
| | | | | |
| **NEWSLETTER** | | | | |
| POST | `/newsletter/subscribe` | ❌ | Public | Subscribe to newsletter |
| DELETE | `/newsletter/unsubscribe` | ❌ | Public | Unsubscribe |
| | | | | |
| **HEALTH** | | | | |
| GET | `/health` | ❌ | Public | Health check |
| GET | `/health/detailed` | 🔑 | Admin | Detailed health with dependencies |
---

## 📝 Detailed Endpoint Specifications

### Auth Endpoints

#### `POST /api/auth/signUp/email`

Register a new user account via Better-Auth.

**Request Body:**
```json
{
  "name": "Rakib Hasan",
  "email": "rakib@example.com",
  "password": "SecureP@ss123",
  "image": "https://..." // Optional
}
```

**Success Response (200):**
```json
{
  "user": {
    "id": "clx123",
    "email": "rakib@example.com",
    "name": "Rakib Hasan",
    "role": "MEMBER"
  },
  "session": {
    "id": "sess_123",
    "userId": "clx123",
    "expiresAt": "2024-02-15T..."
  }
}
```

---

#### `POST /api/auth/signIn/email`

Authenticate via Better-Auth.

**Request Body:**
```json
{
  "email": "rakib@example.com",
  "password": "SecureP@ss123"
}
```

**Success Response (200):**
```json
{
  "user": { ... },
  "session": { ... }
}
```

---

### Idea Endpoints

#### `GET /ideas`

Get paginated list of approved ideas with filtering and sorting.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 10 | Items per page (max 50) |
| sort | string | "recent" | Sort: recent, top_voted, most_commented |
| category | string | - | Filter by category slug |
| search | string | - | Full-text search query |
| isPaid | boolean | - | Filter paid/free ideas |
| minVotes | number | - | Minimum upvote count |
| author | string | - | Filter by author ID |

**Example Request:**
```
GET /api/v1/ideas?page=1&limit=12&sort=top_voted&category=energy&isPaid=false
```

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Ideas retrieved successfully",
  "data": [
    {
      "id": "clx9876543210",
      "title": "Solar-Powered Community Gardens",
      "slug": "solar-powered-community-gardens",
      "description": "A sustainable approach to urban farming using solar energy...",
      "images": ["https://cdn.ecosparkhub.com/ideas/solar-garden-1.webp"],
      "categories": [
        { "id": "cat1", "name": "Energy", "slug": "energy" },
        { "id": "cat2", "name": "Sustainability", "slug": "sustainability" }
      ],
      "tags": [
        { "id": "tag1", "name": "Solar", "slug": "solar" },
        { "id": "tag2", "name": "Urban", "slug": "urban" }
      ],
      "author": {
        "id": "clx123",
        "name": "Rakib Hasan",
        "avatar": "https://..."
      },
      "status": "APPROVED",
      "isPaid": false,
      "upvoteCount": 142,
      "downvoteCount": 8,
      "commentCount": 23,
      "viewCount": 1250,
      "publishedAt": "2024-01-10T14:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 12,
    "total": 45,
    "totalPages": 4,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

#### `POST /ideas`

Create a new idea (starts as DRAFT).

**Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`

**Request Body (multipart/form-data):**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | ✅ | Idea title (10-200 chars) |
| problemStatement | string | ✅ | The problem being addressed |
| proposedSolution | string | ✅ | Proposed solution |
| description | string | ✅ | Detailed description |
| categoryIds | string[] | ✅ | Array of Category IDs |
| tagIds | string[] | ❌ | Array of Tag IDs |
| isPaid | boolean | ❌ | Is this a paid idea? |
| price | number | ❌ | Price (required if isPaid=true) |
| images | File[] | ❌ | Up to 5 image files |
| videos | File[] | ❌ | Video attachments |
| documents | File[] | ❌ | PDF/Doc attachments |

**Success Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Idea created successfully",
  "data": {
    "id": "clxnewidea001",
    "title": "Rainwater Harvesting for Urban Areas",
    "slug": "rainwater-harvesting-for-urban-areas",
    "status": "DRAFT",
    "isPaid": false,
    "images": [
      "https://cdn.ecosparkhub.com/ideas/rain-harvest-1.webp",
      "https://cdn.ecosparkhub.com/ideas/rain-harvest-2.webp"
    ],
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

#### `POST /ideas/:id/submit`

Submit a draft idea for admin review.

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Idea submitted for review",
  "data": {
    "id": "clxnewidea001",
    "status": "UNDER_REVIEW",
    "submittedAt": "2024-01-15T11:00:00Z"
  }
}
```

---

### Vote Endpoints

#### `POST /ideas/:id/vote`

Cast a vote on an idea.

**Request Body:**
```json
{
  "value": 1   // 1 = upvote, -1 = downvote
}
```

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Vote recorded successfully",
  "data": {
    "userVote": 1,
    "upvoteCount": 143,
    "downvoteCount": 8
  }
}
```

---

### Comment Endpoints

#### `GET /ideas/:id/comments`

Get nested comments for an idea.

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Comments retrieved successfully",
  "data": [
    {
      "id": "clxcomment001",
      "content": "This is a brilliant idea! We implemented something similar in our community.",
      "author": {
        "id": "clxuser002",
        "name": "Fatema Akter",
        "avatar": "https://cdn.ecosparkhub.com/avatars/fatema.webp"
      },
      "createdAt": "2024-01-12T09:30:00Z",
      "reactions": {
        "LIKE": 15,
        "LOVE": 3,
        "INSIGHTFUL": 8,
        "userReaction": "LIKE"
      },
      "replies": [
        {
          "id": "clxcomment002",
          "content": "That's amazing! How was the initial investment?",
          "author": {
            "id": "clxuser003",
            "name": "Tanvir Ahmed",
            "avatar": null
          },
          "createdAt": "2024-01-12T10:15:00Z",
          "replies": [
            {
              "id": "clxcomment003",
              "content": "It was surprisingly affordable. Around 50,000 BDT for our entire setup.",
              "author": {
                "id": "clxuser002",
                "name": "Fatema Akter",
                "avatar": "https://cdn.ecosparkhub.com/avatars/fatema.webp"
              },
              "createdAt": "2024-01-12T11:00:00Z",
              "replies": []
            }
          ]
        }
      ]
    }
  ],
  "meta": {
    "total": 23,
    "rootComments": 8
  }
}
```

---

### Payment Endpoints

#### `POST /payments/initiate`

Initiate payment for a paid idea.

**Request Body:**
```json
{
  "ideaId": "clxidea001",
  "paymentMethod": "sslcommerz"  // or "stripe"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Payment initiated",
  "data": {
    "paymentId": "clxpay001",
    "gatewayUrl": "https://sandbox.sslcommerz.com/gwprocess/v4/...",
    "transactionId": "TXN_ECO_1705312200",
    "amount": 199,
    "currency": "BDT"
  }
}
```

---

### Analytics Endpoints

#### `GET /analytics/overview`

Get admin dashboard overview statistics.

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Analytics overview retrieved",
  "data": {
    "totalUsers": 1250,
    "totalIdeas": 345,
    "totalRevenue": 125000,
    "activeSubscriptions": 89,
    "pendingReviews": 12,
    "trendsComparison": {
      "users": { "current": 150, "previous": 120, "change": 25.0 },
      "ideas": { "current": 45, "previous": 38, "change": 18.4 },
      "revenue": { "current": 15000, "previous": 12000, "change": 25.0 }
    },
    "ideaStatusDistribution": {
      "draft": 45,
      "underReview": 12,
      "approved": 265,
      "rejected": 23
    },
    "categoryDistribution": [
      { "name": "Energy", "count": 120, "percentage": 34.8 },
      { "name": "Waste", "count": 95, "percentage": 27.5 },
      { "name": "Transportation", "count": 78, "percentage": 22.6 },
      { "name": "Water", "count": 52, "percentage": 15.1 }
    ],
    "recentActivity": [
      {
        "type": "idea_submitted",
        "user": "Rakib Hasan",
        "description": "Submitted 'Solar Community Gardens'",
        "timestamp": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

---

### Health Check

#### `GET /health`

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Service is healthy",
  "data": {
    "status": "healthy",
    "version": "1.0.0",
    "uptime": "5d 12h 30m",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

#### `GET /health/detailed` (Admin only)

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Detailed health check",
  "data": {
    "status": "healthy",
    "version": "1.0.0",
    "uptime": "5d 12h 30m",
    "dependencies": {
      "database": { "status": "connected", "latency": "5ms" },
      "redis": { "status": "connected", "latency": "2ms" },
      "cloudinary": { "status": "operational" },
      "stripe": { "status": "operational" }
    },
    "memory": {
      "heapUsed": "125MB",
      "heapTotal": "256MB",
      "rss": "180MB"
    },
    "queues": {
      "emailQueue": { "waiting": 3, "active": 1, "completed": 1250, "failed": 2 },
      "imageQueue": { "waiting": 0, "active": 0, "completed": 890, "failed": 0 }
    }
  }
}
```

---

## 🔐 Rate Limiting Headers

Every response includes rate limit information:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705312260
Retry-After: 60  // Only when rate limited (429)
```

---

## 📡 WebSocket Events

### Client → Server Events
| Event | Payload | Description |
|-------|---------|-------------|
| `join:idea` | `{ ideaId }` | Join idea room for real-time updates |
| `leave:idea` | `{ ideaId }` | Leave idea room |
| `typing:comment` | `{ ideaId, userId }` | User is typing a comment |

### Server → Client Events
| Event | Payload | Description |
|-------|---------|-------------|
| `notification:new` | `{ notification }` | New notification received |
| `idea:voted` | `{ ideaId, upvotes, downvotes }` | Vote count updated |
| `idea:commented` | `{ ideaId, comment }` | New comment posted |
| `idea:statusChanged` | `{ ideaId, status }` | Idea status changed |
| `user:typing` | `{ ideaId, userId, name }` | Someone is typing |

---

> **💡 Note:** This API documentation serves as the contract between frontend and backend teams. All endpoints follow RESTful conventions and use consistent error handling patterns.
