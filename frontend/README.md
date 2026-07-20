# Restaurant QR Menu - React Frontend

This is the React frontend for the Restaurant QR Menu system, migrated from vanilla HTML/CSS/JS to React with Vite.

## Project Structure

- **Backend**: Node.js + Express (located in `../app/`)
- **Frontend**: React + Vite (this directory)

## Development

### Prerequisites

- Node.js 22.5 or higher
- Backend server running on port 3000

### Setup

1. Install dependencies:
```bash
npm install
```

2. Start the backend server (from the `app` directory):
```bash
cd ../app
npm start
```

3. Start the React development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` and will proxy API requests to the backend at `http://localhost:3000`.

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Environment Variables

Create a `.env` file in the frontend directory:

```
VITE_API_BASE=http://localhost:3000
```

For production, update this to your production backend URL.

## Features

- **Admin Panel**: Manage categories, dishes, and tables
- **Kitchen Dashboard**: Real-time order management with Socket.io
- **Menu (QR)**: Customer-facing menu for placing orders
- **Real-time Updates**: Socket.io integration for live order status updates

## Routing

- `/admin` - Admin panel
- `/kitchen` - Kitchen dashboard
- `/menu/:slug/:tableToken` - Customer menu (QR code links)

## API Integration

The frontend communicates with the backend via REST API and Socket.io:

- REST API endpoints are prefixed with `/api`
- Socket.io connects to the backend for real-time updates
- CORS is configured to allow requests from the frontend

## Production Deployment

1. Build the frontend:
```bash
npm run build
```

2. The built files will be in the `dist/` directory
3. Serve the `dist/` directory with a web server (nginx, Apache, etc.)
4. Configure the web server to proxy API requests to the backend

## Migration Notes

This React frontend replaces the original vanilla HTML/CSS/JS frontend while maintaining the same functionality and styling. The backend API remains unchanged.
