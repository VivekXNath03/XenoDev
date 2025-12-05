# Xeno - Shopify Analytics Platform

> What started as "I'm tired of switching between Shopify stores" turned into a full multi-tenant analytics platform.

If you manage multiple Shopify stores (or help clients manage theirs), you know the pain: logging in and out, copying data to spreadsheets, trying to compare performance across stores. I built Xeno to fix that—one dashboard to see everything.

## 🎥 Demo Video

[Watch the 7-minute walkthrough](YOUR_VIDEO_LINK_HERE)

In the video, I'll show you:
- How login and store management actually works
- The Shopify sync pipeline (and why I chose manual sync over webhooks)
- The analytics features: forecasting, alerts, product performance
- How I tackled multi-tenancy without data leaking between organizations
- Real talk about trade-offs I made and what I'd do differently with more time

## What This Thing Does

Basically, you connect your Shopify stores to Xeno and get:
- **One dashboard** to see orders, customers, and products across all your stores
- **Revenue forecasts** using exponential smoothing (not magic, just math)
- **Smart alerts** that tell you when products are trending or inventory is gathering dust
- **Role-based access** so your clients can see their stores but not each other's

It's multi-tenant from the ground up—different organizations using the same platform, zero data leakage. Think Shopify analytics meets agency SaaS.

## Why I Built It This Way

**The Problem**: Managing five Shopify stores means five logins, five dashboards, five headaches. I wanted one place to see everything.

**My Approach**:
- **Multi-tenancy from the start**: Built Organizations → Stores → Users from day one, so agencies can manage client stores without building separate apps
- **Real data, not fake**: Hit Shopify's GraphQL API to pull actual orders, products, and customers—no mock data
- **Analytics that matter**: Revenue forecasts (exponential smoothing, nothing fancy but it works), BCG matrix for product classification, automated alerts for trending/dying products
- **Keep it modular**: Split auth, data ingestion, and analytics into separate services so I can scale or rewrite parts without touching everything

**Where I Compromised** (because time is finite):
- **Manual sync instead of webhooks**: You click a button to sync. Webhooks would be real-time but need HTTPS, verification, retry logic... too much for a prototype. I'd add them for production.
- **Prisma Accelerate is optional**: Started using it for connection pooling, but it adds 100-200ms latency. Made it optional so local dev is snappy.
- **React Router over Next.js**: Wanted full separation between frontend and backend. Next.js would've been faster to build, but harder to deploy separately.
- **Simple forecasting**: Exponential smoothing is like "last month + some growth." It works for most stores. A real ML model (Prophet, LSTM) would be better but requires way more data and tuning.  

---

## How It All Works

Here's the architecture (yes, I drew it in ASCII):

```
                    ┌─────────────────────┐
                    │   React Frontend    │
                    │   (Vite + Tailwind) │
                    └──────────┬──────────┘
                               │ REST API + JWT
                               │
                    ┌──────────▼──────────┐
                    │  Express Backend    │
                    │  - Auth & RBAC      │
                    │  - Data Ingestion   │
                    │  - Analytics Engine │
                    └──────────┬──────────┘
                               │ Prisma ORM
                               │
                    ┌──────────▼──────────┐
                    │    PostgreSQL       │
                    │  - Organizations    │
                    │  - Stores & Users   │
                    │  - Orders/Products  │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Shopify GraphQL    │
                    │    Admin API        │
                    └─────────────────────┘
```

