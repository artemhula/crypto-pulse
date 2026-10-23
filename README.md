# ⚡ Crypto Pulse

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-11.0-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16.3-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Turborepo](https://img.shields.io/badge/Turborepo-2.10-EF4444?style=for-the-badge&logo=turborepo&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7.8-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-3.13-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

<br />

**High-performance cryptocurrency price tracking and automated multi-channel alerting platform.**  
Built on an asynchronous, event-driven microservices architecture inside a Turborepo monorepo.

[Microservices Architecture](#-system-architecture) •
[Service Interactions](#-abstract-service-interactions) •
[Microservices Catalog](#-microservices-catalog) •
[Messaging Topology](#-rabbitmq-messaging-topology) •
[Database Schema](#-database-schema) •
[Getting Started](#-getting-started)

</div>

---

## 📌 Overview

**Crypto Pulse** is a distributed, reactive cryptocurrency alerting and market monitoring system. It periodically tracks market fluctuations across top cryptocurrencies, evaluates user-defined price boundaries in real time, and instantaneously delivers notifications across multiple channels: **Telegram Bot**, **Transactional Email (Resend)**, and **Native Web Push (VAPID)**.

### Key Highlights

- **Event-Driven Microservices**: Decoupled NestJS microservices communicating over RabbitMQ (topic exchanges, direct queues, and RPC patterns).
- **Sub-Minute Market Ingestion**: Automated scheduling microservice polling CoinGecko API with high-throughput Redis pipeline caching.
- **Accurate Level-Crossing Detection**: Evaluates boundary crossings (`ABOVE` / `BELOW`) and claims alerts atomically to prevent duplicate notifications.
- **Multi-Channel Dispatching**:
  - 🤖 **Telegram**: Interactive bot with one-click deep link account pairing and exponential backoff rate limiting.
  - 📧 **Email**: Resilient HTML email delivery with Resend.
  - 🔔 **Web Push**: Background notifications via browser Service Worker and VAPID protocol with auto-pruning of stale client tokens.
- **Zero-Trust Auth & Gateway**: Google OAuth 2.0 with rotating database-backed sessions, signed JWTs, httpOnly lax cookies, and Next.js SSR proxy validation.
- **Turborepo Monorepo**: Shared schemas, database client, caching layers, and utilities shared seamlessly between services.

---

## Screenshots

<table>
  <tr>
    <td align="center">
      <strong>Dashboard</strong><br />
      <img src="docs/screenshots/screenshot_dashboard.png" alt="Crypto Pulse dashboard" width="420" />
    </td>
    <td align="center">
      <strong>Alerts</strong><br />
      <img src="docs/screenshots/screenshot_alerts.png" alt="Crypto Pulse alerts list" width="420" />
    </td>
  </tr>
  <tr>
    <td align="center">
      <strong>Create alert</strong><br />
      <img src="docs/screenshots/screenshot_modal.png" alt="Crypto Pulse create alert dialog" width="420" />
    </td>
    <td align="center">
      <strong>Settings</strong><br />
      <img src="docs/screenshots/screenshot_settings.png" alt="Crypto Pulse settings" width="420" />
    </td>
  </tr>
</table>

---

## 🏗 System Architecture

The following diagram illustrates the microservices topology, backing data stores, message broker, and external APIs:

<div align="center">
  <img src="docs/diagrams/architecture.svg" alt="Crypto Pulse Microservices Architecture" width="100%" />
</div>

---

## 🔄 Abstract Service Interactions

A high-level overview of how data and requests flow between the microservices:

```text
  [ Web Browser ]                         [ Telegram App ]
         │ (HTTPS)                                │ (/start <code>)
         ▼                                        ▼
  [ apps/frontend ] (:4200)               [ apps/worker-telegram ] (:3009)
         │ (REST / Cookies)                       │
         ▼                                        ├──► [ Redis 7 ] (Verify OTP)
  [ apps/api ] Gateway (:3000)                    └──► RabbitRPC (telegram.link)
         │                                                    │
         ├──► [ apps/auth ] (:3001) ──► [ Google OAuth ]      │
         ├──► [ PostgreSQL 16 ] (Users, Alerts, Push) ◄───────┘
         └──► [ Redis 7 ] (Coins Cache, OTP codes)

  [ CoinGecko API ]
         │ (Poll every 1 min)
         ▼
  [ apps/cron-parser ]
         ├──► [ PostgreSQL 16 ] & [ Redis 7 ] (Update latest coin rates)
         └──► [ RabbitMQ ] (Publish: crypto.updated to crypto.exchange)
                   │
                   ▼
  [ apps/alert ] Engine
         ├──► [ PostgreSQL 16 ] (Find matching active alerts & claim atomically)
         └──► [ RabbitMQ ] (Publish channel alert events)
                   │
         ┌─────────┼────────────────────────┐
         │         │                        │
         ▼         ▼                        ▼
    (Telegram)   (Email)                  (Push)
         │         │                        │
         ▼         ▼                        ▼
  [ worker-tg ] [ worker-email ]     [ worker-push ]
    (:3009)       (:3010)              (:3011)
       │             │                    │
       │ (Telegraf)  │ (Resend)           ├──► [ PostgreSQL 16 ] (Subscriptions)
       ▼             ▼                    │
 [ Telegram API] [ Resend API ]           ▼ (Web Push VAPID)
                                     [ Browser Push Cloud ]
```

### Communication Summary

| Interaction                        | Protocol / Method     | Description                                                                                                     |
| :--------------------------------- | :-------------------- | :-------------------------------------------------------------------------------------------------------------- |
| **Client ↔ Frontend**             | HTTP / Cookies        | SSR rendering, Next.js proxy middleware for seamless session token refresh.                                     |
| **Frontend ↔ API Gateway**        | REST / JSON           | Authenticated endpoints via Bearer token / cookies (`/api/alerts`, `/api/coins`, `/api/push`, `/api/telegram`). |
| **API Gateway ↔ Auth Service**    | HTTP (Private)        | Server-side proxy for OAuth redirects, session token rotation, and cookie relay.                                |
| **Cron Parser ↔ CoinGecko**       | HTTP (Axios)          | Scheduled poll every 60 seconds for top token market prices and percentages.                                    |
| **Cron Parser ↔ RabbitMQ**        | AMQP (Topic)          | Publishes price updates to `crypto.exchange` (`crypto.updated`).                                                |
| **RabbitMQ ↔ Alert Engine**       | AMQP (Queue)          | Consumes `crypto.updated` from `alert-processing-queue`.                                                        |
| **Alert Engine ↔ PostgreSQL**     | Prisma (SQL)          | Queries active alerts; atomically updates status from `ACTIVE` to `TRIGGERED`.                                  |
| **Alert Engine ↔ RabbitMQ**       | AMQP (Fanout)         | Emits targeted notifications to `telegram.exchange`, `email.exchange`, and `push.exchange`.                     |
| **RabbitMQ ↔ Workers**            | AMQP (Durable Queues) | Workers consume dedicated queues with rate limiting and exponential backoff retry.                              |
| **Worker Telegram ↔ API Gateway** | RabbitMQ RPC          | Requests account pairing (`telegram.link`) when a user sends `/start <code>` to the bot.                        |

---

## 📦 Microservices Catalog

### Applications (`apps/`)

| Application           | Technology                            | Type                  | Port / Trigger             | Primary Responsibilities                                                                                                                                                |
| :-------------------- | :------------------------------------ | :-------------------- | :------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`frontend`**        | Next.js 16, React 19, Tailwind CSS v4 | Web Client            | `4200`                     | User dashboard, interactive coin lists, alert builder, settings, service worker push listener, transparent auth proxy middleware.                                       |
| **`api`**             | NestJS, Swagger, Class-Validator      | API Gateway / BFF     | `3000` (`/api`)            | Client-facing gateway, alert CRUD, coin endpoints with cache, Telegram link generation, Web Push subscription management, Swagger docs (`/api/docs`).                   |
| **`auth`**            | NestJS, Passport, JWT                 | Internal Auth Service | `3001` (`/api`)            | Google OAuth 2.0 handling, refresh token session storage & rotation in PostgreSQL, secure cookie generation.                                                            |
| **`cron-parser`**     | NestJS, Schedule, Axios               | Headless Daemon       | Every 1 minute             | Ingests market data from CoinGecko, updates PostgreSQL, sets Redis price keys, and broadcasts price updates to RabbitMQ.                                                |
| **`alert`**           | NestJS, Schedule, AMQP                | Headless Daemon       | Event-driven + Hourly Cron | Evaluates active alerts on price tick events, performs atomic status transition (`ACTIVE` → `TRIGGERED`), dispatches channel events, auto-expires alerts.               |
| **`worker-telegram`** | NestJS, Telegraf, Redis               | Worker + Bot          | `3009`                     | Listens to Telegram bot `/start` commands for account linking (via Redis + RabbitRPC), consumes alert events, and sends rate-limited messages with exponential backoff. |
| **`worker-email`**    | NestJS, Resend                        | Worker                | `3010`                     | Consumes email alert events, compiles responsive HTML email templates, and sends transactional emails via Resend.                                                       |
| **`worker-push`**     | NestJS, Web-Push (VAPID)              | Worker                | `3011`                     | Consumes push alert events, fetches user endpoints from PostgreSQL, transmits encrypted payloads via VAPID, and cleans up dead endpoints (404/410).                     |

### Shared Packages (`packages/`)

| Package                             | Purpose                                                                                                                     |
| :---------------------------------- | :-------------------------------------------------------------------------------------------------------------------------- |
| **`@crypto-pulse/db`**              | Central Prisma ORM service, multi-file schema management (`auth`, `alert`, `coin`), migrations, and Prisma Client exports.  |
| **`@crypto-pulse/redis`**           | Dynamic NestJS Redis module configuring an `ioredis` client with pipeline and lifecycle management.                         |
| **`@crypto-pulse/rabbitmq-common`** | Typed constants and enums for RabbitMQ exchanges, routing keys, and queues.                                                 |
| **`@crypto-pulse/coin`**            | Shared repository layer for coin entities with read-through and write-through Redis caching strategies.                     |
| **`@crypto-pulse/nest-common`**     | Shared utilities across NestJS apps: JWT options builder, cookie constants, exponential backoff retries, and error parsers. |

---

## 📡 RabbitMQ Messaging Topology

All inter-service messaging runs on RabbitMQ topic exchanges and durable direct queues:

| Exchange                | Type    | Routing Key           | Queue Name               | Producer          | Consumer          | Payload Description                                                                                 |
| :---------------------- | :------ | :-------------------- | :----------------------- | :---------------- | :---------------- | :-------------------------------------------------------------------------------------------------- |
| **`crypto.exchange`**   | `topic` | `crypto.updated`      | `alert-processing-queue` | `cron-parser`     | `alert`           | Array of coin price updates (`ticker`, `previousPrice`, `currentPrice`).                            |
| **`telegram.exchange`** | `topic` | `send_telegram_alert` | `telegram-alerts-queue`  | `alert`           | `worker-telegram` | Alert payload (`alertId`, `telegramChatId`, `ticker`, `targetPrice`, `currentPrice`, `condition`).  |
| **`telegram.exchange`** | `topic` | `telegram.link`       | `telegram-links-queue`   | `worker-telegram` | `api` _(RPC)_     | User linking request (`userId`, `telegramId`, `username`, `firstName`).                             |
| **`email.exchange`**    | `topic` | `send_email_alert`    | `email-alerts-queue`     | `alert`           | `worker-email`    | Email alert details (`alertId`, `email`, `ticker`, `targetPrice`, `currentPrice`, `condition`).     |
| **`push.exchange`**     | `topic` | `send_push_alert`     | `push-alerts-queue`      | `alert`           | `worker-push`     | Web Push alert payload (`alertId`, `userId`, `ticker`, `targetPrice`, `currentPrice`, `condition`). |

---

## 🗄 Database Schema

The database is managed via Prisma ORM (`packages/db`) against PostgreSQL:

| Model                     | Table                   | Core Fields                                                                                                | Description                                                                                                   |
| :------------------------ | :---------------------- | :--------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------ |
| **`User`**                | `User`                  | `id`, `email`, `name`, `avatarUrl`, `telegramChatId`                                                       | User account profile. Linked to accounts, sessions, alerts, and push subscriptions.                           |
| **`Account`**             | `Account`               | `id`, `userId`, `provider`, `providerAccountId`                                                            | OAuth provider credentials (e.g., `google`).                                                                  |
| **`Session`**             | `Session`               | `id`, `userId`, `refreshToken`, `expiresAt`                                                                | Refresh token session records for token rotation.                                                             |
| **`Alert`**               | `crypto_alerts`         | `id`, `userId`, `ticker`, `targetPrice`, `condition`, `status`, `expiresAt`                                | Price threshold alert. Conditions: `ABOVE`, `BELOW`. Statuses: `ACTIVE`, `TRIGGERED`, `CANCELLED`, `EXPIRED`. |
| **`NotificationChannel`** | `notification_channels` | `id`, `alertId`, `type`                                                                                    | Notification channels bound to an alert: `TELEGRAM`, `EMAIL`, `PUSH`, `DISCORD`.                              |
| **`PushSubscription`**    | `push_subscriptions`    | `id`, `userId`, `endpoint`, `p256dh`, `auth`, `userAgent`                                                  | Web Push VAPID endpoints and cryptography keys.                                                               |
| **`Coin`**                | `Coin`                  | `id`, `symbol`, `name`, `currentPrice`, `marketCap`, `priceChangePercentage1h`, `priceChangePercentage24h` | Cached cryptocurrency market data synced by the parser.                                                       |

---

## 💻 Tech Stack

### Backend & Microservices

- **Runtime**: [Node.js](https://nodejs.org/) (v20+) with [TypeScript](https://www.typescriptlang.org/) & [SWC](https://swc.rs/) for rapid compilation
- **Framework**: [NestJS 11](https://nestjs.com/)
- **Message Broker Client**: [@golevelup/nestjs-rabbitmq](https://github.com/golevelup/nestjs) (AMQP connection pooling & RPC)
- **Database & ORM**: [PostgreSQL 16](https://www.postgresql.org/) with [Prisma 7](https://www.prisma.io/)
- **Caching**: [Redis 7](https://redis.io/) via [ioredis](https://github.com/redis/ioredis)
- **Scheduling**: [@nestjs/schedule](https://docs.nestjs.com/techniques/scheduling)
- **Bot Framework**: [Telegraf](https://telegraf.js.org/) & [nestjs-telegraf](https://github.com/bukhalo/nestjs-telegraf)
- **Email Delivery**: [Resend](https://resend.com/) & [nestjs-resend](https://github.com/resend/nestjs-resend)
- **Web Push**: [web-push](https://github.com/web-push-libs/web-push) (VAPID)
- **API Documentation**: [Swagger / OpenAPI](https://swagger.io/) (`@nestjs/swagger`)

### Frontend

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Components & Server Actions)
- **UI Library**: [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)
- **State & Data Fetching**: [TanStack Query v5](https://tanstack.com/query)
- **Tables & Visualization**: [TanStack Table v9](https://tanstack.com/table), [Lucide Icons](https://lucide.dev/)

### Monorepo & Tooling

- **Build System**: [Turborepo 2](https://turbo.build/repo)
- **Package Manager**: npm workspaces
- **Code Quality**: ESLint 9, Prettier 3

---

## 📂 Project Directory Structure

```text
crypto-pulse/
├── apps/
│   ├── alert/               # Event listener for price crossing & alert dispatcher
│   ├── api/                 # API Gateway / BFF (REST + Swagger + RabbitRPC)
│   ├── auth/                # Google OAuth 2.0 & rotating session manager
│   ├── cron-parser/         # Scheduled CoinGecko market parser & Redis cache syncer
│   ├── frontend/            # Next.js 16 web application
│   ├── worker-email/        # Resend email notification consumer
│   ├── worker-push/         # Web Push VAPID notification consumer
│   └── worker-telegram/     # Telegraf bot listener & alert dispatcher
├── docs/
│   ├── architecture.drawio  # Editable Draw.io source diagram
│   └── architecture.svg     # Exported architecture SVG diagram
├── packages/
│   ├── coin/                # Coin repository with read/write Redis cache
│   ├── db/                  # Prisma schemas, migrations & client
│   ├── nest-common/         # Shared JWT config, cookie keys & retry logic
│   ├── rabbitmq-common/     # Central exchanges, queues & routing keys
│   └── redis/               # Shared NestJS dynamic Redis module
├── package.json             # Root monorepo configuration
├── turbo.json               # Turborepo task pipeline definition
└── tsconfig.base.json       # Monorepo TypeScript configuration
```

---

## ⚙️ Environment Variables

Each microservice contains its own `.env.example`. Create a `.env` in the corresponding app folder or set variables globally:

### 1. Database (`packages/db/.env` and services using Prisma)

| Variable       | Description                  | Example                                                      |
| :------------- | :--------------------------- | :----------------------------------------------------------- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/crypto_pulse` |

### 2. Message Broker & Redis (`apps/*`)

| Variable       | Description                  | Example                              |
| :------------- | :--------------------------- | :----------------------------------- |
| `RABBITMQ_URI` | RabbitMQ AMQP connection URI | `amqp://guest:guest@localhost:5672/` |
| `REDIS_HOST`   | Redis host                   | `localhost`                          |
| `REDIS_PORT`   | Redis port                   | `6379`                               |

### 3. API Gateway (`apps/api/.env`)

| Variable                | Description                     | Example                  |
| :---------------------- | :------------------------------ | :----------------------- |
| `PORT`                  | HTTP port                       | `3000`                   |
| `JWT_ACCESS_SECRET`     | Secret key for access JWTs      | `your_jwt_access_secret` |
| `FRONTEND_URL`          | Allowed CORS origin             | `http://localhost:4200`  |
| `AUTH_SERVICE_URL`      | Internal Auth service base URL  | `http://localhost:3001`  |
| `TELEGRAM_BOT_USERNAME` | Telegram bot handle (without @) | `CryptoPulseAlertBot`    |

### 4. Auth Service (`apps/auth/.env`)

| Variable                 | Description                          | Example                                          |
| :----------------------- | :----------------------------------- | :----------------------------------------------- |
| `PORT`                   | HTTP port                            | `3001`                                           |
| `JWT_ACCESS_SECRET`      | Secret key for access JWTs           | `your_jwt_access_secret`                         |
| `JWT_REFRESH_SECRET`     | Secret key for refresh tokens        | `your_jwt_refresh_secret`                        |
| `JWT_ACCESS_EXPIRES_IN`  | Access token lifespan                | `15m`                                            |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifespan               | `30d`                                            |
| `GOOGLE_CLIENT_ID`       | Google OAuth Client ID               | `xxx.apps.googleusercontent.com`                 |
| `GOOGLE_CLIENT_SECRET`   | Google OAuth Client Secret           | `GOCSPX-xxx`                                     |
| `GOOGLE_CALLBACK_URL`    | Google OAuth Authorized Redirect URI | `http://localhost:3000/api/auth/google/callback` |
| `FRONTEND_URL`           | Post-auth redirect URL               | `http://localhost:4200`                          |

### 5. Cron Parser (`apps/cron-parser/.env`)

| Variable            | Description     | Example                                                                               |
| :------------------ | :-------------- | :------------------------------------------------------------------------------------ |
| `COINGECKO_API_URL` | Market endpoint | `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_asc` |

### 6. Workers (`apps/worker-*`)

| Service           | Variable               | Description                                    |
| :---------------- | :--------------------- | :--------------------------------------------- |
| `worker-telegram` | `TELEGRAM_BOT_TOKEN`   | Bot token obtained from `@BotFather`           |
| `worker-telegram` | `TELEGRAM_BOT_PORT`    | Internal HTTP port (`3009`)                    |
| `worker-email`    | `RESEND_API_KEY`       | Resend API key                                 |
| `worker-email`    | `EMAIL_DOMAIN`         | Verified email sender domain                   |
| `worker-email`    | `EMAIL_WORKER_PORT`    | Internal HTTP port (`3010`)                    |
| `worker-email`    | `APP_URL`              | Public application URL for email CTAs          |
| `worker-push`     | `WEB_PUSH_PUBLIC_KEY`  | VAPID public key                               |
| `worker-push`     | `WEB_PUSH_PRIVATE_KEY` | VAPID private key                              |
| `worker-push`     | `WEB_PUSH_SUBJECT`     | VAPID contact URI (`mailto:admin@example.com`) |
| `worker-push`     | `PUSH_WORKER_PORT`     | Internal HTTP port (`3011`)                    |

### 7. Frontend (`apps/frontend/.env`)

| Variable                         | Description                                | Example                                  |
| :------------------------------- | :----------------------------------------- | :--------------------------------------- |
| `NEXT_PUBLIC_API_URL`            | Backend Gateway API URL                    | `http://localhost:3000/api`              |
| `NEXT_PUBLIC_GOOGLE_AUTH_URL`    | Google Auth endpoint                       | `http://localhost:3000/api/auth/google/` |
| `NEXT_PUBLIC_WEBPUSH_PUBLIC_KEY` | VAPID public key for browser subscriptions | `your_vapid_public_key`                  |

## 🛠 Available Scripts

Execute scripts across all workspaces from the monorepo root:

| Command               | Action                                                                |
| :-------------------- | :-------------------------------------------------------------------- |
| `npm run dev`         | Starts all microservices and frontend concurrently with hot-reloading |
| `npm run build`       | Builds all packages and production bundles using Turborepo pipeline   |
| `npm run db:generate` | Regenerates Prisma Client models across packages                      |
| `npm run lint`        | Runs ESLint across all projects                                       |
| `npm run format`      | Formats all code with Prettier (`ts`, `tsx`, `json`, `md`)            |

---

## 🛡 Fault Tolerance & Reliability Features

1. **Atomic Alert Triggering**: Prevents race conditions during concurrent price ticks using conditional database updates (`UPDATE alert SET status = 'TRIGGERED' WHERE status = 'ACTIVE'`).
2. **Backoff & Rate Limiting**:
   - Telegram messages obey a strict minimum interval (40ms) and retry with exponential backoff on Telegram 429 (`retry_after` parameter).
   - If a user blocks the Telegram bot (HTTP 403), the worker safely drops the message without crashing.
3. **Automatic Dead Subscription Removal**: The Web Push worker automatically catches HTTP 404 / 410 responses from push services and deletes obsolete subscriptions from PostgreSQL.
4. **Resilient Token Handling**: Next.js proxy middleware transparently renews expiring access tokens using refresh tokens before page rendering, eliminating authorization flashes.
