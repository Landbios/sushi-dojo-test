# Momo Sushia - Restaurant Ordering & Timeline System

A modern restaurant ordering flow with a reliable Order Timeline audit trail.

## Key Features
- **Menu System**: API-driven menu with complex customization.
- **Cart Engine**: Server-side pricing validation and coupon support.
- **Idempotency**: Secure checkout with `Idempotency-Key` validation.
- **Audit Trail**: Immutable event-sourced timeline for every order.
- **Security**: 16KB payload limits and automatic PII masking.

## Prerequisites
- **Node.js**: v18+
- **Docker**: For MongoDB (Optional, falls back to in-memory)
- **Package Manager**: npm

## Quick Start (10 Minutes)

### 1. Setup Environment
```bash
npm install
```

### 2. Start Services
To start the database (Optional):
```bash
docker-compose up -d
```

### 3. Run Application
```bash
# Start the Next.js development server
npm run dev
```
The application will be available at `http://localhost:3000`.

### 4. Running Backend with Serverless (Optional)
```bash
# Using serverless-offline
npx serverless offline
```

## Testing & Seed Data
- **Seed Data**: Products and coupons are automatically seeded in `src/lib/db.ts`.
- **API Endpoints**:
  - `GET /api/menu`: Retrieve menu products.
  - `POST /api/cart/price`: Validate and calculate pricing (Server-side).
  - `POST /api/orders`: Secure idempotent checkout.
  - `GET /api/orders/[orderId]/timeline`: Fetch the audit trail.

## Development Details
- **Tech Stack**: Next.js 15, Tailwind CSS, Zustand, MongoDB.
- **Rules**:
  - All currency represented as **integer cents**.
  - Payload size strictly limited to **16KB**.
  - **PII Masking** enabled for emails and phone numbers in logs.

---
Created for SunDevs Technical Test.
