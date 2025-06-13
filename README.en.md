# Digital Flower Shop - Web System
A complete web system for managing a flower shop, developed with Node.js/Express (backend) and Vue.js 3 (frontend).

## 🚀 Features
* **Personnel Management**: Add, edit, and soft-delete employees.
* **Customer Management**: Full CRUD operations for customers.
* **Order Management**: Complete control of orders with delivery and payment statuses.
* **Flower Arrangement Catalog**: Product management by categories.
* **Reporting System**: Multiple reports with Excel export functionality.
* **Authentication**: Login system using Firebase.
* **Dockerization**: Fully containerized application.

## 📋 Prerequisites
* Node.js 18+ and npm
* Docker and Docker Compose
* A Firebase account (for authentication)
* Git

## 🛠️ Technologies Used
**Backend (api_tienda)**
* Node.js
* Express
* TypeScript
* MySQL
* Zod (validations)
* ExcelJS (exporting)
* JWT + Firebase Auth

**Frontend (cliente_tienda)**
* Vue.js 3
* Vite
* TypeScript
* Vue Router
* Pinia
* Axios
* Firebase Auth
* TailwindCSS
* XLSX (Excel export)

## 📦 Installation
1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd floreria-digital
    ```
2.  **Configure environment variables**

    **Backend (`api_tienda/.env`)**
    ```env
    PORT=3000
    DB_HOST=mysql_db
    DB_USER=floreria_user
    DB_PASSWORD=floreria_password
    DB_NAME=floreria_db
    JWT_SECRET=your-secret-key-here
    ```
    **Frontend (`cliente_tienda/.env`)**
    ```env
    VITE_API_URL=http://localhost:3000
    VITE_FIREBASE_API_KEY=your-api-key
    VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
    VITE_FIREBASE_PROJECT_ID=your-project-id
    VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
    VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
    VITE_FIREBASE_APP_ID=your-app-id
    ```
3.  **Installation with Docker Compose (Recommended)**
    ```bash
    # From the project root
    docker-compose up -d
    ```
    This will start:
    * MySQL on port `3306`
    * Backend API on `http://localhost:3000`
    * Frontend on `http://localhost:80`

4.  **Manual Installation (Development)**

    **Backend**
    ```bash
    cd api_tienda
    npm install
    npm run dev
    ```
    **Frontend**
    ```bash
    cd cliente_tienda
    npm install
    npm run dev
    ```
    **Database**
    ```bash
    # Execute the init.sql script in MySQL
    mysql -u root -p < init.sql
    ```

## 📊 Database Structure
**Main Tables**:
* `personal`: Flower shop employees.
* `clientes`: Customer records.
* `arreglos_florales`: Product catalog.
* `pedidos`: Orders and deliveries.

## 🐳 Docker Commands
```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild images
docker-compose build

# Access MySQL
docker exec -it floreria_mysql mysql -u root -p
```

## 🧪 Development
**Available Scripts**

**Backend**
```bash
npm run dev      # Development with nodemon
npm run build    # Compile TypeScript
npm start        # Production
```
**Frontend**
```bash
npm run dev      # Development
npm run build    # Compile for production
npm run preview  # Preview production build
```

## 📄 License
This project is part of the Web Programming course at the Instituto Tecnológico de Culiacán.

## 👥 Team
* **Developed by**: `Juan Antonio Velazquez Alarcon`
* **Professor**: M.C. Martín Leonardo Nevarez Rivas
* **Subject**: Web Programming
* **Deadline**: June 3, 2025
