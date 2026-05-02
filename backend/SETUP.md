# Zynta Backend Setup

## Prerequisites
- Node.js installed
- PostgreSQL database

## Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Update .env with your database URL:
```
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.ewvqxnfpgldrsouqcmko.supabase.co:5432/postgres?sslmode=require
JWT_SECRET=your_jwt_secret
```

3. Create database schema:
```bash
psql $DATABASE_URL -f src/database/schema.sql
```

4. Start server:
```bash
npm run dev
```

## Roles
- **admin**: Manage sellers, categories
- **seller**: Manage products (requires admin approval)
- **customer**: Browse, cart, checkout, orders

## API Endpoints
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/profile
- GET /api/products
- GET /api/categories
- GET/POST/PUT/DELETE /api/cart
- GET/POST /api/orders
- GET/POST/PUT/DELETE /api/addresses
- GET /api/admin/sellers (admin)
- PUT /api/admin/sellers/:id/approve|reject (admin)
- GET/POST/PUT/DELETE /api/seller/products (seller)