# Mini E-Commerce API

A backend system designed to simulate a basic online shopping platform. This project focuses on authentication, role-based access control, product management, cart operations, and order processing while ensuring proper business logic and data consistency.

## Live API Deployment

> [Link to Live API Deployment Placeholder]

## Tech Stack

- **Framework:** [NestJS](https://nestjs.com/) (Node.js)
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** TypeORM
- **Authentication:** Passport & JWT (JSON Web Tokens)
- **Validation:** class-validator
- **Package Manager:** pnpm

## API Documentation

Comprehensive interactive API documentation is available via Swagger/OpenAPI:

- **Swagger UI:** http://localhost:5000/api/docs (when running locally)

## Setup Instructions

### Prerequisites

- Node.js (v16+)
- PostgreSQL
- pnpm

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd mini-ecommerce-api
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Environment Configuration:
   Create a `.env` file in the root directory with your database credentials and JWT secret.

   ```env
   NODE_ENV=development
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=yourpassword
   DB_NAME=mini_ecommerce
   JWT_SECRET=yoursecretkey
   JWT_EXPIRES_IN=7d
   STRIPE_SECRET_KEY=sk_test_your_key
   STRIPE_WEBHOOK_SECRET=whsec_your_secret
   ```

   **Note:** Never commit your `.env` file to Git (it's in `.gitignore`).

4. Run the application:

   ```bash
   # development mode
   pnpm run start:dev

   # production mode
   pnpm run build
   pnpm start
   ```

## Deployment to Render

This API is configured for easy deployment on [Render](https://render.com).

### Quick Deploy

1. **Push your code** to a GitHub repository

2. **Connect to Render:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" and select "Web Service"
   - Connect your GitHub repository

3. **Configure the service:**
   - **Build Command:** `pnpm install && pnpm run build`
   - **Start Command:** `pnpm start`
   - **Environment:** Node
   - Render will auto-detect `pnpm-lock.yaml` and use pnpm

4. **Set Environment Variables** in Render dashboard:

   **Option A: Use individual connection parameters**

   ```
   NODE_ENV=production
   PORT=10000
   DB_HOST=aws-1-[region].pooler.supabase.com
   DB_PORT=5432
   DB_USERNAME=postgres.[project-ref]
   DB_PASSWORD=<your-db-password>
   DB_NAME=postgres
   JWT_SECRET=<generate-a-secure-random-string>

   STRIPE_SECRET_KEY=<your-stripe-secret-key>
   STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>
   ```

   **Option B: Use Supabase connection URI** (simpler)

   ```
   NODE_ENV=production
   PORT=10000
   DB_URI=postgresql://postgres.[project-ref]:[PASSWORD]@aws-1-[region].pooler.supabase.com:5432/postgres
   JWT_SECRET=<generate-a-secure-random-string>
   STRIPE_SECRET_KEY=<your-stripe-secret-key>
   STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>
   ```

5. **Create a PostgreSQL database:**
   - **Option A: Supabase** (recommended)
     - Use Session Pooler credentials for IPv4 compatibility
   - **Option B: Render PostgreSQL**
     - Go to "New +" and select "PostgreSQL"
     - Copy the internal database URL and use it for the DB environment variables

6. **Deploy!** Render will automatically build and deploy your application

### Using render.yaml (Blueprint)

Alternatively, you can use the included `render.yaml` file for Infrastructure as Code:

1. In your Render dashboard, click "New +" → "Blueprint"
2. Connect your repository
3. Render will automatically detect the `render.yaml` file
4. Review and apply the configuration
5. Set any sync: false environment variables manually

### Post-Deployment

- Your API will be available at: `https://your-service-name.onrender.com`
- Swagger documentation: `https://your-service-name.onrender.com/api/docs`
- Health check: `https://your-service-name.onrender.com/api`

## Database Schema

The database schema is designed to ensure data integrity and support transaction-based operations.

```mermaid
erDiagram
    User ||--o{ Order : places
    User ||--o| Cart : has
    Product ||--o{ CartItem : is_in
    Cart ||--o{ CartItem : contains
    Order ||--o{ OrderItem : contains
    Product ||--o{ OrderItem : is_in

    User {
        int id PK
        string email
        string password_hash
        enum role
        datetime created_at
    }

    Product {
        int id PK
        string name
        string description
        decimal price
        int stock
        enum status
        int version
        datetime updated_at
    }

    Cart {
        int id PK
        int user_id FK
        datetime updated_at
    }

    CartItem {
        int id PK
        int cart_id FK
        int product_id FK
        int quantity
    }

    Order {
        int id PK
        int user_id FK
        decimal total_amount
        string payment_intent_id
        string client_secret
        enum status
        datetime created_at
    }

    OrderItem {
        int id PK
        int order_id FK
        int product_id FK
        int quantity
        decimal price_at_purchase
    }
```

## Key Architectural Decisions

1.  **Atomic Transactions for Orders**:
    - To prevent overselling (race conditions), order placement wraps inventory deduction and order creation in a single database transaction.
    - Used Pessimistic Locking (or safe atomic updates) to ensure stock doesn't drop below zero.

2.  **Snapshotting Pricing**:
    - Prices in `OrderItems` are snapshots of the product price at the time of purchase. This ensures that future changes to product prices do not affect historical order data.

3.  **Persistent Cart**:
    - The Cart is modeled as a persistent database entity linked 1-to-1 with the `User`. This allows the cart state to persist across sessions and devices/browsers.

4.  **Calculated Totals**:
    - All financial calculations (e.g., Order Total) are performed strictly on the backend using the database's product information, ignoring any prices sent from the client to prevent manipulation.

5.  **Role-Based Access Control (RBAC)**:
    - Custom Guards and Decorators (`@Roles`, `@CurrentUser`) separate concerns between Admin (Product Management) and Customer (Shopping) features.

## Assumptions Made

- **Currency**: All prices are assumed to be in a single currency (e.g., USD) for simplicity.
- **Payment Flow**: Actual payment gateway integration is out of scope. The "Place Order" action assumes payment is successful or handles it as a distinct "Pending" state.
- **Inventory**: Stock is deducted immediately upon order placement ("Inventory Locking").
- **Single Cart**: A user has only one active cart. Adding an item to the cart checks if a cart exists; if not, it creates one.
- **Soft Deletes**: Products are soft-deleted (`status = 'deleted'`) rather than removed from the database to preserve referential integrity for historical orders.
