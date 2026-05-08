import React, { useState } from 'react';
import { Search, CheckCircle, XCircle, Clock, MapPin, User, Ticket, Loader2, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminVerifyTicket = () => {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!identifier) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/tickets/verify/${identifier}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
      } else {
        setError(data.message || 'Verification failed');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      <header className="bg-primary text-white p-6 shadow-xl sticky top-0 z-50">
        <div className="container mx-auto flex items-center gap-4">
          <button onClick={() => navigate('/admin')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-black uppercase tracking-widest italic">Ticket Gate Verification</h1>
        </div>
      </header>

      <main className="container mx-auto mt-12 px-4 max-w-2xl">
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-200">
          <div className="text-center mb-10">
            <div className="bg-blue-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Ticket className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Scan or Enter Ticket</h2>
            <p className="text-slate-500 font-bold mt-2">Enter PNR or Ticket ID to verify boarding</p>
          </div>

          <form onSubmit={handleVerify} className="relative mb-12">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-300" />
            <input 
              type="text" 
              placeholder="e.g. SB123K9 or 220..."
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full pl-16 pr-32 py-6 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-primary focus:bg-white outline-none font-black text-xl transition-all uppercase"
            />
            <button 
              disabled={loading}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary hover:bg-blue-800 text-white font-black px-6 py-3 rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'VERIFY'}
            </button>
          </form>

          {error && (
            <div className="bg-red-50 border-2 border-red-100 rounded-2xl p-8 text-center animate-in fade-in zoom-in duration-300">
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-2xl font-black text-red-600 uppercase mb-2">Invalid Ticket</h3>
              <p className="text-red-400 font-bold">{error}</p>
            </div>
          )}

          {result && (
            <div className={`rounded-3xl p-1 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-2xl ${result.valid ? 'bg-green-500' : 'bg-orange-500'}`}>
              <div className="bg-white rounded-[1.4rem] p-8">
                <div className="flex items-center justify-between mb-8 pb-8 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Status</span>
                    <div className={`flex items-center gap-2 text-2xl font-black italic uppercase ${result.valid ? 'text-green-600' : 'text-orange-600'}`}>
                      {result.valid ? <CheckCircle className="h-8 w-8" /> : <XCircle className="h-8 w-8" />}
                      {result.status}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">PNR REF</span>
                    <div className="text-xl font-black text-slate-800">{result.ticket.ticket_number.slice(-6).toUpperCase()}</div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="flex items-start gap-4">
                      <div className="bg-slate-100 p-3 rounded-xl"><User className="h-5 w-5 text-slate-500" /></div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Passenger</p>
                        <p className="font-black text-slate-800 text-lg uppercase">{result.ticket.passenger_name}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="bg-slate-100 p-3 rounded-xl"><MapPin className="h-5 w-5 text-slate-500" /></div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Flight</p>
                        <p className="font-black text-slate-800 text-lg uppercase">{result.ticket.flight_number}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-6 flex justify-between items-center border border-slate-100">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Route</span>
                      </div>
                      <p className="font-black text-slate-800">{result.ticket.departure_city} → {result.ticket.arrival_city}</p>
                    </div>
                    <div className="text-right">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Gate / Seat</span>
                       <p className="font-black text-primary text-xl uppercase">{result.ticket.gate} / {result.ticket.seat_number}</p>
                    </div>
                  </div>
                </div>
                
                {result.valid && (
                  <button className="w-full mt-8 bg-green-600 hover:bg-green-700 text-white font-black py-5 rounded-2xl shadow-xl transition-all uppercase tracking-widest">
                    Confirm Boarding
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminVerifyTicket;
