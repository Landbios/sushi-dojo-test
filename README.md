# Sushi Dojo "Dark Dragon" 🐉

A premium, high-performance restaurant ordering application built with Next.js, MongoDB, and Serverless.

## Prerequisites

- **Node.js**: v20.x or higher
- **Package Manager**: npm
- **Docker**: For running MongoDB locally
- **Serverless Framework**: `npm install -g serverless`

## Environment Setup

1. Copy `.env.example` to `.env.local` (or create it):
   ```bash
   MONGODB_URI=mongodb://localhost:27017
   MONGODB_DB=sushi-dojo
   ```

## How to Run Locally

### 1. Start Database
```bash
docker run -d --name sushi-mongo -p 27017:27017 mongo:latest
```

### 2. Start Application
You can run the app in two ways:

**Development Mode (Next.js):**
```bash
npm run dev
```
- Frontend & API: `http://localhost:3000`

**Offline Serverless Mode:**
```bash
serverless offline
```
- API Gateway Emulator: `http://localhost:4000`

## Technical Fulfillment

- **Checkout Idempotency**: Handled via `Idempotency-Key` header in `POST /api/orders`.
- **Server-Side Pricing**: Calculated in `lib/pricing.ts`, never trusting client-side totals.
- **Audit Timeline**: Immutable event log stored in MongoDB.
- **PII Masking**: Automatic masking of emails and phones in logs.
- **Payload Limits**: 16KB limit enforced for all event and order payloads.

## How to Test

### Run Linting
```bash
npm run lint
```

### Manual Verification
1. Add items to cart (triggers `CART_ITEM_ADDED`).
2. Open Cart to view pricing (triggers `PRICING_CALCULATED`).
3. Complete Checkout (triggers `ORDER_PLACED`).
4. View your order history and click an order to see its **Timeline Explorer**.

---
Created for SunDevs Technical Test.
