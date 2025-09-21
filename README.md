# NestJS E‑Commerce Inventory API

A robust RESTful API for e-commerce inventory management built with NestJS, TypeScript, and PostgreSQL, following Domain-Driven Design (DDD) architecture patterns.

- Live URL: https://nestjs-ecommerce-inventory-api.onrender.com/api/docs

## Prerequisites

- Node.js >= 18.x
- npm >= 9.x
- Supabase Account (PostgreSQL & File Storage)

## Quick Start

- Clone the repo:

`https://github.com/tozakia/nestjs_ecommerce_inventory_api.git`

- Go inside the folder:

`cd nestjs_ecommerce_inventory_api`

- Install necessary libraries:

`npm i`

- Rename the file `.env.sample` to `.env`

- Update the values of the variables inside the `.env` file.

- Run Project:

`npm start`

- Use the following command to run the project as a dev-server:

`npm run start:dev`

📚 API Documentation

- Once the application is running, you can access: `http://localhost:8080/api/docs`

📖 API Endpoints

- Authentication
  - POST /api/auth/register # User registration
  - POST /api/auth/login # User login
  - POST /api/auth/refresh # Refresh access token
  - POST /api/auth/logout # Logout user
- Products
  - POST /api/products # Create product (with image upload)
  - GET /api/products # Get products with filters
  - GET /api/products/search # Search products
  - GET /api/products/:id # Get product by ID
  - PATCH /api/products/:id # Update product
  - DELETE /api/products/:id # Delete product
- Categories
  - POST /api/categories # Create category
  - GET /api/categories # Get all categories
  - GET /api/categories/:id # Get category by ID
  - PATCH /api/categories/:id # Update category
  - DELETE /api/categories/:id # Delete category

📝 Environment Variables Reference
Grab the env values from `.env.ref` to access the Supabase Postgres database and Storage.
