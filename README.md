# <div align="center">🌿 EcoVault — Secure Tech, Sustainable Future 🛡️</div>

<!-- <div align="center">
  <img src="./ecovault_banner_1778093220288.png" alt="EcoVault Banner" width="100%" />
</div> -->

<div align="center">

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com/)

</div>

---

## 📖 Project Overview

**EcoVault** is a high-performance, industry-grade backend engine for a community-driven sustainability portal. It enables members to share, discover, and monetize eco-friendly ideas (e.g., plastic reduction, solar energy projects). The platform features an AI-powered recommendation engine, real-time interactions, and a multi-tier subscription model, ensuring that high-impact projects reach the right audience while maintaining enterprise-level security and scalability.

> **Note:** This repository contains the **Server-side (Backend)** logic for EcoVault.

---

## 🚀 Industry-Level Features

EcoVault is built with modern software architecture patterns and advanced features that go beyond standard requirements:

-   **🤖 AI-Powered RAG System:** Integration with **OpenRouter** and **NVIDIA** models for semantic search and personalized idea recommendations.
-   **🔐 Advanced Auth & RBAC:** Powered by **Better-Auth** with support for Email/Password, Social logins (Google), and a granular Permission Matrix.
-   **⚡ Real-Time Engine:** Built-in **Socket.IO** support for instant notifications, live vote counts, and real-time typing indicators.
-   **📊 Complex Analytics:** Aggregated metrics for admins and personalized performance dashboards for members using PostgreSQL window functions.
-   **🛠️ Robust Infrastructure:**
    -   **Distributed Caching:** Multi-level caching with **Redis** for listing and high-traffic endpoints.
    -   **Background Workers:** **BullMQ** for async tasks like email delivery, image processing, and scheduled analytics.
    -   **API Protection:** Tiered Rate Limiting and Throttling using Redis.
-   **💰 Financial Ecosystem:** Seamless integration with **Stripe** and **SSLCommerz** for one-time idea purchases and recurring subscriptions.
-   **🔍 Full-Text Search:** PostgreSQL-powered fuzzy search with ranking and trigram similarity matching.
-   **📋 Audit Logging:** Append-only tamper-proof logs for every sensitive administrative action.

---

## 🛠️ Technology Stack

| Category | Technology |
| :--- | :--- |
| **Language** | TypeScript |
| **Framework** | Node.js with Express.js |
| **ORM** | Prisma |
| **Database** | PostgreSQL (Neon / Supabase) |
| **Caching** | Redis (Upstash) |
| **Authentication** | Better-Auth |
| **AI / LLM** | OpenRouter (NVIDIA Nemotron) |
| **Payment** | Stripe, SSLCommerz |
| **Storage** | Cloudinary |
| **Message Queue** | BullMQ |
| **Real-time** | Socket.IO |
| **Logging** | Winston, Morgan |

---

## 📂 Project Structure

```bash
server/
├── prisma/                 # Database schema and migrations
│   ├── schema/             # Modularized Prisma schemas (Auth, Ideas, RAG, etc.)
│   ├── migrations/         # Database migration files
│   └── seed.ts             # Initial database seed script
├── src/
│   ├── app/                # Main application logic
│   │   ├── config/         # Service configs (Stripe, Cloudinary, Multer, etc.)
│   │   ├── errorHelpers/   # Specialized handlers (Prisma, Zod, AppError)
│   │   ├── interfaces/     # Global TypeScript interfaces & declarations
│   │   ├── middleware/     # Global & route middlewares (Auth, Validator)
│   │   ├── module/         # Feature-based modular architecture
│   │   │   ├── Idea/       # Idea management & publishing lifecycle
│   │   │   ├── admin/      # Administrative dashboard & user management
│   │   │   ├── attachment/ # File uploads & Cloudinary integration
│   │   │   ├── auth/       # Better-Auth configuration & social login
│   │   │   ├── category/   # Categorization system for ideas
│   │   │   ├── comment/    # Nested discussion & reply system
│   │   │   ├── follow/     # User-to-user following system
│   │   │   ├── ideaReview/ # Admin approval/rejection logic
│   │   │   ├── member/     # Member-specific profile & actions
│   │   │   ├── moderator/  # Content moderation & flagging
│   │   │   ├── payment/    # Payment gateway (Stripe/SSLCommerz)
│   │   │   ├── rag/        # AI-powered RAG & recommendations
│   │   │   ├── stats/      # Analytics & dashboard statistics
│   │   │   ├── subscription/# Multi-tier subscription plans
│   │   │   ├── tag/        # Tagging & discovery system
│   │   │   ├── vote/       # Reddit-style voting (Up/Down)
│   │   │   └── watchlist/  # Personal watchlist management
│   │   ├── routes/         # Centralized route mapping (index.ts)
│   │   ├── shared/         # Core shared logic (catchAsync, sendResponse)
│   │   ├── templates/      # EJS templates (Email, Invoices, Redirects)
│   │   └── utils/          # Utility functions (QueryBuilder, JWT, Email)
│   ├── app.ts              # Express application configuration
│   └── server.ts           # Server bootstrap & DB connection
├── .env.example            # Environment variable template
├── API_DOCUMENTATION.md    # API endpoint specifications
├── FEATURES.md             # Detailed feature breakdown
└── DATABASE_DESIGN.md      # DB schema & relationship diagrams
```

