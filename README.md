# Razorpay POC (Node.js v24 + Express + TypeScript + PostgreSQL + Docker)

A full Proof of Concept project for Razorpay payment gateway integration using:

- Node.js v24 (ES modules)
- TypeScript (strict mode)
- Express.js API
- PostgreSQL
- Docker and Docker Compose
- pgAdmin for DB management
- Node 24 native features: `--env-file-if-exists`, `--watch` (for built output), built-in `node:test`, `AsyncLocalStorage`

## 1. Features

- Razorpay SDK integration (official Node.js SDK)
- APIs:
  - POST /api/payments/create-order
  - POST /api/payments/verify-payment
  - GET /api/payments/orders
- Optional webhook:
  - POST /api/payments/webhook
- PostgreSQL order persistence
- Input validation
- Request logging middleware
- Centralized error handling middleware
- Optional static frontend to test Razorpay Checkout
- Request correlation IDs using `AsyncLocalStorage`

## 2. Project Structure

```text
.
├── public/
│   └── index.html
├── sql/
│   └── init.sql
├── src/
│   ├── controllers/
│   │   └── paymentController.ts
│   ├── db/
│   │   ├── initDb.ts
│   │   └── pool.ts
│   ├── middleware/
│   │   ├── errorHandler.ts
│   │   └── logger.ts
│   ├── routes/
│   │   └── paymentRoutes.ts
│   ├── services/
│   │   ├── orderService.ts
│   │   └── razorpayService.ts
│   ├── types/
│   │   └── order.ts
│   ├── utils/
│   │   ├── asyncHandler.ts
│   │   ├── httpError.ts
│   │   └── validation.ts
│   ├── app.ts
│   ├── config.ts
│   └── server.ts
├── tsconfig.json
├── .dockerignore
├── .env.example
├── docker-compose.yml
├── Dockerfile
├── package.json
└── README.md
```

## 3. Razorpay Setup

### A. Create Razorpay Account

1. Go to https://razorpay.com and sign up.
2. Complete account onboarding.
3. Open Dashboard.

### B. Generate API Keys

1. In Razorpay Dashboard, go to Settings -> API Keys.
2. Generate keys for Test Mode.
3. Copy:
   - Key ID -> RAZORPAY_KEY_ID
   - Key Secret -> RAZORPAY_KEY_SECRET
4. For production, switch to Live Mode and generate live keys.

## 4. Environment Variables

Create a .env file from .env.example.

```bash
cp .env.example .env
```

Set values:

```env
PORT=3000
NODE_ENV=development
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
WEBHOOK_SECRET=
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/razorpay_poc
```

Notes:

- For local Node app (without Docker app service), DATABASE_URL should usually target localhost.
- In Docker app service, DATABASE_URL is already set to use service name postgres.
- Local scripts load `.env` using Node.js native `--env-file-if-exists` (no dotenv runtime dependency).

## 4.1 Node 24 Native Runtime Commands

Development mode:

```bash
pnpm dev
```

Native Node watch mode on built output:

```bash
pnpm dev:node-watch
```

Run built-in Node test runner:

```bash
pnpm test
pnpm test:watch
```

Type check and build:

```bash
pnpm typecheck
pnpm build
```

## 5. Docker Setup

### A. Install Docker

Install Docker Desktop from https://www.docker.com/products/docker-desktop.

### B. Run Services

```bash
docker-compose up --build
```

This starts:

- app: Node + Express API on port 3000
- postgres: PostgreSQL on port 5432
- pgadmin: pgAdmin UI on port 5050

### C. Access URLs

- API health: http://localhost:3000/health
- API base: http://localhost:3000/api/payments
- Optional frontend test page: http://localhost:3000
- pgAdmin: http://localhost:5050

## 6. PostgreSQL Access (pgAdmin)

### A. pgAdmin Login

- Email: admin@example.com
- Password: admin123

### B. Add Server in pgAdmin

Use these values when creating a server connection in pgAdmin:

- Host: postgres
- Port: 5432
- Username: postgres
- Password: postgres
- Database: razorpay_poc

## 7. Database Schema

The orders table is auto-created in two ways:

1. Docker PostgreSQL init script via sql/init.sql.
2. App startup safety init via src/db/initDb.ts.

