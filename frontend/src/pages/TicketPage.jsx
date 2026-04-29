import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plane, MapPin, Calendar, Clock, Download, Share2, Home, CheckCircle } from 'lucide-react';

const TicketPage = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/bookings/user`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        const currentBooking = data.find(b => b.id === parseInt(bookingId));
        setBooking(currentBooking);
      } catch (error) {
        console.error('Error fetching booking:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId]);

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading ticket...</div>;
  if (!booking) return <div className="text-center py-20">Ticket not found or unauthorized.</div>;

  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="flex flex-col items-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="bg-green-500 p-3 rounded-full mb-4 shadow-lg shadow-green-200">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Boarding Pass Ready</h1>
          <p className="text-slate-500 font-bold">Booking Reference: #SB-{booking.id}00{booking.id}</p>
        </div>

        {/* Ticket UI */}
        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative">
          {/* Main Ticket Info */}
          <div className="flex-grow p-12 relative">
             <div className="flex justify-between items-center mb-12">
               <div className="flex items-center gap-3">
                 <div className="bg-primary p-2 rounded-xl">
                   <Plane className="h-6 w-6 text-accent" />
                 </div>
                 <span className="text-2xl font-black italic tracking-tighter uppercase text-primary">SkyBound</span>
               </div>
               <div className="text-right">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Class</p>
                 <p className="font-bold text-slate-700">Economy</p>
               </div>
             </div>

             <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12 relative">
                <div className="text-center md:text-left">
                   <p className="text-6xl font-black text-primary tracking-tighter">{booking.departure_city.substring(0, 3).toUpperCase()}</p>
                   <p className="font-bold text-slate-500 uppercase text-xs tracking-widest">{booking.departure_city}</p>
                </div>

                <div className="flex-grow flex flex-col items-center">
                   <div className="w-full border-t-4 border-slate-100 relative">
                     <Plane className="h-8 w-8 text-accent absolute -top-4 left-1/2 -translate-x-1/2 rotate-90" />
                   </div>
                   <p className="mt-4 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Direct Flight</p>
                </div>

                <div className="text-center md:text-right">
                   <p className="text-6xl font-black text-primary tracking-tighter">{booking.arrival_city.substring(0, 3).toUpperCase()}</p>
                   <p className="font-bold text-slate-500 uppercase text-xs tracking-widest">{booking.arrival_city}</p>
                </div>
             </div>

             <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-slate-100">
               <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date</p>
                 <p className="font-bold text-slate-800">{new Date(booking.departure_time).toLocaleDateString()}</p>
               </div>
               <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Boarding</p>
                 <p className="font-bold text-slate-800">{new Date(booking.departure_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
               </div>
               <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Gate</p>
                 <p className="font-bold text-slate-800">B-24</p>
               </div>
               <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Seat</p>
                 <p className="font-bold text-slate-800">14A</p>
               </div>
             </div>
          </div>

          {/* Ticket Sidebar / Stub */}
          <div className="w-full md:w-64 bg-slate-50 border-t-4 md:border-t-0 md:border-l-4 border-dashed border-slate-200 p-8 flex flex-col justify-between items-center relative">
             {/* Decorative punch holes */}
             <div className="absolute -top-4 -left-4 w-8 h-8 bg-slate-100 rounded-full hidden md:block"></div>
             <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-slate-100 rounded-full hidden md:block"></div>

             <div className="text-center mb-8">
               <div className="bg-white p-4 rounded-2xl shadow-inner mb-4 inline-block">
                 {/* Mock QR Code */}
                 <div className="w-32 h-32 bg-slate-800 rounded-lg flex items-center justify-center p-2">
                    <div className="w-full h-full border-4 border-white grid grid-cols-3 gap-1 opacity-80">
                       {[...Array(9)].map((_, i) => <div key={i} className={`bg-white ${i % 3 === 0 ? 'opacity-40' : ''}`}></div>)}
                    </div>
                 </div>
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Scan for Boarding</p>
             </div>

             <div className="w-full space-y-3">
               <button className="w-full bg-white hover:bg-slate-100 text-slate-700 font-bold py-3 px-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-center gap-2 transition-all">
                 <Download className="h-4 w-4" /> Save
               </button>
               <button className="w-full bg-white hover:bg-slate-100 text-slate-700 font-bold py-3 px-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-center gap-2 transition-all">
                 <Share2 className="h-4 w-4" /> Share
               </button>
             </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-12 flex flex-col md:flex-row justify-center gap-4">
           <Link to="/" className="bg-primary hover:bg-blue-800 text-white font-black py-4 px-10 rounded-2xl shadow-xl flex items-center gap-2 transition-all transform hover:-translate-y-1">
             <Home className="h-5 w-5" /> Back to Home
           </Link>
           <button className="bg-white hover:bg-slate-50 text-slate-700 font-black py-4 px-10 rounded-2xl shadow-lg border border-slate-200 transition-all transform hover:-translate-y-1">
             Manage My Trips
           </button>
        </div>
      </div>
    </div>
  );
};

export default TicketPage;
