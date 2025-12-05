# Backend API Documentation

## Overview

The backend is a Node.js/Express server that provides REST API endpoints to manage expenses and automatically sync them to JSON files.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Backend Server

```bash
# Start backend only
npm run dev:backend

# Or start both frontend and backend together
npm run dev:full
```

The backend will run on `http://localhost:3001`

## API Endpoints

### Expenses

- `GET /api/expenses` - Get all expenses
- `GET /api/expenses/:id` - Get single expense by ID
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `POST /api/expenses/sync` - Bulk sync expenses (from localStorage)

### Other Data

- `GET /api/tenants` - Get all tenants
- `GET /api/heating` - Get heating data
- `GET /api/building` - Get building info
- `GET /api/health` - Health check

## Example Requests

### Create Expense

```bash
curl -X POST http://localhost:3001/api/expenses \
  -H "Content-Type: application/json" \
  -d '{
    "code": "Α1",
    "category": "Γενικά Κοινόχρηστα",
    "description": "ΔΕΗ Κοινόχρηστων Χώρων",
    "column": 14,
    "amount": 350,
    "date": "2025-11-11"
  }'
```

### Sync Expenses from localStorage

```bash
curl -X POST http://localhost:3001/api/expenses/sync \
  -H "Content-Type: application/json" \
  -d '{
    "expenses": [
      {
        "id": 1,
        "code": "Α1",
        "amount": 100,
        ...
      }
    ]
  }'
```

## Data Storage

All data is automatically saved to JSON files in `src/data/`:
- `expenses.json` - All expenses
- `tenants.json` - Tenant/apartment data
- `heating.json` - Heating data
- `building.json` - Building information

## Frontend Integration

The frontend automatically uses the API when available, with fallback to localStorage if the backend is not running.

## Production Deployment

For production, you can:

1. Build the React app: `npm run build`
2. Start the server: `npm start`
3. The server will serve the built React app and handle API requests

## Environment Variables

Create a `.env` file:

```
VITE_API_URL=http://localhost:3001/api
PORT=3001
```





