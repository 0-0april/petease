import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthCallback from './pages/AuthCallback';
import BrowsePets from './pages/user/BrowsePets';
import PetProfile from './pages/user/PetProfile';
import MyPets from './pages/user/MyPets';
import Appointments from './pages/user/Appointments';
import BookAppointment from './pages/user/BookAppointment';
import Messages from './pages/user/Messages';
import Notifications from './pages/user/Notifications';
import VetDashboard from './pages/vet/VetDashboard';
import VetAppointments from './pages/vet/VetAppointments';

import VetAdoptions from './pages/vet/VetAdoptions';
import VetServices from './pages/vet/VetServices';
import VetNotifications from './pages/vet/VetNotifications';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminReports from './pages/admin/AdminReports';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdoptionRequests from './pages/user/AdoptionRequests';
import Landing from './pages/Landing';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/landing" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/" element={<Navigate to="/browse-pets" replace />} />
          <Route path="/browse-pets" element={<PrivateRoute><BrowsePets /></PrivateRoute>} />
          <Route path="/pet/:id" element={<PrivateRoute><PetProfile /></PrivateRoute>} />
          <Route path="/my-pets" element={<PrivateRoute><MyPets /></PrivateRoute>} />
          <Route path="/appointments" element={<PrivateRoute><Appointments /></PrivateRoute>} />
          <Route path="/book-appointment" element={<PrivateRoute><BookAppointment /></PrivateRoute>} />
          <Route path="/adoption-requests" element={<PrivateRoute><AdoptionRequests /></PrivateRoute>} />
          <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
          <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />

          <Route path="/vet/dashboard" element={<PrivateRoute><VetDashboard /></PrivateRoute>} />
          <Route path="/vet/appointments" element={<PrivateRoute><VetAppointments /></PrivateRoute>} />

          <Route path="/vet/adoptions" element={<PrivateRoute><VetAdoptions /></PrivateRoute>} />
          <Route path="/vet/services" element={<PrivateRoute><VetServices /></PrivateRoute>} />
          <Route path="/vet/notifications" element={<PrivateRoute><VetNotifications /></PrivateRoute>} />

          <Route path="/admin/dashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/users" element={<PrivateRoute><AdminUsers /></PrivateRoute>} />
          <Route path="/admin/reports" element={<PrivateRoute><AdminReports /></PrivateRoute>} />
          <Route path="/admin/announcements" element={<PrivateRoute><AdminAnnouncements /></PrivateRoute>} />
          <Route path="/admin/notifications" element={<PrivateRoute><AdminNotifications /></PrivateRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
