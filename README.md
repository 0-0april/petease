# PetEase - Pet Adoption & Veterinary Appointment System

A modern web-based system for pet adoption and veterinary appointment management.

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── AdminLayout.jsx
│   ├── Layout.jsx
│   ├── VetLayout.jsx
│   ├── Modal.jsx
│   ├── Pagination.jsx
│   ├── PetCard.jsx
│   └── PrivateRoute.jsx
├── contexts/           # React contexts
│   └── AuthContext.jsx
├── data/              # Mock data
│   └── mockData.js
├── pages/             # Page components
│   ├── user/          # User panel pages
│   │   ├── Dashboard.jsx
│   │   ├── BrowsePets.jsx
│   │   ├── PetProfile.jsx
│   │   ├── MyPets.jsx
│   │   ├── Appointments.jsx
│   │   ├── BookAppointment.jsx
│   │   ├── Messages.jsx
│   │   └── Notifications.jsx
│   ├── vet/           # Vet staff panel pages
│   │   ├── VetDashboard.jsx
│   │   ├── VetAppointments.jsx
│   │   ├── VetAttendance.jsx
│   │   ├── VetMedicalRecords.jsx
│   │   ├── VetAdoptions.jsx
│   │   ├── VetAnnouncements.jsx
│   │   └── VetNotifications.jsx
│   ├── admin/         # Admin panel pages
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminUsers.jsx
│   │   ├── AdminReports.jsx
│   │   ├── AdminAnnouncements.jsx
│   │   └── AdminSystemAnnouncements.jsx
│   ├── Login.jsx
│   └── Register.jsx
├── services/          # API service layer
│   ├── api.js
│   ├── authService.js
│   ├── petService.js
│   ├── adoptionService.js
│   ├── appointmentService.js
│   ├── messageService.js
│   ├── notificationService.js
│   ├── vetService.js
│   └── adminService.js
├── App.jsx           # Main app component
├── main.jsx          # Entry point
└── index.css         # Global styles
```

## Features

### 1. User Panel
- Login/Registration
- Browse available pets for adoption
- View detailed pet profiles with medical history
- Request pet adoption
- Cancel adoption requests
- Upload, register, edit, and delete pets
- View medical history (medications and dates)
- Message pet owners
- Receive notifications
- Book veterinary appointments
  - Select multiple pets
  - Choose appointment type (Consultation, Anti-Rabies, Spay)
  - Calendar-based date selection with availability rules
- View and cancel appointments

### 2. Veterinary Staff Panel
- View appointment list with pagination
- View detailed appointment information
- Confirm/Cancel appointments
- View appointment logs/history
- Attendance management (mark attended/no-show)
- Add pet medical history with detailed information
- Upload announcements about service availability
- View list of booked appointments
- Notifications for new appointments
- View pending adoptions and upload waivers

### 3. Admin Panel
- User management with filters (role, status, last login)
- View and manage user reports
- Suspend/Activate/Delete user accounts
- Review vet staff announcements (approve/reject/edit)
- Create system-wide announcements
- Dashboard with statistics

## Technology Stack

- Frontend: React 18 with JSX
- Styling: Tailwind CSS
- Routing: React Router v6
- HTTP Client: Axios
- Build Tool: Vite
- Backend: Node.js (API integration ready)
- Database: MySQL (backend implementation)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update the API URL in `.env` file

4. Start development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

## Login Credentials

### User Account
- Email: `john@example.com` or `jane@example.com`
- Password: `password123`

### Vet Staff Account
- Email: `vet@example.com`
- Password: `vet123`

### Admin Account
- Email: `admin@example.com`
- Password: `admin123`

## Design

- Clean, modern UI with dark green accents (#166534)
- White and light gray backgrounds
- Responsive design
- Academic/capstone-level quality

## Appointment Rules

- Weekends: Vet not available (disabled)
- Consultation: Monday only
- Anti-Rabies Vaccine: Weekdays only
- Spay: Available on specific dates set by admin

## API Integration

The frontend is ready to connect to a Node.js backend. Update the `VITE_API_URL` in your `.env` file to point to your backend API.

## Routes

### User Routes
- `/` - Dashboard
- `/browse-pets` - Browse available pets
- `/pet/:id` - Pet profile
- `/my-pets` - Manage user's pets
- `/appointments` - View appointments
- `/book-appointment` - Book new appointment
- `/messages` - Message system
- `/notifications` - Notifications

### Vet Routes
- `/vet/dashboard` - Vet dashboard
- `/vet/appointments` - Manage appointments
- `/vet/attendance` - Attendance tracking
- `/vet/medical-records` - Medical records management
- `/vet/adoptions` - Adoption management
- `/vet/announcements` - Service announcements
- `/vet/notifications` - Vet notifications

### Admin Routes
- `/admin/dashboard` - Admin dashboard
- `/admin/users` - User management
- `/admin/reports` - User reports
- `/admin/announcements` - Announcement review
- `/admin/system-announcements` - System updates

## Notes

- This is a frontend implementation following MVC best practices
- Backend API endpoints are defined in the service layer
- Authentication uses JWT tokens stored in localStorage
- All forms include proper validation
- Currently using mock data for demonstration
