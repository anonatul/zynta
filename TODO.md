# Zynta - E-Commerce Platform TODO

## Project Setup
- [x] Initialize git repository with remote origin
- [x] Create backup branch
- [x] Create .gitignore file

## Backend (Node.js/Express + MongoDB)
- [ ] Initialize Node.js project with package.json
- [ ] Set up Express server with basic config
- [ ] Connect to MongoDB

## API Endpoints

### Authentication
- [ ] POST /api/auth/register - User registration
- [ ] POST /api/auth/login - User login (JWT)
- [ ] GET /api/auth/profile - Get current user

### Products
- [ ] GET /api/products - List all products
- [ ] GET /api/products/:id - Get product details
- [ ] POST /api/products - Create product (admin)
- [ ] PUT /api/products/:id - Update product (admin)
- [ ] DELETE /api/products/:id - Delete product (admin)

### Categories
- [ ] GET /api/categories - List categories
- [ ] POST /api/categories - Create category (admin)

### Cart
- [ ] GET /api/cart - Get user's cart
- [ ] POST /api/cart - Add item to cart
- [ ] PUT /api/cart - Update cart item quantity
- [ ] DELETE /api/cart/:itemId - Remove item from cart
- [ ] DELETE /api/cart - Clear cart

### Orders
- [ ] POST /api/orders - Create order
- [ ] GET /api/orders - Get user's orders
- [ ] GET /api/orders/:id - Get order details

### Reviews
- [ ] POST /api/products/:id/reviews - Add review
- [ ] GET /api/products/:id/reviews - Get product reviews

## Frontend (React - Placeholder)
- [ ] Set up React project structure (dummy/placeholder)