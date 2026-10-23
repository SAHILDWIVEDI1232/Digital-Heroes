# Digital Heroes

Digital Heroes is a web-based platform designed to connect users with charitable contributions and draw-based engagement. It provides user account management, charity selection, contribution history, subscription functionality, draw results, and an administrative dashboard.

## Key Features

### User Features
- User registration and login
- Protected user dashboard
- Charity-related pages
- Draw results and scores
- Subscription management
- Donation and contribution history

### Admin Features
- Admin dashboard with overview statistics
- User management and search
- Charity management
- Draw management interface
- Contribution records and status filtering

### Technology Stack
- Frontend: React, Vite, CSS
- Backend: Node.js, Express.js
- Database: MongoDB with Mongoose
- Authentication: JWT
- HTTP client: Axios
- Payment integration: Stripe (where configured)

## Project Structure

```text
digital-heroes/
├── frontend/
│   └── src/
│       ├── pages/
│       ├── api.js
│       ├── App.jsx
│       └── App.css
└── backend/
    └── src/
        ├── config/
        ├── middleware/
        ├── models/
        ├── modules/
        └── server.js
```

## Prerequisites

- Node.js and npm
- MongoDB instance
- Environment variables configured for the backend
- Stripe credentials if payment functionality is enabled

## Setup Instructions

### 1. Backend

Open a terminal:

```powershell
cd backend
npm install
npm run dev
```

Configure the backend `.env` file before starting the server. Use the project's existing environment variable names and provide valid MongoDB and JWT settings.

### 2. Frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Configure `VITE_API_URL` if the backend API is not running at `http://localhost:5000/api`.

## API Health Check

When the backend is running, open:

```text
http://localhost:5000/api/health
```

The expected response indicates that the Digital Heroes API is running.

## Security Notes

- Keep `.env` files and secret keys private.
- Do not commit passwords, JWT secrets, or payment credentials.
- Admin routes should require authenticated admin access.
- Payment status should be verified by the backend.

## Project Status

The application includes frontend pages and backend modules for user authentication, charities, draws, subscriptions, contributions, scores, winners, and administrative management. Complete an end-to-end review of configured features before deployment or final submission.
