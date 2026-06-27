# PetEase Backend

Node.js backend API for PetEase Pet Adoption & Veterinary Appointment System.

## Setup Instructions

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Supabase Database:**
   - Create a Supabase project at https://supabase.com
   - Run the SQL schema from `petease.sql` in your Supabase SQL Editor
   - Copy your database connection string from Project Settings > Database

3. **Environment Variables:**
   - Copy `.env.example` to `.env`
   - Update `SUPABASE_DB_URL` with your Supabase connection string
   - Update `JWT_SECRET` with a secure random string

4. **Start the server:**
   ```bash
   npm run dev
   ```

The server will run on http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/profile` - Get user profile (authenticated)

### Pets
- `GET /api/pets` - Get all available pets
- `POST /api/pets` - Register a new pet (authenticated)

### Adoptions
- `POST /api/adoptions` - Create adoption request (authenticated)
- `GET /api/adoptions/sent` - Get sent adoption requests (authenticated)

### Appointments
- `POST /api/appointments` - Book appointment (authenticated)
- `GET /api/appointments` - Get user appointments (authenticated)

### Messages
- `POST /api/messages` - Send message (authenticated)
- `GET /api/messages` - Get user messages (authenticated)

### Vet Staff
- `GET /api/vet/appointments` - Get all appointments (vet only)
- `PUT /api/vet/appointments/:id` - Update appointment status (vet only)
- `GET /api/vet/services` - Get all services (vet only)

### Admin
- `GET /api/admin/users` - Get all users (admin only)
- `GET /api/admin/reports` - Get all reports (admin only)
- `POST /api/admin/announcements` - Create announcement (admin only)
