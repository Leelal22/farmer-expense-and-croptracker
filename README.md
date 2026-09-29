# 🚜 FARMER EXPENSE & CROP TRACKER

A production-ready full-stack web application designed to help farmers manage farms, crops, farming expenses, produce sales, harvest yields, activities, inventory, and real-time profitability from a single unified dashboard.

---

## 📌 Problem Statement

Farmers often track agricultural expenses manually using paper notebooks or informal spreadsheets. This makes it difficult to:
- Track crop-wise investment vs return
- Calculate accurate net profit & Return on Investment (ROI)
- Monitor recurring input costs (fertilizer, pesticides, seeds, labour)
- Track inventory of agricultural supplies & stock expiration dates
- Maintain structured historical farm financial records

**Farmer Expense & Crop Tracker** solves this by providing a centralized digital system designed for real-world agricultural operations.

---

## 🚀 Technology Stack

### **Frontend**
- **Framework**: React.js 18 + Vite
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios with JWT Bearer Interceptors
- **Data Visualization**: Recharts (Line, Bar & Pie charts)
- **Icons**: React Icons (FontAwesome)
- **Styling**: Modern Custom CSS design system

### **Backend**
- **Runtime**: Python 3.x
- **Framework**: Flask (REST API Architecture)
- **ORM**: Flask-SQLAlchemy
- **Database Migrations**: Flask-Migrate
- **Authentication**: Flask-JWT-Extended (JSON Web Tokens)
- **Security**: Werkzeug Password Hashing (bcrypt / pbkdf2)
- **CORS**: Flask-CORS

### **Database**
- **Production**: PostgreSQL 15
- **Local Dev / Testing**: SQLite / PostgreSQL compatible

### **DevOps & Containerization**
- **Containerization**: Docker & Docker Compose
- **Web Server**: Gunicorn (Backend) & Nginx (Frontend)
- **Testing**: Pytest

---

## 🏛 System Architecture

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

## 📂 Folder Structure

```
farmer-expense-crop-tracker/
│
├── frontend/                  # React Vite Frontend Application
│   ├── src/
│   │   ├── components/        # Reusable UI components (Navbar, Sidebar, Cards, Tables, Modals)
│   │   ├── context/           # React Context (AuthContext)
│   │   ├── pages/             # Page Views (Dashboard, Farms, Crops, Expenses, Income, Reports, etc.)
│   │   ├── services/          # Axios API clients
│   │   ├── styles/            # CSS styling
│   │   ├── App.jsx            # Application Router & Routing configuration
│   │   └── main.jsx           # React Entrypoint
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
│
├── backend/                   # Python Flask REST API Backend
│   ├── app/
│   │   ├── models/            # SQLAlchemy Models (User, Farm, Crop, Expense, Income, Harvest, Activity, Inventory)
│   │   ├── routes/            # REST API Blueprints
│   │   ├── services/          # Profitability, Dashboard & Report services
│   │   ├── utils/             # Validation & Security Decorators
│   │   ├── config.py          # Environment Configurations
│   │   ├── extensions.py      # Flask extensions
│   │   └── __init__.py        # App Factory
│   ├── tests/                 # Pytest Automated Test Suite
│   ├── requirements.txt
│   ├── run.py                 # Flask server runner
│   └── Dockerfile
│
├── database/
│   └── seed.py                # Database Seed script with realistic demo data
│
├── docs/                      # Architecture, API & Database documentation
├── docker-compose.yml         # Multi-container Docker configuration
├── .env.example
└── README.md
```

---

## 🗄 Database Schema & Relationships

- **USER (1) ──< (N) FARM**
- **FARM (1) ──< (N) CROP**
- **CROP (1) ──< (N) EXPENSE**
- **CROP (1) ──< (N) INCOME**
- **CROP (1) ──< (N) HARVEST**
- **CROP (1) ──< (N) ACTIVITY**
- **FARM (1) ──< (N) INVENTORY**

---

## 🔑 Key Financial Formulas

$$\text{Total Expense} = \sum \text{Expenses for Crop}$$

$$\text{Total Income} = \sum \text{Incomes for Crop}$$

$$\text{Net Profit} = \text{Total Income} - \text{Total Expense}$$

$$\text{ROI (\%)} = \left( \frac{\text{Total Income} - \text{Total Expense}}{\text{Total Expense}} \right) \times 100$$

*(Handled safely when Total Expense is 0)*

---

## 🛠 Local Setup Instructions (Without Docker)

### 1. Prerequisites
- Python 3.10+
- Node.js v18+ & npm

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database seed script
python ../database/seed.py

# Run Flask backend server (port 5000)
python run.py
```

### 3. Frontend Setup
```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install node dependencies
npm install

# Run Vite dev server (port 5173)
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 🔑 Demo Login Credentials

```text
Email:    demo@farmertrack.com
Password: Demo@123
```

---

## 🐳 Docker Setup (Production Mode)

To launch the complete application stack (PostgreSQL + Flask + React Nginx) in Docker:

```bash
# Build and launch all containers
docker compose up --build
```

Access application:
- **Frontend App**: `http://localhost`
- **Backend REST API**: `http://localhost:5000/api`
- **PostgreSQL**: `localhost:5432`

---

## 🧪 Running Automated Tests

```bash
# Run backend pytest suite
cd backend
python -m pytest tests/
```

---

## 📝 API Endpoints Summary

### **Auth**
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PUT /api/auth/profile`

### **Farms & Crops**
- `GET /api/farms` | `POST /api/farms` | `GET/PUT/DELETE /api/farms/<id>`
- `GET /api/crops` | `POST /api/crops` | `GET/PUT/DELETE /api/crops/<id>`
- `GET /api/crops/<id>/profitability`

### **Expenses & Income**
- `GET /api/expenses` | `POST /api/expenses` | `PUT/DELETE /api/expenses/<id>`
- `GET /api/incomes` | `POST /api/incomes` | `PUT/DELETE /api/incomes/<id>`

### **Harvests, Activities & Inventory**
- `GET /api/harvests` | `POST /api/harvests` | `PUT/DELETE /api/harvests/<id>`
- `GET /api/activities` | `POST /api/activities` | `PUT/DELETE /api/activities/<id>`
- `GET /api/inventory` | `POST /api/inventory` | `PUT/DELETE /api/inventory/<id>`

### **Dashboard & Reports**
- `GET /api/dashboard/summary`
- `GET /api/dashboard/monthly-financials`
- `GET /api/dashboard/crop-performance`
- `GET /api/dashboard/expense-categories`
- `GET /api/reports/crop-profitability` (Supports `?format=csv`)
- `GET /api/reports/expenses` (Supports `?format=csv`)
- `GET /api/reports/income` (Supports `?format=csv`)

---

## 📜 License
MIT License. Built for agricultural productivity and portfolio showcase.