Schema:

- id (SERIAL PRIMARY KEY)
- razorpay_order_id (UNIQUE)
- amount (INTEGER)
- currency (VARCHAR)
- status (created | paid | failed)
- razorpay_payment_id (nullable)
- razorpay_signature (nullable)
- created_at (timestamp)

## 8. API Endpoints

### A. Create Order

- Method: POST
- URL: /api/payments/create-order

Request body:

```json
{
  "amount": 50000,
  "currency": "INR"
}
```

Example curl:

```bash
curl --request POST \
  --url http://localhost:3000/api/payments/create-order \
  --header 'Content-Type: application/json' \
  --data '{
    "amount": 50000,
    "currency": "INR"
  }'
```

Behavior:

- Creates Razorpay order.
- Stores order in DB with status = created.

### B. Verify Payment

- Method: POST
- URL: /api/payments/verify-payment

Request body:

```json
{
  "razorpay_order_id": "order_ABC123",
  "razorpay_payment_id": "pay_ABC123",
  "razorpay_signature": "generated_signature"
}
```

Example curl:

```bash
curl --request POST \
  --url http://localhost:3000/api/payments/verify-payment \
  --header 'Content-Type: application/json' \
  --data '{
    "razorpay_order_id": "order_ABC123",
    "razorpay_payment_id": "pay_ABC123",
    "razorpay_signature": "generated_signature"
  }'
```

Behavior:

- Verifies Razorpay signature using HMAC SHA256.
- Updates DB record to paid on success.
- Marks failed on invalid signature.

### C. Fetch Orders

- Method: GET
- URL: /api/payments/orders

Example curl:

```bash
curl --request GET \
  --url http://localhost:3000/api/payments/orders
```

Behavior:

- Returns all orders sorted by latest created_at.

### D. Optional Webhook

- Method: POST
- URL: /api/payments/webhook

Webhook verification is enabled only if WEBHOOK_SECRET is set.

Supported events:

- payment.captured -> marks order as paid
- payment.failed -> marks order as failed

## 9. Payment Testing (Razorpay Test Mode)

Use Razorpay Test Mode cards. Common test card:

- Card Number: 4111 1111 1111 1111
- Expiry: any future month/year
- CVV: any 3 digits
- Name: any name
- OTP: 123456 (if prompted in test flow)

Always confirm latest test credentials in Razorpay official docs/dashboard.

## 10. Payment Flow Explanation

1. Client calls create-order with amount and currency.
2. Backend creates Razorpay order via SDK.
3. Backend saves order in PostgreSQL with status created.
4. Razorpay Checkout opens using returned order_id.
5. User completes payment in test mode.
6. Client receives razorpay_order_id, razorpay_payment_id, razorpay_signature.
7. Client calls verify-payment with those fields.
8. Backend verifies signature and updates DB to paid (or failed if invalid).
9. Orders endpoint shows latest payment states.

## 11. Run Without Docker (Optional)

1. Start PostgreSQL locally.
2. Ensure DATABASE_URL points to local DB.
3. Install dependencies and start app:

```bash
pnpm install
pnpm dev
```

For production build locally:

```bash
pnpm build
pnpm start
```

`pnpm start` runs built JavaScript with Node's native `.env` loader.

## 12. Logging, Validation, and Error Handling

- Logging middleware prints method, route, status code, and duration.
- Validation checks amount, currency, and required signature fields.
- Error middleware returns clean JSON errors.

## 13. GitHub Repository Setup

Repository name requested: razor-pay-poc

Run:

```bash
git init
git add .
git commit -m "Initial Razorpay POC with Node, Express, Postgres, Docker"
git branch -M main
git remote add origin https://github.com/<your-username>/razor-pay-poc.git
git push -u origin main
```

If a repository already exists locally, only add remote and push.

## 14. Useful Endpoints Summary

- GET /health
- GET /api/config
- POST /api/payments/create-order
- POST /api/payments/verify-payment
- GET /api/payments/orders
- POST /api/payments/webhook

## 15. Notes

- Amount is expected in smallest unit (paise for INR).
- Keep secrets in .env only, never commit real keys.
- Use Razorpay Test Mode before Live Mode.
