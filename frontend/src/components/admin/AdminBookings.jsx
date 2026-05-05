import React, { useState, useEffect } from 'react';
import { ShoppingBag, Loader2, Search, Filter, Eye, User, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = `${import.meta.env.VITE_API_URL || '/api'}/admin/bookings${filter !== 'all' ? `?status=${filter}` : ''}`;
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      confirmed: 'bg-green-50 text-green-600 border-green-100',
      cancelled: 'bg-red-50 text-red-600 border-red-100',
      pending: 'bg-yellow-50 text-yellow-600 border-yellow-100'
    };
    const icons = {
      confirmed: <CheckCircle className="h-3 w-3" />,
      cancelled: <XCircle className="h-3 w-3" />,
      pending: <Clock className="h-3 w-3" />
    };
    
    return (
      <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-1.5 ${styles[status] || styles.pending}`}>
        {icons[status] || icons.pending}
        {status}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
       <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-black text-slate-800 tracking-tighter uppercase">Global Bookings</h3>
            <div className="flex bg-slate-50 p-1 rounded-xl">
              {['all', 'confirmed', 'pending', 'cancelled'].map(s => (
                <button 
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filter === s ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Booking ID</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Customer</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Flight</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Amount</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="7" className="py-20 text-center"><Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" /></td></tr>
              ) : bookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-8 py-6">
                    <span className="font-mono text-xs font-bold text-slate-400">#{b.id}</span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-bold text-slate-700 text-sm">{b.user_name || 'Guest User'}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{b.cabin_class}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-bold text-slate-700 text-sm">{b.airline}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{b.departure_city} → {b.arrival_city}</p>
                  </td>
                  <td className="px-8 py-6 text-sm">
                    <p className="font-bold text-slate-700">{new Date(b.booking_date).toLocaleDateString()}</p>
                  </td>
                  <td className="px-8 py-6 font-black text-slate-800">${b.total_price}</td>
                  <td className="px-8 py-6">{getStatusBadge(b.status)}</td>
                  <td className="px-8 py-6">
                    <button className="p-2 hover:bg-white hover:shadow-md rounded-lg text-slate-400 hover:text-primary transition-all">
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminBookings;
