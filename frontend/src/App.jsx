import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import BookingPage from './pages/BookingPage';
import PaymentPage from './pages/PaymentPage';
import TicketPage from './pages/TicketPage';
import ConfirmationPage from './pages/ConfirmationPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminVerifyTicket from './pages/AdminVerifyTicket';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  return (
    <AuthProvider>
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* New Upgraded Admin Routes */}
          <Route path="/admin" element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/verify" element={
            <AdminProtectedRoute>
              <AdminVerifyTicket />
            </AdminProtectedRoute>
          } />
          
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/booking/:flightId" element={<BookingPage />} />
          <Route path="/payment/:bookingId" element={<PaymentPage />} />
          <Route path="/ticket/:bookingId" element={<TicketPage />} />
          <Route path="/ticket/public/:bookingId" element={<TicketPage isPublic={true} />} />
          <Route path="/confirmation" element={<ConfirmationPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
