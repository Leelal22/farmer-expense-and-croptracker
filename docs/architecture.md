# Farmer Expense & Crop Tracker - Architecture & System Design

## 1. Overall System Architecture

The **Farmer Expense & Crop Tracker** is a production-ready, full-stack micro-monolith web application built with a decoupled React frontend, a RESTful Python Flask API backend, and a PostgreSQL relational database.

```
                    ┌──────────────────────────┐
                    │     React Frontend       │
                    │   Vite + React Router    │
                    │   Axios + Recharts       │
                    └────────────┬─────────────┘
                                 │
                           REST API / JSON
                           (Bearer JWT)
                                 │
                    ┌────────────▼─────────────┐
                    │       Flask API          │
                    │  Flask-RESTful / CORS    │
                    │   Flask-JWT-Extended     │
                    └────────────┬─────────────┘
                                 │
                           SQLAlchemy ORM
                                 │
                    ┌────────────▼─────────────┐
                    │    PostgreSQL Database   │
                    │   (Relational Schema)    │
                    └──────────────────────────┘
```

---

## 2. Directory Structure

```
farmer-expense-crop-tracker/
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components (Navbar, Sidebar, Cards, Tables, Modals)
│   │   ├── pages/            # Page Views (Dashboard, Farms, Crops, Expenses, Income, Reports, etc.)
│   │   ├── services/         # Axios API client services
│   │   ├── context/          # React Context (AuthContext)
│   │   ├── styles/           # Custom CSS styling & Design tokens
│   │   ├── App.jsx           # Application Router & Routing configuration
│   │   └── main.jsx          # React entry point
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
│
├── backend/
│   ├── app/
│   │   ├── models/           # SQLAlchemy Data Models
│   │   ├── routes/           # REST API Blueprint Routes
│   │   ├── services/         # Core Business Logic & Analytics Services
│   │   ├── utils/            # Validators, Response Helpers & Decorators
│   │   ├── config.py         # Flask Configuration (Env based)
│   │   ├── extensions.py     # Database, JWT, CORS Extensions
│   │   └── __init__.py       # Application Factory
│   ├── tests/                # Automated Backend Test Suite (Pytest)
│   ├── requirements.txt      # Python dependencies
│   ├── run.py                # Server execution entry point
│   └── Dockerfile
│
├── database/
│   └── seed.py               # Seed script with realistic demo data
│
├── docs/                     # Architecture, Database, and API docs
├── docker-compose.yml        # Docker Multi-container Orchestration
├── .env.example
└── README.md
```

---

## 3. Database Entity-Relationship (ER) Architecture

```
 USER (1) ────< (N) FARM (1) ────< (N) CROP (1) ────< (N) EXPENSE
                    │                   │
                    └─< (N) INVENTORY   ├────< (N) INCOME
                                        ├────< (N) HARVEST
                                        └────< (N) ACTIVITY
```

### Key Security & Integrity Design:
- **Foreign Keys with `ON DELETE CASCADE`**: Deleting a farm cleans up associated crops and inventory. Deleting a crop cleans up expenses, incomes, harvests, and activities.
- **Data Isolation / IDOR Protection**: Every request validates that the target entity belongs to a farm/crop owned by the current authenticated `user_id`.

---

## 4. Financial & Analytics Engine Logic

- **Total Expense**: $\sum \text{Expenses for Crop}$
- **Total Income**: $\sum \text{Incomes for Crop}$
- **Net Profit**: $\text{Total Income} - \text{Total Expense}$
- **ROI (%)**: $\left(\frac{\text{Total Income} - \text{Total Expense}}{\text{Total Expense}}\right) \times 100$ (Safe handling for zero expense cases)
