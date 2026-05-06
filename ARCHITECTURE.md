# 🏛️ EcoVault — System Architecture

> Enterprise-grade architecture design for a sustainability idea-sharing platform.

> **🗺️ View Implementation Roadmap:** [**PLANNING.md**](file:///home/ubuntu/Desktop/code/mern/assignment/PLANNING.md)

---

## High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            CLIENT (Next.js 16)                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
│  │  Pages/  │ │  UI      │ │  State   │ │  Hooks   │ │  Service     │ │
│  │  Routes  │ │  Comps   │ │  Zustand │ │  Custom  │ │  Workers(PWA)│ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────────┘ │
│                              ↕ REST API + WebSocket                    │
└─────────────────────────────────────────────────────────────────────────┘
                               ↕ HTTPS
┌─────────────────────────────────────────────────────────────────────────┐
│                          API GATEWAY / PROXY                           │
│  ┌──────────┐ ┌───────────┐ ┌────────────┐ ┌───────────────────────┐  │
│  │  Rate    │ │  Auth     │ │  Request   │ │  API Versioning       │  │
│  │  Limiter │ │  Middleware│ │  Validator │ │  /api/v1/ /api/v2/    │  │
│  └──────────┘ └───────────┘ └────────────┘ └───────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                               ↕
┌─────────────────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER (Express.js)                     │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                        CONTROLLERS                               │  │
│  │  Auth │ Ideas │ Users │ Comments │ Votes │ Payments │ Analytics  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                               ↕                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                         SERVICES                                 │  │
│  │  AuthService │ IdeaService │ NotificationService │ SearchService │  │
│  │  PaymentService │ AnalyticsService │ ModerationService           │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                               ↕                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                       DATA ACCESS LAYER                          │  │
│  │       Prisma ORM │ Redis Client │ Search Index Manager           │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
          ↕                    ↕                    ↕
┌──────────────┐    ┌──────────────┐    ┌──────────────────┐
│  PostgreSQL  │    │    Redis     │    │  Cloud Storage   │
│  (Primary DB)│    │  (Cache +    │    │  (Cloudinary/S3) │
│              │    │   Queues)    │    │                  │
└──────────────┘    └──────────────┘    └──────────────────┘

         ┌───────────────────────────────────────┐
         │         BACKGROUND WORKERS             │
         │  ┌──────────┐  ┌───────────────────┐  │
         │  │ BullMQ   │  │  Cron Scheduler   │  │
         │  │ Workers  │  │  (node-cron)      │  │
         │  └──────────┘  └───────────────────┘  │
         │  Jobs: Email, Image Processing,        │
         │        Analytics, Search Indexing,      │
         │        Webhook Delivery                 │
         └───────────────────────────────────────┘

         ┌───────────────────────────────────────┐
         │        EXTERNAL SERVICES               │
         │  ┌──────────┐  ┌───────────────────┐  │
         │  │ Stripe/  │  │  OpenAI API       │  │
         │  │ SSLComm  │  │  (Moderation +    │  │
         │  └──────────┘  │   Recommendations) │  │
         │                └───────────────────┘  │
         │  ┌──────────┐  ┌───────────────────┐  │
         │  │ Nodemailer│ │  Socket.IO Server  │  │
         │  │ (SMTP)   │  │  (WebSocket)      │  │
         │  └──────────┘  └───────────────────┘  │
         └───────────────────────────────────────┘
```

---

## 📂 Server Directory Structure (Express.js)

```
server/
├── prisma/
│   ├── schema.prisma              # Database schema
│   ├── migrations/                # Database migrations
│   └── seed.ts                    # Database seeding script
│
├── src/
│   ├── index.ts                   # Entry point — server bootstrap
│   ├── app.ts                     # Express app configuration
│   ├── socket.ts                  # Socket.IO setup
│   │
│   ├── config/
│   │   ├── database.ts            # Database configuration
│   │   ├── redis.ts               # Redis connection config
│   │   ├── env.ts                 # Environment variable validation (Zod)
│   │   ├── cors.ts                # CORS configuration
│   │   └── cloudinary.ts          # Cloud storage config
│   │
│   ├── api/
│   │   └── v1/
│   │       ├── routes/
│   │       │   ├── index.ts       # Route aggregator
│   │       │   ├── auth.routes.ts
│   │       │   ├── idea.routes.ts
│   │       │   ├── user.routes.ts
│   │       │   ├── comment.routes.ts
│   │       │   ├── vote.routes.ts
│   │       │   ├── payment.routes.ts
│   │       │   ├── category.routes.ts
│   │       │   ├── analytics.routes.ts
│   │       │   ├── notification.routes.ts
│   │       │   ├── webhook.routes.ts
│   │       │   └── admin.routes.ts
│   │       │
│   │       ├── controllers/
│   │       │   ├── auth.controller.ts
│   │       │   ├── idea.controller.ts
│   │       │   ├── user.controller.ts
│   │       │   ├── comment.controller.ts
│   │       │   ├── vote.controller.ts
│   │       │   ├── payment.controller.ts
│   │       │   ├── category.controller.ts
│   │       │   ├── analytics.controller.ts
│   │       │   ├── notification.controller.ts
│   │       │   ├── webhook.controller.ts
│   │       │   └── admin.controller.ts
│   │       │
│   │       └── validators/
│   │           ├── auth.validator.ts
│   │           ├── idea.validator.ts
│   │           ├── comment.validator.ts
│   │           └── payment.validator.ts
│   │
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── idea.service.ts
│   │   ├── user.service.ts
│   │   ├── comment.service.ts
│   │   ├── vote.service.ts
│   │   ├── payment.service.ts
│   │   ├── notification.service.ts
│   │   ├── search.service.ts
│   │   ├── analytics.service.ts
│   │   ├── moderation.service.ts
│   │   ├── recommendation.service.ts
│   │   ├── webhook.service.ts
│   │   ├── image.service.ts
│   │   └── cache.service.ts
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts       # JWT verification
│   │   ├── rbac.middleware.ts       # Role-based access control
│   │   ├── rateLimiter.middleware.ts # Rate limiting
│   │   ├── validate.middleware.ts   # Zod schema validation
│   │   ├── upload.middleware.ts     # Multer file upload
│   │   ├── cache.middleware.ts      # Response caching
│   │   ├── audit.middleware.ts      # Audit logging
│   │   └── error.middleware.ts      # Global error handler
│   │
│   ├── jobs/
│   │   ├── queue.ts               # BullMQ queue configuration
│   │   ├── workers/
│   │   │   ├── email.worker.ts     # Email sending worker
│   │   │   ├── image.worker.ts     # Image processing worker
│   │   │   ├── analytics.worker.ts # Analytics aggregation
│   │   │   ├── webhook.worker.ts   # Webhook delivery
│   │   │   └── moderation.worker.ts # AI content moderation
│   │   │
│   │   └── schedulers/
│   │       ├── trending.scheduler.ts   # Recalculate trending
│   │       ├── digest.scheduler.ts     # Email digest
│   │       ├── cleanup.scheduler.ts    # Cleanup expired data
│   │       └── sitemap.scheduler.ts    # Generate sitemap
│   │
│   ├── utils/
│   │   ├── logger.ts              # Winston logger setup
│   │   ├── apiResponse.ts         # Standardized API responses
│   │   ├── apiError.ts            # Custom error classes
│   │   ├── pagination.ts          # Pagination helper
│   │   ├── jwt.ts                 # JWT sign/verify helper
│   │   ├── hash.ts                # Password hashing helper
│   │   ├── hmac.ts                # HMAC for webhook signatures
│   │   └── constants.ts           # Application constants
│   │
│   └── types/
│       ├── express.d.ts           # Express type extensions
│       ├── socket.d.ts            # Socket.IO type definitions
│       └── index.ts               # Shared type exports
│
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   └── utils/
│   ├── integration/
│   │   ├── auth.test.ts
│   │   ├── ideas.test.ts
│   │   └── payments.test.ts
│   └── e2e/
│       └── workflow.test.ts
│
├── docs/
│   └── swagger.yaml               # OpenAPI 3.0 spec
│
├── .env.example
├── .env
├── tsconfig.json
├── package.json
├── Dockerfile
├── docker-compose.yml
└── jest.config.ts
```

---

## 📂 Client Directory Structure (Next.js 16)

```
client/
├── public/
│   ├── icons/                     # PWA icons
│   ├── manifest.json              # PWA manifest
│   ├── sw.js                      # Service Worker
│   └── images/
│
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Homepage
│   │   ├── loading.tsx            # Global loading
│   │   ├── error.tsx              # Global error boundary
│   │   ├── not-found.tsx          # 404 page
│   │   │
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── forgot-password/
│   │   │       └── page.tsx
│   │   │
│   │   ├── ideas/
│   │   │   ├── page.tsx           # All ideas (paginated grid)
│   │   │   └── [id]/
│   │   │       └── page.tsx       # Idea details
│   │   │
│   │   ├── dashboard/
│   │   │   ├── layout.tsx         # Dashboard layout with sidebar
│   │   │   ├── page.tsx           # Dashboard overview
│   │   │   ├── my-ideas/
│   │   │   │   ├── page.tsx       # My ideas list
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx   # Create new idea
│   │   │   │   └── [id]/
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx       # User analytics
│   │   │   ├── notifications/
│   │   │   │   └── page.tsx       # Notification center
│   │   │   ├── settings/
│   │   │   │   └── page.tsx       # User settings
│   │   │   └── admin/
│   │   │       ├── users/
│   │   │       │   └── page.tsx   # User management
│   │   │       ├── ideas/
│   │   │       │   └── page.tsx   # Idea moderation
│   │   │       ├── categories/
│   │   │       │   └── page.tsx   # Category management
│   │   │       ├── analytics/
│   │   │       │   └── page.tsx   # Admin analytics
│   │   │       ├── audit-logs/
│   │   │       │   └── page.tsx   # Audit trail
│   │   │       └── webhooks/
│   │   │           └── page.tsx   # Webhook management
│   │   │
│   │   ├── about/
│   │   │   └── page.tsx
│   │   ├── blog/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   ├── pricing/
│   │   │   └── page.tsx           # Subscription plans
│   │   ├── contact/
│   │   │   └── page.tsx
│   │   └── profile/
│   │       └── [id]/
│   │           └── page.tsx       # Public user profile
│   │
│   ├── components/
│   │   ├── ui/                    # Base UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Dropdown.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── Tooltip.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── Card.tsx
│   │   │   └── DataTable.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── MobileNav.tsx
│   │   │
│   │   ├── ideas/
│   │   │   ├── IdeaCard.tsx
│   │   │   ├── IdeaGrid.tsx
│   │   │   ├── IdeaForm.tsx
│   │   │   ├── IdeaDetails.tsx
│   │   │   ├── VoteButton.tsx
│   │   │   ├── CommentSection.tsx
│   │   │   ├── NestedComment.tsx
│   │   │   └── SimilarIdeas.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── StatsCard.tsx
│   │   │   ├── RecentActivity.tsx
│   │   │   ├── ActivityHeatmap.tsx
│   │   │   └── PerformanceChart.tsx
│   │   │
│   │   ├── notifications/
│   │   │   ├── NotificationBell.tsx
│   │   │   ├── NotificationList.tsx
│   │   │   └── NotificationItem.tsx
│   │   │
│   │   ├── analytics/
│   │   │   ├── LineChart.tsx
│   │   │   ├── PieChart.tsx
│   │   │   ├── BarChart.tsx
│   │   │   └── MetricCard.tsx
│   │   │
│   │   └── shared/
│   │       ├── SearchBar.tsx
│   │       ├── Pagination.tsx
│   │       ├── FilterPanel.tsx
│   │       ├── SortDropdown.tsx
│   │       ├── ImageUpload.tsx
│   │       ├── RichTextEditor.tsx
│   │       └── EmptyState.tsx
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useSocket.ts
│   │   ├── useDebounce.ts
│   │   ├── useInfiniteScroll.ts
│   │   ├── useNotifications.ts
│   │   ├── useMediaQuery.ts
│   │   └── useLocalStorage.ts
│   │
│   ├── stores/
│   │   ├── authStore.ts           # Zustand auth state
│   │   ├── notificationStore.ts   # Notification state
│   │   └── uiStore.ts             # UI state (theme, sidebar)
│   │
│   ├── services/
│   │   ├── api.ts                 # Axios instance with interceptors
│   │   ├── auth.api.ts
│   │   ├── idea.api.ts
│   │   ├── comment.api.ts
│   │   ├── payment.api.ts
│   │   └── notification.api.ts
│   │
│   ├── lib/
│   │   ├── utils.ts               # Utility functions
│   │   ├── constants.ts           # App constants
│   │   └── validators.ts          # Zod schemas (shared)
│   │
│   ├── types/
│   │   ├── idea.ts
│   │   ├── user.ts
│   │   ├── comment.ts
│   │   ├── notification.ts
│   │   └── api.ts
│   │
│   └── styles/
│       └── globals.css
│
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── .env.local
```

---

## 🗄️ Database Design

The data layer is managed using **Prisma ORM** with **PostgreSQL**. The database schema is designed for scalability and high-performance retrieval.

> **📄 View Full Database Documentation:** [**dbdesign.md**](file:///home/ubuntu/Desktop/code/mern/assignment/dbdesign.md)

### Key Model Groups:
1. **User & Auth**: Managed via Better-Auth (User, Account, Session).
2. **Core Business**: Ideas, Categories, Comments, Votes.
3. **Financials**: Payments, IdeaPurchases, Subscriptions.
4. **Utilities**: Notifications, Webhooks, AuditLogs, SearchHistory.

---

## 🔐 Authentication Flow (Better-Auth)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Client     │     │   Server     │     │   Database   │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │
       │  POST /api/auth/   │                    │
       │  signUp/email      │                    │
       │───────────────────>│                    │
       │                    │  Verify payload    │
       │                    │  Hash password     │
       │                    │  Create User       │
       │                    │  Create Account    │
       │                    │───────────────────>│
       │                    │  Saved Success     │
       │                    │<───────────────────│
       │  Set-Cookie        │  Generate Session  │
       │  (Session Token)   │  (Database-backed) │
       │<───────────────────│                    │
       │                    │                    │
       │                    │                    │
       │  Authenticated     │                    │
       │  Request (Cookies) │                    │
       │───────────────────>│                    │
       │                    │  Validate Session  │
       │                    │  (via Database)    │
       │                    │  Check RBAC        │
       │                    │───────────────────>│
       │  Response          │<───────────────────│
       │<───────────────────│                    │
       │                    │                    │
       │  POST /api/auth/   │                    │
       │  signOut           │                    │
       │───────────────────>│                    │
       │                    │  Invalidate Sess.  │
       │  Clear Cookie      │───────────────────>│
       │<───────────────────│                    │
```

---

## 🔄 Idea Lifecycle State Machine

```
                    ┌──────────┐
                    │  CREATE   │
                    └────┬─────┘
                         │
                    ┌────▼─────┐
              ┌─────│  DRAFT   │─────┐
              │     └────┬─────┘     │
              │          │           │
          [Edit]    [Submit]     [Delete]
              │          │           │
              │     ┌────▼────────┐  │
              └────>│UNDER_REVIEW │  ▼
                    └────┬────────┘ 🗑️
                         │
                 ┌───────┴───────┐
                 │               │
            [Approve]       [Reject]
                 │               │
            ┌────▼─────┐   ┌────▼────────┐
            │ APPROVED  │   │  REJECTED   │
            │ (Public)  │   │ (Feedback)  │
            └──────────┘   └─────┬───────┘
                                 │
                            [Revise & Resubmit]
                                 │
                           ┌─────▼────────┐
                           │ UNDER_REVIEW  │
                           └──────────────┘
```

---

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      VERCEL (Frontend)                      │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐ │
│  │ Next.js App │  │ Edge Network │  │ Serverless Fns    │ │
│  │ (SSR/SSG)   │  │ (CDN Cache)  │  │ (API Routes)      │ │
│  └─────────────┘  └──────────────┘  └───────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                          │
                    HTTPS / REST API
                          │
┌─────────────────────────────────────────────────────────────┐
│                   RENDER / RAILWAY (Backend)                │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐ │
│  │ Express.js  │  │ Socket.IO    │  │ BullMQ Workers    │ │
│  │ API Server  │  │ Server       │  │ (Background Jobs) │ │
│  └─────────────┘  └──────────────┘  └───────────────────┘ │
└─────────────────────────────────────────────────────────────┘
          │                    │                    │
┌─────────┴──────┐  ┌─────────┴──────┐  ┌─────────┴──────┐
│  PostgreSQL    │  │  Redis         │  │  Cloudinary    │
│  (Neon/Supabase│  │  (Upstash)     │  │  (Image CDN)   │
│   /Railway)    │  │                │  │                │
└────────────────┘  └────────────────┘  └────────────────┘
```

---

## 📊 Performance Targets

| Metric | Target | Strategy |
|--------|--------|----------|
| Time to First Byte (TTFB) | < 200ms | SSR + Edge caching |
| Largest Contentful Paint (LCP) | < 2.5s | Image optimization + lazy loading |
| Cumulative Layout Shift (CLS) | < 0.1 | Skeleton loaders, fixed dimensions |
| First Input Delay (FID) | < 100ms | Code splitting, minimal JS |
| API Response Time (p95) | < 500ms | Redis caching, query optimization |
| WebSocket Latency | < 50ms | Socket.IO with Redis adapter |
| Database Query Time | < 100ms | Proper indexing, query optimization |
| Image Load Time | < 1s | WebP + CDN + lazy loading |

---

> **This architecture is designed to be scalable, maintainable, and production-ready — exactly what industry employers look for in a portfolio project.**
