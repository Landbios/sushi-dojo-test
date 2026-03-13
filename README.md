# Sushi Dojo "Dark Dragon" 🐉

A premium, high-performance restaurant ordering application built with Next.js, MongoDB, and Serverless.

## Prerequisites

- **Node.js**: v20.x or higher
- **Package Manager**: npm
- **Docker**: For running MongoDB locally
- **Serverless Framework**: `npm install -g serverless`

## Environment Setup

1. Copy `.env.example` to `.env.local`:
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

## Worker Portal 👩‍🍳

The **Worker Dashboard** is available at `/worker`. Use it to manage the kitchen and delivery flow.

### Worker Walkthrough:
1. **View Orders**: See all incoming orders in real-time.
2. **Status Transitions**: Move an order through its lifecycle by clicking the action button (e.g., "Accept", "Preparing", "Delivering").
3. **Audit History**: Click "View Timeline" on any order to see its internal audit log, including who changed the status and when.
4. **Cancellations**: Workers can cancel any active order if needed.

## Route Map 🗺️

### Frontend
- `/`: Customer Menu & Order Flow
- `/orders/[id]`: Order Confirmation & Immutable Timeline Explorer
- `/worker`: Worker Dashboard

### API Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/menu` | Retrieves the full product catalog and modifier groups. |
| `POST` | `/api/cart/price` | **Secure** server-side pricing calculation. |
| `POST` | `/api/orders` | Creates an order. Returns `202 Accepted`. Enforces `Idempotency-Key`. |
| `GET` | `/api/orders/[id]` | Retrieves detailed order status and items. |
| `PATCH` | `/api/orders/[id]` | Updates order status (Worker only). Logs to audit timeline. |
| `GET` | `/api/orders/[id]/timeline` | Fetches the immutable event log for an order. |
| `POST` | `/api/events` | Logs client-side lifecycle events (Cart adds/removes). Enforces 16KB limit. |
| `GET` | `/api/worker/orders` | Retrieves all system orders for the dashboard. |

## Technical Fulfillment

- **Checkout Idempotency**: Handled via `Idempotency-Key` header.
- **Server-Side Pricing**: Calculated in `lib/pricing.ts`, never trusting client-side totals.
- **Audit Timeline**: Immutable event log stored in MongoDB.
- **PII Masking**: Automatic masking of emails and phones in logs.
- **Payload Limits**: 16KB limit enforced for all audit events.

---
Created for SunDevs Technical Test by Orlando Perez.
