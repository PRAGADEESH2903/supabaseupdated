# Showroom App with Supabase and React

This is a showroom management application that combines Supabase as the backend database with a React frontend.

## Project Structure

```
showroom-supabase-react/
├── backend/           # Flask API with Supabase
│   ├── app.py        # Main Flask application
│   └── supabase_client.py  # Supabase client configuration
├── frontend/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── requirements.txt   # Python dependencies
└── env.example        # Environment variables template
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r ../requirements.txt
   ```

4. Create a `.env` file in the root directory (showroom-supabase-react/) based on `env.example`:
   ```bash
   SUPABASE_URL=your-supabase-url
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   SUPABASE_ANON_KEY=your-anon-key
   BACKEND_PORT=5050
   ```

5. Run the backend server:
   ```bash
   python app.py
   ```

The backend will run on `http://const API_URL = process.env.REACT_APP_API_URL;
`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend will run on `http://localhost:3000`

## Features

- **Customer Management**: Add and manage customer information
- **Vehicle Management**: Track vehicle details with customer associations
- **Service Management**: Record vehicle services (free/paid based on service count)
- **Purchase Management**: Handle vehicle purchases with loan/cash options
- **Search Functionality**: Search across customers, vehicles, services, and purchases

## API Endpoints

- `GET /api/customers` - List all customers
- `POST /api/customers` - Create a new customer
- `GET /api/vehicles` - List all vehicles
- `POST /api/vehicles` - Create a new vehicle
- `POST /api/services` - Create a service record
- `POST /api/purchases` - Create a purchase record
- `GET /api/{entity}/search?q={query}` - Search entities

## Database

This application uses Supabase (PostgreSQL) as the database. Make sure you have:
- Created the necessary tables in your Supabase project
- Set up the proper foreign key relationships
- Configured Row Level Security (RLS) if needed

## Notes

- The backend runs on port 5050 by default
- The frontend runs on port 3000 by default
- Make sure both servers are running for the application to work properly
- CORS is enabled for all origins in development

