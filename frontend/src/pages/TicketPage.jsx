import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Home, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import BoardingPass from '../components/BoardingPass';

const TicketPage = () => {
  const { bookingId } = useParams();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const generateAndFetchTickets = async () => {
      try {
        const token = localStorage.getItem('token');
        // 1. First ensure tickets are generated
        const genResponse = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/tickets/generate`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({ bookingId: parseInt(bookingId) })
        });
        
        if (!genResponse.ok) {
          const errData = await genResponse.json();
          throw new Error(errData.message || 'Failed to generate tickets. Make sure payment is confirmed.');
        }

        const data = await genResponse.json();
        setTickets(data);
      } catch (error) {
        console.error('Error fetching tickets:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    generateAndFetchTickets();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Generating your boarding pass...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-black text-slate-900 uppercase mb-2">Issue Found</h2>
        <p className="text-slate-500 font-bold mb-8">{error}</p>
        <Link to="/" className="bg-primary text-white font-black py-4 px-10 rounded-2xl shadow-xl">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4 pb-32">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="flex flex-col items-center mb-12 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="bg-green-500 p-3 rounded-full mb-4 shadow-lg shadow-green-200">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Boarding Pass Ready</h1>
          <p className="text-slate-500 font-bold">Your journey with SkyBound begins here.</p>
        </div>

        {/* Render All Tickets (Multiple passengers support) */}
        <div className="space-y-12">
          {tickets.map(ticket => (
            <BoardingPass key={ticket.id} ticket={ticket} />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-20 flex flex-col md:flex-row justify-center gap-6">
           <Link to="/" className="bg-primary hover:bg-blue-800 text-white font-black py-5 px-12 rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all transform hover:-translate-y-1">
             <Home className="h-5 w-5" /> Back to Home
           </Link>
           <Link to="/dashboard" className="bg-white hover:bg-slate-50 text-slate-700 font-black py-5 px-12 rounded-2xl shadow-lg border border-slate-200 transition-all transform hover:-translate-y-1 flex items-center justify-center">
             Manage My Trips
           </Link>
        </div>
      </div>
    </div>
  );
};

export default TicketPage;
