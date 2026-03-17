import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/user/Dashboard';
import BrowsePets from './pages/user/BrowsePets';
import PetProfile from './pages/user/PetProfile';
import MyPets from './pages/user/MyPets';
import Appointments from './pages/user/Appointments';
import BookAppointment from './pages/user/BookAppointment';
import Messages from './pages/user/Messages';
import Notifications from './pages/user/Notifications';
import VetDashboard from './pages/vet/VetDashboard';
import VetAppointments from './pages/vet/VetAppointments';
import VetAttendance from './pages/vet/VetAttendance';
import VetMedicalRecords from './pages/vet/VetMedicalRecords';
import VetAdoptions from './pages/vet/VetAdoptions';
import VetAnnouncements from './pages/vet/VetAnnouncements';
import VetNotifications from './pages/vet/VetNotifications';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminReports from './pages/admin/AdminReports';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import AdminSystemAnnouncements from './pages/admin/AdminSystemAnnouncements';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/browse-pets" element={<PrivateRoute><BrowsePets /></PrivateRoute>} />
          <Route path="/pet/:id" element={<PrivateRoute><PetProfile /></PrivateRoute>} />
          <Route path="/my-pets" element={<PrivateRoute><MyPets /></PrivateRoute>} />
          <Route path="/appointments" element={<PrivateRoute><Appointments /></PrivateRoute>} />
          <Route path="/book-appointment" element={<PrivateRoute><BookAppointment /></PrivateRoute>} />
          <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
          <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
          
          <Route path="/vet/dashboard" element={<PrivateRoute><VetDashboard /></PrivateRoute>} />
          <Route path="/vet/appointments" element={<PrivateRoute><VetAppointments /></PrivateRoute>} />
          <Route path="/vet/attendance" element={<PrivateRoute><VetAttendance /></PrivateRoute>} />
          <Route path="/vet/medical-records" element={<PrivateRoute><VetMedicalRecords /></PrivateRoute>} />
          <Route path="/vet/adoptions" element={<PrivateRoute><VetAdoptions /></PrivateRoute>} />
          <Route path="/vet/announcements" element={<PrivateRoute><VetAnnouncements /></PrivateRoute>} />
          <Route path="/vet/notifications" element={<PrivateRoute><VetNotifications /></PrivateRoute>} />
          
          <Route path="/admin/dashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/users" element={<PrivateRoute><AdminUsers /></PrivateRoute>} />
          <Route path="/admin/reports" element={<PrivateRoute><AdminReports /></PrivateRoute>} />
          <Route path="/admin/announcements" element={<PrivateRoute><AdminAnnouncements /></PrivateRoute>} />
          <Route path="/admin/system-announcements" element={<PrivateRoute><AdminSystemAnnouncements /></PrivateRoute>} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
