# Akario Mart - Client

This is the frontend application for Akario Mart, a full-featured e-commerce platform built with React and Vite.

## Features

- Role-based dashboards (User, Admin, Seller)
- Product browsing with filtering and sorting
- Shopping cart functionality
- Wishlist management
- User authentication (Login/Register)
- Product management for sellers
- Admin panel for managing users and products

## Tech Stack

- **React** - Frontend library
- **Vite** - Build tool
- **Tailwind CSS** - Styling framework
- **React Router** - Client-side routing

## Folder Structure

```
client/
├── src/
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React context providers
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page components
│   ├── services/       # API service files
│   ├── utils/          # Utility functions
│   ├── App.jsx         # Main App component
│   └── main.jsx        # Entry point
├── public/             # Static assets
├── index.html          # HTML template
└── vite.config.js      # Vite configuration
```

## Available Scripts

In the project directory, you can run:

### `npm run dev`

Runs the app in development mode.
Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

The page will reload if you make edits.

### `npm run build`

Builds the app for production to the `dist` folder.

### `npm run preview`

Preview the production build locally.

## Development

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. Open your browser to [http://localhost:5173](http://localhost:5173)

## Environment Variables

Create a `.env` file in the client root directory with the following variables:

```
VITE_API_BASE_URL=https://backend-1-tf17.onrender.com/api
```

## Dependencies

- react
- react-dom
- react-router-dom
- tailwindcss
- postcss
- autoprefixer
- vite
- @vitejs/plugin-react

## Learn More

To learn more about the technologies used:

- [React Documentation](https://reactjs.org/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)