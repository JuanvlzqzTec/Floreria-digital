# Florería Digital — Flower Shop Management System

A fullstack web application for managing a flower shop, built as a final project for the Web Programming course at Instituto Tecnológico de Culiacán.

> **Stack:** Vue.js 3 · Node.js · Express · TypeScript · MySQL · Firebase · Docker

[![GitHub](https://img.shields.io/badge/GitHub-JuanvlzqzTec-181717?style=flat&logo=github)](https://github.com/JuanvlzqzTec)
[![Demo](https://img.shields.io/badge/Demo-Live-success?style=flat)](https://tu-url.railway.app)

---

## Problem it solves

A flower shop needs to manage employees, customers, orders, and its floral arrangement catalog from a single place. This system centralizes all those operations into a modern web interface, with Excel-exportable reports and access control via authentication.

---

## Architecture

The system is split into two independent modules, orchestrated with Docker Compose:

```
floreria-digital/
├── api_tienda/       # Backend — REST API
├── cliente_tienda/   # Frontend — SPA
├── init.sql          # Schema and seed data
└── docker-compose.yml
```

### Backend — `api_tienda`
REST API built with **Node.js + Express + TypeScript**, organized in layers:

```
src/
├── routes/       # Endpoint definitions
├── controllers/  # Request and response handling
├── models/       # Data access layer (MySQL)
├── middlewares/  # Validation, error handling
├── validations/  # Zod schemas
├── config/       # Database, CORS
└── utils/        # Order number generator
```

**Technical decisions:**
- **Zod** for validation on both backend and frontend — shared schemas ensure consistency across layers
- **mysql2** with connection pooling for better performance
- **express-async-errors** for clean async error handling without try/catch on every route
- **ExcelJS** for server-side report generation

### Frontend — `cliente_tienda`
SPA built with **Vue.js 3 + Vite + TypeScript**, with an architecture based on:

```
src/
├── views/        # Main pages (Staff, Customers, Orders, etc.)
├── components/   # Reusable components (Layout, Modals)
├── stores/       # Global state with Pinia (authentication)
├── services/     # HTTP client with Axios
├── router/       # Navigation with auth guards
├── config/       # Firebase configuration
└── types/        # Shared TypeScript interfaces
```

**Technical decisions:**
- **Pinia** as state store — simpler and better TypeScript support than Vuex
- **Firebase Authentication** for session management without building auth from scratch
- **Axios interceptors** to automatically attach the Firebase token to every request
- Navigation guards with **explicit Firebase state waiting** to avoid race conditions on initial load

---

## Features

### CRUD Modules
| Module | Operations |
|--------|------------|
| Staff | Create, edit, soft-delete, view assigned orders |
| Customers | Create, edit, delete |
| Floral Arrangements | Create, edit, soft-delete, filter by type and status |
| Orders | Register, edit, filter by delivery and payment status |

### Reports with Excel export
- Customer list report
- Staff report by status
- Orders by date range
- Orders by delivery status
- Orders by payment status (with total sum)
- Orders by assigned staff member
- Floral arrangements catalog by type

### Authentication
- Login and registration with Firebase Authentication
- Protected routes — redirects to login if no active session

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Vue.js 3 + Vite | SPA framework with optimized build |
| Frontend | TypeScript | Static typing across the application |
| Frontend | Pinia | Global state management |
| Frontend | Axios | HTTP client with interceptors |
| Frontend | Zod | Form validation |
| Frontend | Firebase Auth | User authentication |
| Frontend | XLSX + FileSaver | Client-side Excel export |
| Backend | Node.js + Express | REST API server |
| Backend | TypeScript | Static typing |
| Backend | Zod | Request validation |
| Backend | mysql2 | Database connection with pooling |
| Backend | ExcelJS | Excel report generation |
| Database | MySQL 8 | Data persistence |
| Infrastructure | Docker + Docker Compose | Containerization of all services |
| Infrastructure | Nginx | Frontend server in production |

---

## Data Model

```
personal (staff)      clientes (customers)
────────────────      ────────────────────
id (PK)               id_cliente (PK)
nombre_completo       nombre_completo
direccion             direccion
telefono              telefono
estatus (1|2)

arreglos_florales         pedidos (orders)
─────────────────         ───────────────
id_arreglo (PK)           folio (PK)
descripcion               id_cliente (FK)
tipo_arreglo (1-4)        id_arreglo (FK)
estatus (1|2)             id_personal (FK)
                          descripcion
                          fecha_pedido
                          fecha_entrega
                          direccion_entrega
                          precio_sugerido
                          entregado (1|2)
                          pagado (1|2)
```

---

## Installation & Running

### Prerequisites
- Docker Desktop

### Start the full system

```bash
git clone <repository-url>
cd floreria-digital
docker-compose up -d
```

Available services:
- Frontend: `http://localhost`
- API: `http://localhost:3000`
- MySQL: port `3308`

### System access

A demo user is available to explore the system:

| Field | Value |
|-------|-------|
| Email | admin@floreria.com |
| Password | Admin1234 |

> You can also create your own account using the registration form on the login screen.

---

## Author

**Juan Antonio Velázquez Alarcón**  
Computer Systems Engineering  
Instituto Tecnológico de Culiacán  

[![GitHub](https://img.shields.io/badge/GitHub-JuanvlzqzTec-181717?style=flat&logo=github)](https://github.com/JuanvlzqzTec)
[![Demo](https://img.shields.io/badge/Demo-Live-success?style=flat)](https://tu-url.railway.app)