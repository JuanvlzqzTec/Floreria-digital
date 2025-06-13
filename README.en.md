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

## 🔐 Firebase Configuration
1.  Go to the **Firebase Console**.
2.  Create a new project.
3.  Enable **Authentication > Sign-in method > Email/Password**.
4.  Get your project's credentials from the Project settings.
5.  Add the credentials to the frontend's `.env` file.

## 📱 System Usage
**Initial Access**
* **URL**: `http://localhost` (Docker) or `http://localhost:5173` (development)
* **Test Email**: `admin@floreria.com`
* **Password**: `Admin123!`

**Available Modules**
* **Dashboard**: Overview with statistics.
* **Personnel**: Employee management.
* **Customers**: Customer administration.
* **Orders**: Order and delivery tracking.
* **Flower Arrangements**: Product catalog.
* **Reports**: Generate and export reports.

## 📊 Database Structure
**Main Tables**:
* `personal`: Flower shop employees.
* `clientes`: Customer records.
* `arreglos_florales`: Product catalog.
* `pedidos`: Orders and deliveries.

**Relationships**:
* An order belongs to one customer.
* An order contains one flower arrangement.
* An order can have an assigned staff member.

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

## 📝 API Endpoints
**Personnel**
* `GET /api/personal` - List all staff
* `GET /api/personal/:id` - Get staff by ID
* `POST /api/personal` - Create staff
* `PUT /api/personal/:id` - Update staff
* `DELETE /api/personal/:id` - Deactivate staff

**Customers**
* `GET /api/clientes` - List customers
* `GET /api/clientes/:id` - Get customer
* `POST /api/clientes` - Create customer
* `PUT /api/clientes/:id` - Update customer
* `DELETE /api/clientes/:id` - Delete customer

**Orders**
* `GET /api/pedidos` - List orders (with filters)
* `GET /api/pedidos/:folio` - Get order
* `POST /api/pedidos` - Create order
* `PUT /api/pedidos/:folio` - Update order

**Flower Arrangements**
* `GET /api/arreglos` - List arrangements
* `GET /api/arreglos/:id` - Get arrangement
* `POST /api/arreglos` - Create arrangement
* `PUT /api/arreglos/:id` - Update arrangement
* `DELETE /api/arreglos/:id` - Deactivate arrangement

**Reports**
* `GET /api/reportes/clientes` - Customer report
* `GET /api/reportes/personal` - Personnel report
* `GET /api/reportes/pedidos` - Orders report
* `GET /api/reportes/arreglos` - Arrangements report

## 🎨 Customization
**Styles**
* Main styles are located in: `cliente_tienda/src/style.css` - Global styles
* Vue components use `<style scoped>`.

**Main Colors**
* **Primary**: `#3b82f6` (blue)
* **Success**: `#10b981` (green)
* **Danger**: `#ef4444` (red)
* **Warning**: `#f59e0b` (orange)

## 🚀 Deployment
**With Docker**
1.  Configure production environment variables.
2.  Run `docker-compose -f docker-compose.prod.yml up -d`.

**Manual**
1.  **Backend**: Compile and run with a process manager like PM2.
2.  **Frontend**: Compile and serve the static files with a web server like Nginx.
3.  **Database**: Set up MySQL in your production environment.

## 📄 License
This project is part of the Web Programming course at the Instituto Tecnológico de Culiacán.

## 👥 Team
* **Developed by**: `Juan Antonio Velazquez Alarcon`
* **Professor**: M.C. Martín Leonardo Nevarez Rivas
* **Subject**: Web Programming
* **Deadline**: June 3, 2025
