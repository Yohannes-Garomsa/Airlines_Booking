import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, Loader2, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const AdminLoginPage = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [justLoggedIn, setJustLoggedIn] = useState(false);

  // Security: If an admin uses the back button to reach the login page,
  // we immediately log them out to secure the session from unauthorized access.
  useEffect(() => {
    if (user && ['admin', 'superadmin'].includes(user.role) && !justLoggedIn) {
      logout();
    }
  }, [user, logout, justLoggedIn]);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      setJustLoggedIn(true);
      const data = await login(credentials);
      
      // Strict Check: Ensure only admins can use this portal
      if (!['admin', 'superadmin'].includes(data.user.role)) {
        logout();
        setError('Unauthorized Access: This portal is strictly for administrators.');
        setLoading(false);
        return;
      }

      const from = location.state?.from?.pathname || '/admin';
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
    } finally {
      if (['admin', 'superadmin'].includes(user?.role)) {
          // If login fails, setLoading will be false anyway
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-inter">
      {/* Abstract background shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20 z-0">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-48 w-80 h-80 bg-blue-600 rounded-full blur-3xl"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Back to Home Button */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold">Back to Public Portal</span>
        </Link>

        <div className="flex justify-center items-center gap-2 text-white mb-6">
          <div className="bg-primary text-white p-3 rounded-2xl shadow-lg shadow-primary/30">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <span className="text-3xl font-black tracking-tighter uppercase">SkyBound</span>
        </div>
        <h2 className="mt-6 text-center text-3xl font-black text-white tracking-tight">
          System Administration
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400 font-bold tracking-widest uppercase">
          Authorized Personnel Only
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[#1E293B] py-8 px-4 shadow-2xl shadow-black/50 sm:rounded-3xl sm:px-10 border border-slate-700 backdrop-blur-xl">
          
          {error && (
            <div className="mb-6 bg-red-900/30 border-l-4 border-red-500 p-4 rounded-r-xl flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-200 font-bold">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest">
                Admin Email
              </label>
              <div className="mt-1 relative">
                <Mail className="h-5 w-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  name="email"
                  type="email"
                  required
                  value={credentials.email}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-12 pr-4 py-4 border-0 bg-[#0F172A] rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold text-white transition-all shadow-inner placeholder-slate-600"
                  placeholder="admin@skybound.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest">
                Security Key (Password)
              </label>
              <div className="mt-1 relative">
                <Lock className="h-5 w-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={credentials.password}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-12 pr-12 py-4 border-0 bg-[#0F172A] rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold text-white transition-all shadow-inner placeholder-slate-600"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-xl shadow-primary/20 text-sm font-black text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Authenticate'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
