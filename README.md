# IDURAR ERP-CRM Lite (MERN Stack)

A clean, modern, lightweight recreation of [IDURAR ERP-CRM](https://github.com/idurar/idurar-erp-crm) built on the **MERN** stack (MongoDB, Express.js, React 18, Node.js) with **Ant Design 5**.

---

## 🌟 Key Features

- **Authentication & Security**:
  - Admin login with `bcrypt` password encryption and JWT session tokens.
  - Protected API routes and client-side route guards.
- **Customer Relationship Management (CRM)**:
  - Client / Customer directory with search and filtering by status (`Active`, `Lead`, `Inactive`).
  - Add, edit, view, and delete client profiles.
- **Product & Service Catalog (ERP Prerequisite)**:
  - Billable items and services with standard unit pricing, categories, and tax rates.
- **Invoicing & Receivables (ERP Core)**:
  - Interactive invoice generator linked to CRM clients.
  - Dynamic line items with auto-calculated subtotals, configurable tax percentages, and grand totals.
  - Lifecycle status management (`Paid`, `Pending`, `Draft`, `Overdue`).
  - Print & PDF-ready clean invoice view.
- **Executive Dashboard**:
  - High-level KPIs: Total Revenue, Pending Receivables, Active Clients, and Total Invoices.
  - Recent invoices and client activity feed.
- **Zero-Config Database**:
  - Ready for external MongoDB or MongoDB Atlas via `MONGO_URI`.
  - Automatic fallback to embedded `mongodb-memory-server` in development mode for zero-setup execution.

---

## 🏗️ Architecture

```
crm-javin/
├── backend/
│   ├── src/
│   │   ├── config/db.js          # MongoDB connection + fallback
│   │   ├── controllers/          # Business logic (Auth, Client, Product, Invoice, Dashboard)
│   │   ├── middlewares/          # JWT auth & centralized error handling
│   │   ├── models/               # Mongoose schemas (Admin, Client, Product, Invoice)
│   │   ├── routes/               # Express REST API routes
│   │   ├── seed/seedData.js      # Initial demo data seeder
│   │   └── server.js             # Express application entry
│   ├── tests/apiSmokeTest.js     # Automated verification smoke test
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/client.js         # Axios HTTP client with JWT interceptor
│   │   ├── components/           # AppLayout, StatusTag
│   │   ├── context/AuthContext.jsx
│   │   ├── pages/                # Login, Dashboard, Clients, Products, Invoices
│   │   ├── App.jsx               # React Router v6 route configuration
│   │   └── main.jsx              # Ant Design ConfigProvider & React root
│   ├── vite.config.js            # Vite build configuration with API proxy
│   └── package.json
│
├── package.json                  # Root orchestration (concurrently)
└── README.md
```

---

## 🚀 Quick Start

### 1. Install Dependencies
Run the following from the project root:
```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

### 2. Start Development Servers
Run both backend (`http://localhost:5000`) and frontend (`http://localhost:5173`) concurrently:
```bash
npm run dev
```

### 3. Log In with Default Admin Credentials
- **URL**: `http://localhost:5173/login`
- **Email**: `admin@idurar.com`
- **Password**: `admin123`
*(Or click the "⚡ Auto-fill Demo Credentials" button on the login screen)*

---

## 🧪 Testing

To run the automated backend smoke test:
```bash
npm run test:backend
```
To test frontend build:
```bash
npm run build --prefix frontend
```
