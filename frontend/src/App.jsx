import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import BookingPage from './pages/BookingPage';
import PaymentPage from './pages/PaymentPage';
import TicketPage from './pages/TicketPage';
import ConfirmationPage from './pages/ConfirmationPage';
import DashboardPage from './pages/DashboardPage';
import AdminLayout from './components/admin/AdminLayout';
import AdminFlights from './components/admin/AdminFlights';
import AdminBookings from './components/admin/AdminBookings';
import AdminUsers from './components/admin/AdminUsers';
import AdminProtectedRoute from './components/AdminProtectedRoute';

function App() {
  return (
    <AuthProvider>
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }>
            <Route index element={<AdminFlights />} />
            <Route path="flights" element={<AdminFlights />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/booking/:flightId" element={<BookingPage />} />
          <Route path="/payment/:bookingId" element={<PaymentPage />} />
          <Route path="/ticket/:bookingId" element={<TicketPage />} />
          <Route path="/confirmation" element={<ConfirmationPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