**The Flow**:
1. You log in → Backend gives you a JWT token → Stored in localStorage (yeah, I know, httpOnly cookies would be better)
2. You connect a Shopify store → We save it with your API token
3. Click "Sync" → Backend calls Shopify GraphQL, pulls orders/products/customers
4. Everything goes into Postgres via Prisma (upserts, so running sync twice doesn't duplicate stuff)
5. Dashboard queries this local copy → Charts load fast

**Why I Did It This Way**:
- **Frontend and backend totally separate**: Deploy them anywhere, scale independently
- **We keep a local copy**: Querying Shopify every time would hit rate limits and be slow as hell
- **Multi-tenant filtering everywhere**: Every query auto-filters by your org/store—leak data and we'd be screwed
- **RBAC isn't an afterthought**: Users can only see what they're supposed to see

---

## Tech Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime environment |
| Express.js | 5.1.0 | Web framework |
| Prisma | 6.1.0 | Database ORM |
| PostgreSQL | - | Relational database |
| JWT | jsonwebtoken | Authentication tokens |
| bcryptjs | - | Password hashing |
| Swagger | swagger-jsdoc | API documentation |
| Pino | - | Logging |
| Axios | - | HTTP client (Shopify API) |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | UI framework |
| Vite | 5.0.8 | Build tool & dev server |
| React Router | 6.20.0 | Client-side routing |
| Zustand | 4.4.7 | State management |
| Tailwind CSS | 3.3.6 | Utility-first styling |
| Recharts | 2.10.3 | Data visualization |
| Axios | 1.6.2 | HTTP client |
| lucide-react | 0.294.0 | Icon library |
| date-fns | 2.30.0 | Date manipulation |

---

## Project Structure

```
xeno/
├── backend/                        # Node.js backend (implicit src/)
│   ├── src/
│   │   ├── config/                 # Configuration files
│   │   │   ├── env.js              # Environment variables
│   │   │   ├── prisma.js           # Prisma client singleton
│   │   │   ├── logger.js           # Pino logger setup
│   │   │   └── swagger.js          # Swagger config
│   │   ├── common/                 # Shared utilities
│   │   │   ├── errors.js           # Custom error classes
│   │   │   ├── http.js             # HTTP status constants
│   │   │   └── middleware/         # Global middleware
│   │   │       ├── authGuard.js    # JWT verification
│   │   │       ├── orgContext.js   # Organization scoping
│   │   │       ├── storeContext.js # Store scoping
│   │   │       ├── errorHandler.js # Global error handler
│   │   │       └── notFoundHandler.js
│   │   ├── modules/                # Feature modules
│   │   │   ├── auth/               # Authentication
│   │   │   │   ├── auth.controller.js
│   │   │   │   ├── auth.service.js
│   │   │   │   └── auth.routes.js
│   │   │   ├── organizations/      # Organization CRUD
│   │   │   ├── users/              # User management + RBAC
│   │   │   ├── stores/             # Store management
│   │   │   ├── shopify/            # Shopify GraphQL client
│   │   │   ├── ingestion/          # Data sync service
│   │   │   └── metrics/            # Analytics endpoints
│   │   ├── app.js                  # Express app setup
│   │   └── server.js               # Server entry point
│   ├── prisma/
│   │   └── schema.prisma           # Database schema (11 models)
│   ├── .env                        # Environment variables
│   ├── package.json
│   └── README.md
│
├── frontend/                       # React frontend
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   │   ├── Card.jsx
│   │   │   ├── MetricCard.jsx
│   │   │   ├── ChartCard.jsx
│   │   │   ├── Loader.jsx
│   │   │   ├── ErrorMessage.jsx
│   │   │   ├── DateRangePicker.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── Layout.jsx
│   │   ├── charts/                 # Recharts visualizations
│   │   │   ├── RevenueLineChart.jsx
│   │   │   ├── OrdersBarChart.jsx
│   │   │   ├── ProductsPerformanceBarChart.jsx
│   │   │   └── CustomerPieChart.jsx
│   │   ├── pages/                  # Route pages
│   │   │   ├── Login.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── services/               # API integration
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── metricsService.js
│   │   │   └── storesService.js
│   │   ├── stores/                 # Zustand state
│   │   │   ├── authStore.js
│   │   │   └── storeContext.js
│   │   ├── utils/                  # Helper functions
│   │   │   ├── formatCurrency.js
│   │   │   └── formatDate.js
│   │   ├── App.jsx                 # Router setup
│   │   ├── main.jsx                # React entry
│   │   └── index.css               # Global styles
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   └── README.md
│
└── README.md                       # This file
```

---

## Getting Started

### What You Need

- **Node.js 18+** (because we're using modern stuff)
- **PostgreSQL** (local or hosted—Prisma Accelerate works too)
- **A Shopify store** with Admin API access (you'll need to generate a token)
- **Git** (obviously)

### 1. Clone It

```bash
git clone <your-repo-url>
cd xeno
```

### 2. Backend Setup

```bash
# Install stuff
npm install

# Copy and edit .env (add your database URL and Shopify keys)
cp .env.example .env

# Set up the database
npx prisma db push
npx prisma generate

# Fire it up
npm start
```

Backend: **http://localhost:5001**  
API docs (Swagger): **http://localhost:5001/docs**

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend: **http://localhost:3000** (or whatever port Vite picks if 3000 is taken)

### 4. Create Your First User

Either use the signup page at `http://localhost:3000/signup` or hit the API directly:

```bash
curl -X POST http://localhost:5001/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "you@example.com",
    "password": "something-secure",
    "fullName": "Your Name",
    "organizationName": "Your Company"
  }'
```

### 5. Log In

Go to `http://localhost:3000/login`, enter your email/password, and you're in.

### 6. Connect a Shopify Store

You'll need your JWT token (check localStorage after logging in, or grab it from the login response). Then:

```bash
curl -X POST http://localhost:5001/stores \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "My Store",
    "shopDomain": "yourstore.myshopify.com",
    "timezone": "America/New_York",
    "currency": "USD"
  }'
```

Then connect the Shopify API token:

```bash
curl -X POST http://localhost:5001/stores/STORE_ID/shopify/connect \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{ "accessToken": "shpat_xxxxx" }'
```

### 7. Sync Your Data

Click the **Sync** button in the navbar (or hit the API):

```bash
curl -X POST http://localhost:5001/ingestion/stores/STORE_ID/sync \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

First sync takes a minute or two depending on how much data you have.

---

## What Works Right Now

### ✅ Stuff That's Built

**Backend**:
- Auth (signup, login, JWT)
- Multi-tenancy (orgs can't see each other's data)
- User management with roles (admin vs viewer)
- Store connections (link as many Shopify stores as you want)
- Data sync from Shopify (customers, products, orders)
- Analytics (revenue forecasts, business alerts, product performance)
- Swagger docs at `/docs` so you can poke around the API
- Security basics (bcrypt passwords, JWT middleware, RBAC)

**Frontend**:
- Login/signup pages
- Dashboard with key metrics and charts (revenue, orders, top customers)
- Store switcher in the navbar
- Charts using Recharts (revenue line, orders bar, products bar, customer pie)
- Works on mobile (responsive Tailwind)
- Zustand for state (auth and store context)
- Axios with interceptors (auto-attaches JWT, handles 401s)

### 🚧 Stuff I'd Add Next

- Detailed order/product/customer pages (right now it's just dashboard-level)
- Sortable, filterable data tables
- UI to add stores (currently API-only)
- Settings page (change password, profile)
- Better date filters and search
- Export to CSV/Excel
- Shopify webhooks for real-time updates
- Cron jobs for automatic syncing
- Email alerts when syncs fail or something weird happens

---

## API Endpoints

Everything runs on `http://localhost:5001` (backend).

Most endpoints need auth—add your JWT token as a header:
```
Authorization: Bearer <your-token-here>
```

### Auth (No Token Needed)

- `POST /auth/signup` - Create account + organization
- `POST /auth/login` - Get JWT token

### Organizations (Token Required)

- `GET /organizations` - List all (super admin only)
- `POST /organizations` - Create new org (super admin)
- `GET /organizations/:id` - Get one
- `PATCH /organizations/:id` - Update
- `DELETE /organizations/:id` - Delete (super admin)

### Users (Token Required)

- `GET /users` - List users in your org
- `POST /users` - Create user (org admin only)
- `GET /users/:id` - Get user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user (org admin)

### Stores (Token Required)

- `GET /stores` - List stores you have access to
- `POST /stores` - Connect a new Shopify store
- `GET /stores/:id` - Get store details
- `PATCH /stores/:id` - Update settings
- `DELETE /stores/:id` - Remove store
- `POST /stores/:id/shopify/connect` - Link Shopify API token

### Data Sync (Token Required)

- `POST /ingestion/stores/:storeId/sync` - Pull latest data from Shopify
- `GET /ingestion/stores/:storeId/sync/status` - Check sync status

### Analytics (Token Required)

- `GET /analytics/business-alerts?storeId=X` - Smart alerts (trending products, revenue changes)
- `GET /analytics/revenue-forecast?storeId=X` - Predict next 6 months
- `GET /analytics/product-performance-matrix?storeId=X` - BCG matrix (stars, cash cows, etc.)

### Metrics (Token Required)

- `GET /metrics/summary?storeId=X&startDate=Y&endDate=Z` - Dashboard totals
- `GET /metrics/revenue-by-date?storeId=X&startDate=Y&endDate=Z` - Daily revenue
- `GET /metrics/orders-by-date?storeId=X&startDate=Y&endDate=Z` - Daily order count
- `GET /metrics/top-customers?storeId=X&limit=10` - Best customers
- `GET /metrics/products-by-revenue?storeId=X&limit=10` - Top products

**Full API docs**: http://localhost:5001/docs (Swagger UI)

---

## Database Schema

Running Postgres with Prisma. Here's what's in there:

### Core Models

#### 🏢 **Organization**
Top of the hierarchy. Everything else belongs to one org.
- `id` - UUID
- `name` - Org name
- `createdAt`, `updatedAt`
- **Has many**: Users, Stores

#### 👤 **User**
Actual people who log in.
- `id` - UUID
- `email` - Login email (unique)
- `passwordHash` - bcrypt'd password
- `fullName` - Their name
- `globalRole` - SUPER_ADMIN or ORGANIZATION_ADMIN
- `organizationId` - Which org they belong to
- `isActive` - Can soft-delete without losing history
- **Belongs to**: Organization; **Can access**: Multiple stores via UserStoreRole

#### 🏪 **Store**
A connected Shopify store.
- `id` - UUID
- `organizationId` - Who owns this
- `name` - Display name like "Main Store"
- `shopDomain` - e.g., "yourstore.myshopify.com"
- `timezone` - Defaults to America/New_York
- `currency` - Defaults to USD
- `isActive` - Can disable without deleting
- **Belongs to**: Organization; **Has**: ShopifyStoreConfig, Customers, Products, Orders

#### 🔐 **UserStoreRole**
Join table controlling who can see what store.
- `userId` + `storeId` - Composite key
- `role` - STORE_ADMIN or STORE_VIEWER
- **Links**: User ↔ Store

#### 🔑 **ShopifyStoreConfig**
Where we keep Shopify API tokens (careful with this one).
- `id` - UUID
- `storeId` - Links to Store (one-to-one)
- `accessToken` - Shopify Admin API token (should encrypt this in prod)
- `scope` - What permissions we have
- `installedAt` - When connected

### Data Models (Synced from Shopify)

#### 👥 **Customer**
- `id` - UUID primary key
- `storeId` - Which store this customer belongs to
- `shopifyCustomerId` - Shopify's ID (unique per store)
- `email`, `firstName`, `lastName`, `phone`
- `totalSpent` - Lifetime value
- `ordersCount` - Total orders placed
- `createdAt` - When customer was created in Shopify
- **Relations**: Belongs to Store, has many Orders

#### 📦 **Product**
- `id` - UUID primary key
- `storeId` - Which store
- `shopifyProductId` - Shopify's ID
- `title`, `description`
- `vendor`, `productType`
- `status` - ACTIVE or ARCHIVED
- `totalInventory` - Stock quantity
- `createdAt`, `updatedAt`
- **Relations**: Belongs to Store, appears in OrderLineItems

#### 🛒 **Order**
- `id` - UUID primary key
- `storeId` - Which store
- `shopifyOrderId` - Shopify's ID
- `customerId` - Link to Customer
- `orderNumber` - Human-readable order # (e.g., #1001)
- `totalPrice` - Order total
- `subtotalPrice`, `totalTax`, `totalShipping`
- `financialStatus` - PAID, PENDING, REFUNDED, etc.
- `fulfillmentStatus` - FULFILLED, UNFULFILLED, PARTIAL
- `processedAt` - When order was placed
- **Relations**: Belongs to Store and Customer, has many OrderLineItems

#### 📋 **OrderLineItem**
Individual products within an order.
- `id` - UUID primary key
- `orderId` - Which order
- `productId` - Which product (nullable if product deleted)
- `shopifyLineItemId` - Shopify's ID
- `title` - Product name at time of purchase
- `quantity` - Units ordered
- `price` - Price per unit
- `totalDiscount` - Discounts applied
- **Relations**: Belongs to Order, optionally links to Product

#### 🔄 **StoreSyncStatus**
Tracks data sync operations.
- `id` - UUID primary key
- `storeId` - Which store was synced
- `syncType` - FULL, CUSTOMERS, PRODUCTS, ORDERS
- `status` - IN_PROGRESS, COMPLETED, FAILED
- `startedAt`, `completedAt`
- `recordsProcessed`, `recordsFailed`
- `errorMessage` - If sync failed

### Design Decisions (The Interesting Bits)

**Multi-Tenancy**: Every table (except User/Organization) has a `storeId` or `organizationId`. Middleware filters queries automatically. Forget to filter and you leak data across orgs—that's why this is baked into every query.

**We Track Both IDs**: Each synced record has our UUID *and* Shopify's ID. Why? So we can:
- Tell if something's new or updated when syncing
- Handle when Shopify deletes stuff
- Keep relationships intact even if Shopify changes IDs (rare, but happens)

**Soft Deletes**: Stores and users have `isActive` flags. We don't actually delete them—preserves history and lets you reactivate later.

**Denormalized Totals**: Orders store `totalPrice`, `subtotalPrice`, etc. even though we *could* calculate from line items. Why? Speed. Also, Shopify applies order-level discounts that don't show up in line items.

### How Everything Connects

```
Organization (1) ──→ (N) User
    │
    └──→ (N) Store ──→ (1) ShopifyStoreConfig
              │
              ├──→ (N) Customer ──→ (N) Order ──→ (N) OrderLineItem
              │
              └──→ (N) Product

User (N) ←──→ (N) Store  [through UserStoreRole]
```

(One org has many stores. Each store has customers/products/orders. Users can access multiple stores via roles.)

---

## Development Guide

### Adding Backend Stuff

**New Module**:
1. Create `src/modules/mymodule/`
2. Add `mymodule.controller.js` (request handlers), `mymodule.service.js` (business logic), `mymodule.routes.js`
3. Wire it up in `src/app.js`

**Database Changes**:
```bash
# Edit prisma/schema.prisma, then:
npx prisma format
npx prisma db push
npx prisma generate
```

### Adding Frontend Stuff

**New Page**:
1. Create `src/pages/MyPage.jsx`
2. Add route in `src/App.jsx`
3. Link it from `src/components/Sidebar.jsx`

**New Chart**:
1. Create `src/charts/MyChart.jsx`
2. Use Recharts (BarChart, PieChart, LineChart)
3. Copy styling from existing charts
4. Import and drop in your page

**State**: Use Zustand for global stuff:
```javascript
import { create } from 'zustand';

export const useMyStore = create((set) => ({
  data: null,
  setData: (data) => set({ data }),
}));
```

### Code Style

- **Backend**: CommonJS (no TypeScript), camelCase, no strict linter
- **Frontend**: ES6 modules, React hooks, functional components
- Just follow the existing patterns

---

## Deployment

### Backend

**Docker** (if you're into that):
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
EXPOSE 5001
CMD ["npm", "start"]
```

**Cloud Platforms**:
- **Heroku**: `git push heroku main`
- **Railway**: Connect your GitHub repo, it figures out the rest
- **Render**: Point at repo, set env vars, done
- **AWS**: Elastic Beanstalk with Node.js platform

**Env vars you need**:
- `PORT` (5001)
- `DATABASE_URL` (Postgres connection string)
- `JWT_SECRET` (make it long and random)
- `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`

### Frontend

**Build it**:
```bash
cd frontend
npm run build  # outputs to dist/
```

**Deploy to**:
- **Vercel**: `vercel --prod` (easiest)
- **Netlify**: `netlify deploy --prod`
- **Cloudflare Pages**: Drag and drop `dist/`
- **AWS S3 + CloudFront**: Upload `dist/`, set up CloudFront

**Important**: Update `vite.config.js` proxy to point at your production backend URL.

---

## Environment Variables

### Backend (.env)

```env
# Server
PORT=5001
NODE_ENV=production

# Database (Prisma Accelerate)
DATABASE_URL=prisma://accelerate.prisma-data.net/?api_key=YOUR_KEY

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d

# Shopify
SHOPIFY_API_KEY=your-shopify-api-key
SHOPIFY_API_SECRET=your-shopify-api-secret
SHOPIFY_SCOPES=read_customers,read_products,read_orders
SHOPIFY_REDIRECT_URI=http://localhost:5001/shopify/callback
```

### Frontend (vite.config.js)

Update proxy target for production:

```javascript
server: {
  proxy: {
    '/api': {
      target: 'https://your-backend-url.com',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
    },
  },
},
```

---

## Security

**What's Built In**:
- JWT tokens (expire after 7 days)
- bcrypt password hashing (10 rounds—good enough)
- CORS configured
- Helmet.js for HTTP headers
- Basic input validation
- Multi-tenant isolation (queries filtered by org/store)

**What You Should Add**:
- Rate limiting (install `express-rate-limit`, takes 5 minutes)
- HTTPS in production (Let's Encrypt is free)
- Better input sanitization
- Regular `npm audit` checks
- Encrypt Shopify tokens in the database (use AWS KMS or similar)

---

## Troubleshooting

### Backend Problems

**Port 5000 already used** (macOS AirPlay uses it):
- Change to `PORT=5001` in `.env`

**Prisma errors**:
- Did you run `npx prisma generate` after changing the schema?
- Is `DATABASE_URL` correct?
- Can you reach the database?

**JWT auth fails**:
- Is `JWT_SECRET` set in `.env`?
- Token format: `Bearer <token>`
- Token might be expired (7 days default)

### Frontend Problems

**"Failed to fetch"**:
- Is backend running on 5001?
- Check Vite proxy in `vite.config.js`
- CORS enabled on backend?

**White screen**:
- Open console, see errors
- Check if localStorage has `auth` token
- Try clearing cache

**Charts not showing**:
- Data format match what Recharts expects?
- `ResponsiveContainer` have a height?
- Recharts actually installed?

---

## What This Doesn't Do (Yet)

Being real about limitations and shortcuts:

### Data Sync

**You have to manually sync**. Click the button or hit the API.
- **Why**: Webhooks need a public HTTPS endpoint, verification logic, retry handling, deduplication… too much for a prototype. Would 100% add this for production.
- **Impact**: Your data's stale until you sync. Not ideal for real-time use cases.

**Full sync every time**. We pull *everything* from Shopify (with some date filtering for orders).
- **Why**: Incremental sync means tracking "last synced" per entity and dealing with Shopify's unreliable `updated_at` field.
- **Impact**: Slow if you have 10k+ products. Better approach: webhooks + occasional full sync to catch missed updates.

**Shopify rate limits** (2 calls/sec). Big stores = slow syncs.
- **Current mitigation**: Batch with `Promise.all`. Should add retry logic and exponential backoff.

### Analytics

**Forecasting is simple**. Exponential smoothing, not ML.
- **Why**: ARIMA/Prophet/LSTM need way more data and tuning. For most Shopify stores, "last month + growth trend" is good enough.
- **Impact**: Won't catch seasonality (Black Friday spikes) or external factors (viral TikTok). Confidence intervals are just based on past variance.

**Product classification** (BCG matrix) only looks at revenue and growth.
- **Limitation**: Doesn't know about profit margins, inventory costs, or lifecycles. A high-revenue product with thin margins might be classified as a "Star" when it's barely profitable.

**Alert thresholds are fixed**. "Revenue dropped 20%" triggers an alert.
- **Problem**: Doesn't scale. $100 drop is huge for a small store, nothing for a big one. Should be dynamic based on historical volatility.

### Security Shortcuts

**JWT in localStorage** (frontend).
- **Risk**: XSS attack = stolen token. httpOnly cookies are safer.
- **Why I did it**: Way simpler with separate frontend/backend. Would switch to cookies for production.

**No rate limiting** on API endpoints.
- **Risk**: Brute-force login attempts, DoS attacks.
- **Fix**: Install `express-rate-limit` (literally 5 minutes).

**Shopify tokens are plain text** in the database.
- **Risk**: Database breach = attacker owns your Shopify stores.
- **Fix**: Encrypt with AWS KMS or Vault. Just haven't done it yet.

### Multi-Tenancy

**Trust the JWT**: The system assumes the JWT is valid and hasn't been tampered with.
- **Assumption**: JWT_SECRET is strong and never exposed. If leaked, attacker can impersonate any user.
- **Mitigation**: Rotate JWT_SECRET regularly, use short expiration times (current: 7 days).

**Organization Isolation**: Data is filtered by `organizationId` in middleware.
- **Assumption**: Prisma queries are always scoped correctly. A bug in a query (forgetting to filter by org) could leak data across tenants.
- **Testing**: Need automated tests to verify every endpoint respects organization boundaries.

### Performance

**No caching**. Every dashboard load hits Postgres.
- **Impact**: Slow with 10k+ orders. Scales linearly (badly).
- **Fix**: Redis cache (5-min TTL) or use Prisma Accelerate's query caching.

**Potential N+1 queries**. Some endpoints fetch related data in loops.
- **Impact**: Slow for big result sets.
- **Fix**: Use Prisma `include` to eager-load, or DataLoader.

**No pagination**. List endpoints return everything.
- **Impact**: 1000+ stores/users/products = huge payloads.
- **Fix**: Add `?page=1&limit=50` everywhere.

### Deployment

**Prisma Accelerate Required**: The app expects `DATABASE_URL` to be a Prisma Accelerate connection (`prisma://...`).
- **Limitation**: Requires a Prisma Cloud account and adds $25/month cost (after free tier).
- **Alternative**: You can use a direct Postgres URL (`postgresql://...`) by removing the Accelerate setup in `src/config/prisma.js`. You'll lose connection pooling and query caching.

**No Horizontal Scaling**: The backend is stateless, but there's no load balancer config or session management for multi-instance deployments.
- **Impact**: Works fine on a single server, but scaling to 10k+ concurrent users needs more work (load balancer, sticky sessions for WebSockets if added).

### Testing

**Zero automated tests**. No unit, integration, or E2E tests.
- **Risk**: Break something, won't know until it's deployed.
- **Why**: Time. For production, I'd add Jest (backend), Vitest (frontend), Playwright (E2E).

### Data Integrity

**Shopify Product Deletions**: If a product is deleted in Shopify, it's not automatically removed from our database.
- **Impact**: `totalInventory` and product status can become stale. Orders reference deleted products.
- **Fix**: Add a "reconciliation" sync that marks products as `ARCHIVED` if they're missing from Shopify.

**Currency Conversion**: All revenue is stored as-is from Shopify. Multi-currency stores show mixed totals.
- **Impact**: A store selling in USD and EUR will show `$100 + €50 = $150` which is wrong.
- **Fix**: Convert all revenue to a base currency (USD) using exchange rates at time of order.

### User Experience

**No Onboarding Flow**: After signup, users see an empty dashboard. There's no tutorial or "Add your first store" wizard.
- **Impact**: Confusing for new users who don't know they need to call `/stores` API first.
- **Fix**: Add an onboarding modal with step-by-step instructions.

**Error Messages**: Some errors show generic messages like "Failed to fetch" instead of explaining what went wrong.
- **Impact**: Hard to debug issues (e.g., "Is Shopify down? Is my token expired?").
- **Fix**: Improve error handling to show actionable messages ("Your Shopify token expired. Please reconnect your store.").

### When Things Break

Rough estimates based on current architecture:

- **10 orgs, 50 stores, 100k orders**: Fine
- **100 orgs, 500 stores, 1M orders**: Dashboard gets slow (5-10 sec). Add caching.
- **1000 orgs, 5000 stores, 10M orders**: Queries timeout. Need read replicas, partitioning, maybe a time-series DB.

---

## Contributing

If you want to add stuff:
- `main` - Production code (don't push here directly)
- `develop` - Integration branch
- `feature/xyz` - Your feature
- `bugfix/xyz` - Bug fixes

**Commit messages**: Use conventional commits if you want, or just be clear about what you did.

```
feat: add customer pie chart
fix: date picker timezone bug
docs: update README
```

---

## Built With

- Node.js & Express
- Prisma + PostgreSQL
- React + Vite
- Tailwind CSS
- Recharts
- A lot of coffee ☕

---

**Made by**: [Your Name]  
**Version**: 1.0.0  
**Last Updated**: December 2024

Got questions? Open an issue or reach out.
