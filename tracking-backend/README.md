# 📦 ShipTrack — Shipment Tracking Platform

A production-ready shipment tracking platform with real-time status updates, admin dashboard, and full REST API.

---

## 🗂 Project Structure

```
shiptrack/
├── frontend/               ← React app (shiptrack-app.jsx artifact)
└── backend/
    ├── src/
    │   ├── server.js           Entry point
    │   ├── config/
    │   │   └── database.js     MongoDB connection
    │   ├── models/
    │   │   ├── Shipment.js     Shipment schema
    │   │   └── User.js         Admin user schema
    │   ├── routes/
    │   │   ├── auth.js         POST /api/auth/login, /register, /me
    │   │   ├── shipments.js    GET  /api/shipments/:trackingId (public)
    │   │   ├── admin.js        Full CRUD (protected)
    │   │   └── analytics.js    Dashboard stats (protected)
    │   ├── middleware/
    │   │   └── auth.js         JWT protect + restrictTo
    │   └── utils/
    │       ├── email.js        Nodemailer status notifications
    │       └── seed.js         Dev database seed
    ├── package.json
    └── .env.example
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6+ (local or Atlas)

### 1. Install dependencies
```bash
cd backend
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Seed the database (development)
```bash
npm run seed
# Creates: admin@shiptrack.com / admin123456
# + 2 sample shipments (SHT001ABC, SHT002XYZ)
```

### 4. Start the server
```bash
npm run dev     # Development (with hot reload)
npm start       # Production
```

Server runs at `http://localhost:5000`

---

## 🌐 API Reference

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/shipments/:trackingId` | Track a shipment (rate limited: 20/15min) |

### Auth Endpoints (rate limited: 10/15min)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Admin login → returns JWT |
| GET | `/api/auth/me` | Get current admin user |
| POST | `/api/auth/change-password` | Change password |

**Login example:**
```json
POST /api/auth/login
{ "email": "admin@shiptrack.com", "password": "admin123456" }
```

### Admin Endpoints (all require `Authorization: Bearer <token>`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/shipments` | List all (pagination, filter, search) |
| GET | `/api/admin/shipments/:id` | Get single shipment |
| POST | `/api/admin/shipments` | Create shipment |
| PATCH | `/api/admin/shipments/:id` | Update shipment |
| DELETE | `/api/admin/shipments/:id` | Soft delete |
| POST | `/api/admin/shipments/:id/events` | Add timeline event |
| DELETE | `/api/admin/shipments/:id/events/:eventId` | Remove event |
| GET | `/api/admin/shipments/:id/qr` | Get QR code (base64) |
| GET | `/api/admin/shipments/export/excel` | Export to .xlsx |
| GET | `/api/analytics/overview` | Dashboard stats |
| GET | `/api/analytics/timeline` | Shipments/day (30 days) |

**Query params for GET /api/admin/shipments:**
- `status` — filter by status
- `search` — search tracking ID, sender, receiver
- `page`, `limit` — pagination (default 1, 20)
- `sortBy`, `order` — sorting (default createdAt desc)

**Create shipment body:**
```json
{
  "sender": { "name": "Acme Corp", "email": "ship@acme.com" },
  "receiver": { "name": "John Doe", "email": "john@example.com", "address": "123 Main St" },
  "origin": "Lagos, Nigeria",
  "destination": "London, UK",
  "status": "Processing",
  "service": "Express International",
  "weight": 2.5,
  "estimatedDelivery": "2025-06-20",
  "description": "Electronics"
}
```

---

## 🔒 Security Features

- **JWT authentication** with expiry and password-change invalidation
- **Bcrypt** password hashing (12 rounds)
- **Rate limiting** — global (100/15min), auth (10/15min), track (20/15min)
- **NoSQL injection protection** via `express-mongo-sanitize`
- **Helmet.js** HTTP security headers
- **Input validation** via Mongoose schema validators
- **Soft deletes** — data preserved, not permanently deleted
- **Sensitive data masking** on public tracking endpoint

---

## ☁️ Deployment

### Railway / Render (easiest)
1. Push backend to GitHub
2. Connect repo to Railway or Render
3. Add environment variables from `.env.example`
4. Deploy — they auto-detect Node.js

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src ./src
EXPOSE 5000
CMD ["node", "src/server.js"]
```
```bash
docker build -t shiptrack-api .
docker run -p 5000:5000 --env-file .env shiptrack-api
```

### MongoDB Atlas (production database)
1. Create free cluster at mongodb.com/atlas
2. Get connection string
3. Set `MONGODB_URI=mongodb+srv://...` in env vars

### Connect Frontend
In the React artifact, replace the mock `api` object with real fetch calls:
```js
const BASE_URL = "https://your-api.railway.app/api";

// Track shipment
const res = await fetch(`${BASE_URL}/shipments/${trackingId}`);
const { shipment } = await res.json();

// Admin login
const res = await fetch(`${BASE_URL}/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});
const { token } = await res.json();

// Protected admin request
const res = await fetch(`${BASE_URL}/admin/shipments`, {
  headers: { Authorization: `Bearer ${token}` },
});
```

---

## 📧 Email Notifications Setup

1. Create a Gmail App Password (Google Account → Security → App Passwords)
2. Set in `.env`:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your@gmail.com
   SMTP_PASS=your-16-char-app-password
   ```
3. Enable notifications per shipment: `notifications.email = true` on the shipment

---

## 🔧 Future Integrations

- **SMS** — Replace `sendStatusEmail` stub with Twilio API
- **DHL/FedEx** — Add `/api/external/sync` route polling courier APIs
- **Webhooks** — Emit status events to subscriber URLs
- **PDF reports** — Add `pdfkit` and a `/export/pdf` route
- **Multi-language** — Wrap text in `i18next` with locale detection
