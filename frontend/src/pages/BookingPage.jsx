import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plane, User, Mail, CreditCard, ChevronLeft, Loader2, CheckCircle } from 'lucide-react';
import { flightService } from '../services/api';

import SeatSelection from '../components/SeatSelection';

const BookingPage = () => {
  const { flightId } = useParams();
  const navigate = useNavigate();
  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [passenger, setPassenger] = useState({ name: '', email: '' });
  const [selectedSeat, setSelectedSeat] = useState(null);

  useEffect(() => {
    const fetchFlight = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/flights/${flightId}`);
        const data = await response.json();
        setFlight(data);
      } catch (error) {
        console.error('Error fetching flight:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFlight();
  }, [flightId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSeat) {
      alert('Please select a seat first.');
      return;
    }
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token'); 
      const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          flightId: parseInt(flightId),
          totalPrice: flight.price,
          passengers: [passenger]
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        // Also reserve the seat
        await fetch(`${import.meta.env.VITE_API_URL || '/api'}/seats/reserve`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            flightId: parseInt(flightId),
            seatNumber: selectedSeat,
            bookingId: data.id
          })
        });
        navigate(`/payment/${data.id}`, { state: { booking: data, flight } });
      } else {
        alert('Booking failed. Make sure you are logged in.');
      }
    } catch (error) {
      console.error('Booking error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen"><Loader2 className="animate-spin h-12 w-12 text-primary" /></div>;
  if (!flight) return <div className="text-center py-20">Flight not found.</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-primary text-white p-4 shadow-md">
        <div className="container mx-auto flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-black uppercase tracking-tighter">Complete Your Booking</h1>
        </div>
      </header>

      <main className="container mx-auto mt-12 px-4 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form */}
          <div className="lg:col-span-8 space-y-8">
            <SeatSelection flightId={flightId} onSelect={setSelectedSeat} />

            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-2xl font-black text-gray-800 mb-8 flex items-center gap-2">
                <User className="h-6 w-6 text-primary" /> Passenger Details
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-black uppercase text-gray-400 mb-2 ml-1 tracking-widest">Full Name</label>
                  <div className="relative">
                    <User className="h-5 w-5 text-gray-300 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. John Doe"
                      value={passenger.name}
                      onChange={(e) => setPassenger({...passenger, name: e.target.value})}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-gray-400 mb-2 ml-1 tracking-widest">Email Address</label>
                  <div className="relative">
                    <Mail className="h-5 w-5 text-gray-300 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input 
                      required
                      type="email" 
                      placeholder="john@example.com"
                      value={passenger.email}
                      onChange={(e) => setPassenger({...passenger, email: e.target.value})}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold"
                    />
                  </div>
                </div>

                <div className="pt-8">
                   <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-2">
                    <CreditCard className="h-6 w-6 text-primary" /> Payment Method
                  </h2>
                  <div className="bg-slate-100 p-6 rounded-2xl border-2 border-primary/20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-white p-2 rounded-lg shadow-sm">
                        <CreditCard className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">Pay at Counter / Later</p>
                        <p className="text-xs text-gray-500">Secure your seat now, pay at the airport.</p>
                      </div>
                    </div>
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                </div>

                <button 
                  disabled={submitting}
                  className="w-full bg-primary hover:bg-blue-800 disabled:bg-blue-300 text-white font-black py-5 rounded-2xl transition-all transform hover:scale-[1.01] active:scale-95 shadow-xl flex items-center justify-center gap-3 mt-12"
                >
                  {submitting ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Confirm Booking'}
                </button>
              </form>
            </div>
          </div>

          {/* Flight Summary */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl shadow-xl p-6 sticky top-24 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-accent"></div>
              <h3 className="text-lg font-black text-gray-800 mb-6 uppercase tracking-tight">Flight Summary</h3>
              
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                   <div className="bg-blue-50 p-2 rounded-lg">
                    <Plane className="h-5 w-5 text-primary" />
                   </div>
                   <span className="font-bold text-gray-700">{flight.airline}</span>
                </div>

                <div className="flex justify-between border-b border-slate-50 pb-4">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase">From</p>
                    <p className="font-bold text-gray-800">{flight.departure_city}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase">To</p>
                    <p className="font-bold text-gray-800">{flight.arrival_city}</p>
                  </div>
                </div>

                <div className="pt-4 flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-500 italic">Total Price</span>
                  <span className="text-3xl font-black text-primary">${flight.price}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookingPage;
