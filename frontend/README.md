# Xeno - Shopify Analytics Dashboard (Frontend)

Modern enterprise-grade React.js dashboard UI for the Shopify multi-tenant data ingestion and analytics platform.

## Tech Stack

- **Framework**: React 18.2.0 with Vite 5.0.8
- **Routing**: React Router v6
- **State Management**: Zustand 4.4.7
- **Styling**: Tailwind CSS 3.3.6
- **Charts**: Recharts 2.10.3
- **Icons**: lucide-react
- **HTTP Client**: Axios 1.6.2
- **Date Handling**: date-fns + react-datepicker

## Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Card.jsx
│   │   ├── MetricCard.jsx
│   │   ├── ChartCard.jsx
│   │   ├── Loader.jsx
│   │   ├── ErrorMessage.jsx
│   │   ├── DateRangePicker.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Navbar.jsx
│   │   └── Layout.jsx
│   ├── charts/          # Recharts visualizations
│   │   └── RevenueLineChart.jsx
│   ├── pages/           # Page components
│   │   ├── Login.jsx
│   │   └── Dashboard.jsx
│   ├── services/        # API integration layer
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── metricsService.js
│   │   └── storesService.js
│   ├── stores/          # Zustand state management
│   │   ├── authStore.js
│   │   └── storeContext.js
│   ├── utils/           # Helper functions
│   │   ├── formatCurrency.js
│   │   └── formatDate.js
│   ├── App.jsx          # Router setup
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## Features

### Authentication
- JWT-based authentication with Bearer tokens
- Login page with email/password
- Token persistence in localStorage
- Auto-redirect for protected routes

### Dashboard
- 4 key metrics (Revenue, Orders, Products, Customers)
- Revenue & Orders trend line chart
- Date range picker (Today, Last 7/30/90 days, Custom)
- Quick stats (AOV, Orders per Customer, Revenue per Customer)

### Multi-Store Support
- Store selector dropdown in navbar
- Store-scoped data queries
- Manual sync button for data refresh

### Layout
- Responsive sidebar navigation
- Top navbar with user info
- Scrollable main content area
- Professional color palette (blue primary)

## Setup Instructions

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Backend Connection

The Vite config already has a proxy set up to `http://localhost:5001` for all `/api` requests.

Ensure your backend is running on port 5001.

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at: **http://localhost:3000**

### 4. Build for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

### 5. Preview Production Build

```bash
npm run preview
```

## Usage Flow

### First-Time Setup

1. **Start Backend** (in root directory):
   ```bash
   npm start
   ```
   Backend should be running on http://localhost:5001

2. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will be on http://localhost:3000

3. **Create a User** (via backend API):
   ```bash
   curl -X POST http://localhost:5001/auth/signup \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@example.com",
       "password": "SecurePass123!",
       "fullName": "Admin User",
       "organizationName": "My Company"
     }'
   ```

4. **Login to Dashboard**:
   - Go to http://localhost:3000/login
   - Enter email and password
   - You'll be redirected to the dashboard

5. **Create a Store** (via backend API with auth token):
   ```bash
   curl -X POST http://localhost:5001/stores \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -d '{
       "name": "My Shopify Store",
       "shopifyDomain": "mystore.myshopify.com",
       "accessToken": "shpat_xxxxx"
     }'
   ```

6. **Select Store in UI**:
   - Use the store dropdown in the navbar
   - Dashboard will update with store-specific data

7. **Sync Store Data**:
   - Click the "Sync" button in navbar
   - Or via API: `POST /ingestion/sync/:storeId`

## API Integration

All API calls go through `src/services/api.js` which:
- Adds Authorization header with JWT token
- Handles 401 redirects to login
- Proxies to backend via `/api` prefix

### Available Services

- **authService**: login, signup, logout
- **metricsService**: getSummary, getOrdersByDate, getTopCustomers
- **storesService**: getStores, createStore, syncStore

## State Management

### Auth Store (`authStore.js`)
- Manages user authentication state
- Stores JWT token in localStorage
- Handles login/logout actions

### Store Context (`storeContext.js`)
- Tracks currently selected store
- Persists selection across page navigation

## Styling

### Color Palette
- **Primary**: Blue (600: #2563eb, 700: #1d4ed8)
- **Success**: Green
- **Warning**: Orange
- **Error**: Red
- **Neutral**: Gray scale

### Custom Tailwind Classes
- `text-primary-600`, `bg-primary-600`, etc.
- Responsive breakpoints: sm, md, lg, xl
- Custom scrollbar styling

## Development Tips

### Hot Module Replacement (HMR)
Vite provides instant HMR. Changes to components will reflect immediately.

### Debugging
- Check browser console for errors
- Network tab shows API requests
- Redux DevTools NOT needed (using Zustand)

### Adding New Pages
1. Create page component in `src/pages/`
2. Add route in `src/App.jsx`
3. Add navigation link in `src/components/Sidebar.jsx`

### Adding New Charts
1. Create chart component in `src/charts/`
2. Use Recharts components (BarChart, PieChart, etc.)
3. Match styling from RevenueLineChart.jsx

## Troubleshooting

### "Failed to fetch" errors
- Ensure backend is running on port 5001
- Check Vite proxy config in `vite.config.js`

### White screen / blank page
- Check browser console for errors
- Verify all imports are correct
- Check if token is valid (localStorage)

### Charts not rendering
- Ensure data format matches chart expectations
- Check ResponsiveContainer parent has height
- Verify Recharts is installed

## Next Steps

### Pending Features (To Be Implemented)

1. **Additional Charts**:
   - OrdersBarChart (bar chart for order volume)
   - ProductsPerformanceBarChart (product sales chart)
   - CustomerPieChart (customer segmentation)

2. **Insights Pages**:
   - Orders Insights with detailed metrics
   - Products Insights with performance table
   - Customers Insights with top customers

3. **Tables**:
   - ProductsTable with sorting/filtering
   - CustomersTable with pagination

4. **Stores Page**:
   - List all stores
   - Add new store form
   - Edit/delete stores

5. **Settings Page**:
   - User profile editing
   - Password change
   - Notification preferences

6. **Custom Hooks**:
   - useFetchMetrics for data fetching pattern
   - useDebounce for search inputs

## Current Status

✅ **Complete**:
- Project setup (Vite, Tailwind, dependencies)
- Authentication flow (login, protected routes)
- Dashboard with metrics and chart
- Multi-store support
- Core component library
- API integration layer
- State management (Zustand)

⏳ **In Progress**:
- Additional chart types
- Insights pages
- Data tables

🔜 **Planned**:
- Store management UI
- User settings
- Advanced filtering
- Export functionality

## License

Proprietary - All rights reserved
