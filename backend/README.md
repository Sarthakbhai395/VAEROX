# Akario Mart - Server

This is the backend API for Akario Mart, built with Node.js, Express, and MongoDB.

## Features

- User authentication with JWT
- Role-based access control (User, Seller, Admin)
- Product management
- Shopping cart functionality
- Wishlist management
- File upload for product images
- RESTful API design

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Bcrypt.js** - Password hashing
- **Multer** - File upload handling

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/akariomart
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
FILE_UPLOAD_PATH=./public/uploads
MAX_FILE_UPLOAD=1000000
```

## Available Scripts

### `npm run dev`

Runs the server in development mode with nodemon for auto-reloading.

### `npm start`

Runs the server in production mode.

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current logged in user
- `GET /api/auth/logout` - Logout user

### Users (Admin only)

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get a specific user
- `POST /api/users` - Create a new user
- `PUT /api/users/:id` - Update a user
- `DELETE /api/users/:id` - Delete a user

### Products

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get a specific product
- `POST /api/products` - Create a new product (Seller/Admin)
- `PUT /api/products/:id` - Update a product (Seller/Admin)
- `DELETE /api/products/:id` - Delete a product (Seller/Admin)
- `PUT /api/products/:id/photo` - Upload product photo (Seller/Admin)

## Folder Structure

```
server/
├── config/              # Configuration files
│   └── db.js            # Database connection
├── controllers/         # Request handlers
│   ├── authController.js # Authentication logic
│   ├── productController.js # Product logic
│   └── userController.js # User management logic
├── middleware/          # Custom middleware
│   ├── auth.js          # Authentication middleware
│   ├── async.js         # Async handler
│   └── error.js         # Error handling
├── models/              # Database models
│   ├── User.js          # User model
│   └── Product.js       # Product model
├── routes/              # API routes
│   ├── auth.js          # Authentication routes
│   ├── products.js      # Product routes
│   └── users.js         # User routes
├── utils/               # Utility functions
│   └── errorResponse.js # Custom error class
├── public/              # Static files and uploads
│   └── uploads/         # Uploaded images
├── server.js            # Entry point
├── .env                 # Environment variables
└── package.json         # Dependencies and scripts
```

## Role-Based Access Control

### User Roles

1. **User** - Can browse products, add to cart/wishlist, and place orders
2. **Seller** - All user privileges plus ability to manage their own products
3. **Admin** - Full access to all features including user and product management

### Protected Routes

- User routes require authentication
- Seller routes require 'seller' or 'admin' role
- Admin routes require 'admin' role

## Data Models

### User

```javascript
{
  name: String,
  email: String,
  password: String,
  role: String, // 'user', 'seller', or 'admin'
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: Date
}
```

### Product

```javascript
{
  name: String,
  description: String,
  price: Number,
  discount: Number,
  category: String, // 'technology', 'clothing', or 'home appliances'
  image: String,
  seller: ObjectId, // Reference to User
  createdAt: Date
}
```

## Error Handling

The API uses a consistent error response format:

```json
{
  "success": false,
  "error": "Error message"
}
```

## File Uploads

Product images are uploaded to the `public/uploads` directory and served statically.

## Development

1. Make sure MongoDB is running
2. Start the development server:
   ```bash
   npm run dev
   ```

## Production

1. Set `NODE_ENV=production` in your environment variables
2. Start the production server:
   ```bash
   npm start
   ```

## Learn More

To learn more about the technologies used:

- [Node.js Documentation](https://nodejs.org/)
- [Express Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)