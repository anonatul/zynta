# Zynta - E-Commerce Platform TODO

## Project Setup
- [x] Initialize git repository with remote origin
- [x] Create backup branch
- [x] Create .gitignore file

## Backend (Node.js/Express + MongoDB)
- [x] Initialize Node.js project with package.json
- [x] Set up Express server with basic config
- [x] Connect to MongoDB

## API Endpoints

### Authentication
- [x] POST /api/auth/register - User registration
- [x] POST /api/auth/login - User login (JWT)
- [x] GET /api/auth/profile - Get current user

### Products
- [x] GET /api/products - List all products
- [x] GET /api/products/:id - Get product details
- [x] POST /api/products - Create product (admin)
- [x] PUT /api/products/:id - Update product (admin)
- [x] DELETE /api/products/:id - Delete product (admin)

### Categories
- [x] GET /api/categories - List categories
- [x] POST /api/categories - Create category (admin)

### Cart
- [x] GET /api/cart - Get user's cart
- [x] POST /api/cart - Add item to cart
- [x] PUT /api/cart - Update cart item quantity
- [x] DELETE /api/cart/:itemId - Remove item from cart
- [x] DELETE /api/cart - Clear cart

### Orders
- [x] POST /api/orders - Create order
- [x] GET /api/orders - Get user's orders
- [x] GET /api/orders/:id - Get order details
- [x] POST /api/orders/verify - Verify payment

### Reviews
- [x] POST /api/products/:id/reviews - Add review
- [x] GET /api/products/:id/reviews - Get product reviews

### Addresses
- [x] GET /api/addresses - Get user addresses
- [x] POST /api/addresses - Add address
- [x] PUT /api/addresses/:id - Update address
- [x] DELETE /api/addresses/:id - Delete address

## Frontend (React - Placeholder)
- [ ] Set up React project structure (dummy/placeholder)