---

## 🚦 Getting Started

### Prerequisites

-   Node.js (v18+)
-   PostgreSQL instance
-   Redis instance
-   Package Manager (npm/yarn/pnpm)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Rafiul29/ecovault-server.git
    cd ecovault-server
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Setup Environment Variables:**
    Create a `.env` file in the root directory. You can copy the template from [.env.example](./.env.example) or use the configuration guide below.

4.  **Database Migration & Seeding:**
    ```bash
    npx prisma generate
    npx prisma migrate dev
    npm run seed
    ```

5.  **Run Development Server:**
    ```bash
    npm run dev
    ```

## 🔑 Environment Variables

The application requires several environment variables to function correctly. You can copy the template below or check [.env.example](./.env.example).

### Configuration Template

Create a `.env` file in the root directory and populate it with the following structure:

```bash
# Server Configuration
NODE_ENV="development"
PORT=5000

# Database
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# Caching & Queues (Redis)
REDIS_URL="rediss://default:password@host:port"

# Authentication (Better-Auth)
BETTER_AUTH_SECRET="your_better_auth_secret"
BETTER_AUTH_URL="http://localhost:5000"

# JWT Tokens (Legacy support)
ACCESS_TOKEN_SECRET="your_access_token_secret"
REFRESH_TOKEN_SECRET="your_refresh_token_secret"
ACCESS_TOKEN_EXPIRES_IN="1d"
REFRESH_TOKEN_EXPIRES_IN="7d"

# Email (SMTP)
EMAIL_SENDER_SMTP_USER="your_email@gmail.com"
EMAIL_SENDER_SMTP_PASS="your_app_password"
EMAIL_SENDER_SMTP_HOST="smtp.gmail.com"
EMAIL_SENDER_SMTP_PORT=465
EMAIL_SENDER_SMTP_FROM="your_email@gmail.com"

# Social Auth (Google)
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
GOOGLE_CALLBACK_URL="http://localhost:5000/api/auth/callback/google"

# Frontend Integration
FRONTEND_URL="http://localhost:3000"

# Cloud Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Payments (Stripe)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Super Admin Initial Credentials
SUPER_ADMIN_EMAIL="admin@ecovault.com"
SUPER_ADMIN_PASSWORD="Password123!"

# AI & RAG (OpenRouter)
OPENROUTER_API_KEY=""
OPENROUTER_EMBEDDING_MODEL=""
OPENROUTER_LLM_MODEL=""
```

---

## 📡 API Overview

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/ideas` | List approved ideas | Public |
| `POST` | `/api/v1/ideas` | Create a new idea draft | Member+ |
| `POST` | `/api/v1/auth/signUp` | Register a new user | Public |
| `POST` | `/api/v1/payments/initiate` | Start a payment process | Member+ |
| `GET` | `/api/v1/analytics/overview`| Admin dashboard stats | Admin |

> See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for full endpoint specifications and request/response examples.

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:
1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

- Live Frontend URL:** [EcoVault Client](https://ecovault-client.vercel.app)
- Live Backend API URL:** [EcoVault Server API](https://ecovault-server.vercel.app/api/v1)
- Frontend Repository:** [GitHub - ecovault-client](https://github.com/Rafiul29/ecovault-client)
- Backend Repository:** [GitHub - ecovault-server](https://github.com/Rafiul29/ecovault-server)

<div align="center">
  Built with ❤️ by the EcoVault Team
</div>

