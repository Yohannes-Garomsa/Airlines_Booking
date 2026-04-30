import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plane, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const LoginPage = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(credentials);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Abstract background shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20 z-0">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-48 w-80 h-80 bg-blue-400 rounded-full blur-3xl"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link to="/" className="flex justify-center items-center gap-2 text-primary hover:text-blue-800 transition-colors mb-6">
          <div className="bg-primary text-white p-2 rounded-xl">
            <Plane className="h-8 w-8" />
          </div>
          <span className="text-3xl font-black tracking-tighter uppercase">SkyBound</span>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-black text-gray-900 tracking-tight">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 font-medium">
          Or{' '}
          <Link to="/register" className="font-bold text-primary hover:text-blue-800 transition-colors">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-4 shadow-2xl shadow-blue-900/5 sm:rounded-3xl sm:px-10 border border-white/20 backdrop-blur-xl">
          
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700 font-bold">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-black uppercase text-gray-400 mb-2 ml-1 tracking-widest">
                Email address
              </label>
              <div className="mt-1 relative">
                <Mail className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  name="email"
                  type="email"
                  required
                  value={credentials.email}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-12 pr-4 py-4 border-0 bg-slate-50 rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold text-gray-800 transition-all shadow-inner"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-gray-400 mb-2 ml-1 tracking-widest">
                Password
              </label>
              <div className="mt-1 relative">
                <Lock className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  name="password"
                  type="password"
                  required
                  value={credentials.password}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-12 pr-4 py-4 border-0 bg-slate-50 rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold text-gray-800 transition-all shadow-inner"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 font-medium">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-bold text-primary hover:text-blue-800 transition-colors">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-xl shadow-primary/20 text-sm font-black text-white bg-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
