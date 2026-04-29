import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plane, Calendar, MapPin, XCircle, Download, LayoutDashboard, ChevronRight, Loader2, AlertCircle } from 'lucide-react';

const DashboardPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/bookings/user`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    
    setCancelling(bookingId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        fetchBookings(); // Refresh list
      } else {
        alert('Failed to cancel booking.');
      }
    } catch (error) {
      console.error('Cancel error:', error);
    } finally {
      setCancelling(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-primary text-white p-6 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
             <LayoutDashboard className="h-8 w-8 text-accent" />
             <h1 className="text-2xl font-black uppercase tracking-tighter">My Dashboard</h1>
          </div>
          <Link to="/" className="text-sm font-bold bg-white/10 px-4 py-2 rounded-xl hover:bg-white/20 transition-all flex items-center gap-2">
             Back to Flights <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <main className="container mx-auto mt-12 px-4 pb-20 flex-grow">
        <div className="flex items-center gap-2 mb-8">
          <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tight">Recent Bookings</h2>
          <div className="h-1 flex-grow bg-slate-200 rounded-full mx-4"></div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="font-bold text-gray-400 uppercase tracking-widest text-xs">Loading your trips...</p>
          </div>
        ) : bookings.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {bookings.map(booking => (
              <div key={booking.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8 hover:shadow-xl transition-all group">
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Ref: #SB-{booking.id}00{booking.id}</span>
                  </div>
                  
                  <div className="flex items-center gap-8">
                     <div>
                       <p className="text-3xl font-black text-gray-800 tracking-tighter">{booking.departure_city.substring(0, 3).toUpperCase()}</p>
                       <p className="text-xs font-bold text-slate-400 uppercase">{booking.departure_city}</p>
                     </div>
                     <div className="flex flex-col items-center">
                        <Plane className="h-5 w-5 text-accent rotate-90" />
                        <div className="w-16 h-0.5 bg-slate-100 mt-2"></div>
                     </div>
                     <div>
                       <p className="text-3xl font-black text-gray-800 tracking-tighter">{booking.arrival_city.substring(0, 3).toUpperCase()}</p>
                       <p className="text-xs font-bold text-slate-400 uppercase">{booking.arrival_city}</p>
                     </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 lg:text-right">
                  <div>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Departure</p>
                    <p className="font-bold text-gray-700">{new Date(booking.departure_time).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Total Paid</p>
                    <p className="text-xl font-black text-primary">${booking.total_price}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                   {booking.status !== 'cancelled' && (
                     <>
                        <Link 
                          to={`/ticket/${booking.id}`}
                          className="bg-primary hover:bg-blue-800 text-white font-black px-6 py-3 rounded-xl transition-all shadow-lg flex items-center gap-2 text-sm"
                        >
                          <Download className="h-4 w-4" /> View Ticket
                        </Link>
                        <button 
                          onClick={() => handleCancel(booking.id)}
                          disabled={cancelling === booking.id}
                          className="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-6 py-3 rounded-xl transition-all border border-red-100 flex items-center gap-2 text-sm"
                        >
                          {cancelling === booking.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                          Cancel
                        </button>
                     </>
                   )}
                   {booking.status === 'cancelled' && (
                     <p className="text-xs font-bold text-red-400 italic">This booking has been cancelled and refunded.</p>
                   )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[3rem] shadow-sm border border-dashed border-gray-200">
             <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
               <Plane className="h-10 w-10 text-slate-300" />
             </div>
             <h3 className="text-2xl font-black text-gray-800 mb-2 uppercase">No trips yet</h3>
             <p className="text-gray-500 font-medium mb-8">You haven't made any bookings. Time for an adventure?</p>
             <Link to="/" className="bg-primary text-white font-black px-10 py-4 rounded-2xl shadow-xl hover:bg-blue-800 transition-all">
               Browse Flights
             </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
