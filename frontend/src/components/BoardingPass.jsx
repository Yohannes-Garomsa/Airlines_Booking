import React from 'react';
import { Plane, Calendar, Clock, MapPin, ShieldCheck, Download, Share2, Wallet, Copy, Check } from 'lucide-react';

const BoardingPass = ({ ticket }) => {
  const [copied, setCopied] = React.useState(false);

  const copyPNR = () => {
    navigator.clipboard.writeText(ticket.pnr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in zoom-in duration-700">
      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative border border-slate-100">
        
        {/* Left Section (Main Ticket) */}
        <div className="flex-grow p-8 md:p-12 relative">
          {/* Header */}
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2 rounded-xl">
                <Plane className="h-6 w-6 text-accent" />
              </div>
              <span className="text-2xl font-black italic tracking-tighter uppercase text-primary">SkyBound</span>
            </div>
            <div className="text-right">
              <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                ticket.cabin_class === 'Business' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-blue-50 text-primary border-blue-100'
              }`}>
                {ticket.cabin_class || 'Economy'} Class
              </div>
            </div>
          </div>

          {/* Route Info */}
          <div className="flex justify-between items-center gap-4 mb-12">
            <div className="text-center md:text-left">
              <p className="text-6xl md:text-7xl font-black text-primary tracking-tighter">{ticket.departure_iata}</p>
              <p className="font-bold text-slate-400 uppercase text-xs tracking-widest">{ticket.departure_city}</p>
            </div>

            <div className="flex-grow flex flex-col items-center">
              <div className="w-full border-t-2 border-dashed border-slate-200 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-2">
                  <Plane className="h-6 w-6 text-accent rotate-90" />
                </div>
              </div>
              <p className="mt-4 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Direct Flight</p>
            </div>

            <div className="text-center md:text-right">
              <p className="text-6xl md:text-7xl font-black text-primary tracking-tighter">{ticket.arrival_iata}</p>
              <p className="font-bold text-slate-400 uppercase text-xs tracking-widest">{ticket.arrival_city}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-slate-100">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Passenger</p>
              <p className="font-bold text-slate-800 truncate">{ticket.passenger_name.toUpperCase()}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Flight</p>
              <p className="font-bold text-slate-800">{ticket.flight_number || 'SB101'}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date</p>
              <p className="font-bold text-slate-800">{new Date(ticket.departure_time).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Boarding</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="font-black text-primary text-xl">
                  {new Date(ticket.boarding_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 mt-4">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Gate</p>
              <p className="font-black text-slate-800 text-xl font-mono">{ticket.gate || 'B24'}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Seat</p>
              <p className="font-black text-slate-800 text-xl font-mono">{ticket.seat_number || '14A'}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Terminal</p>
              <p className="font-black text-slate-800 text-xl font-mono">{ticket.terminal || 'T2'}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Booking Ref</p>
              <button 
                onClick={copyPNR}
                className="flex items-center gap-1 group"
              >
                <span className="font-black text-slate-800 text-xl font-mono">{ticket.pnr}</span>
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />}
              </button>
            </div>
          </div>
        </div>

        {/* Right Section (Sidebar / QR) */}
        <div className="w-full md:w-80 bg-slate-50 border-t-4 md:border-t-0 md:border-l-4 border-dashed border-slate-200 p-8 flex flex-col justify-between items-center relative">
          {/* Decorative punch holes */}
          <div className="absolute -top-4 -left-4 w-8 h-8 bg-slate-100 rounded-full hidden md:block"></div>
          <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-slate-100 rounded-full hidden md:block"></div>

          <div className="text-center mb-8">
            <div className="bg-white p-4 rounded-3xl shadow-inner mb-4 inline-block">
              {ticket.qr_code_data ? (
                <img src={ticket.qr_code_data} alt="QR Code" className="w-40 h-40" />
              ) : (
                <div className="w-40 h-40 bg-slate-200 animate-pulse rounded-2xl flex items-center justify-center">
                   <Clock className="h-8 w-8 text-slate-400" />
                </div>
              )}
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Scan at Gate</p>
            <p className="text-[10px] font-mono text-slate-300">#{ticket.ticket_number}</p>
          </div>

          <div className="w-full space-y-3">
            <a 
              href={`${import.meta.env.VITE_API_URL || '/api'}/tickets/${ticket.id}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-primary hover:bg-blue-800 text-white font-black py-4 px-4 rounded-2xl shadow-xl shadow-blue-100 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-1"
            >
              <Download className="h-4 w-4" /> Save as PDF
            </a>
            <button className="w-full bg-white hover:bg-slate-100 text-slate-700 font-bold py-4 px-4 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center gap-2 transition-all">
              <Wallet className="h-4 w-4 text-orange-500" /> Add to Wallet
            </button>
          </div>
        </div>
      </div>

      {/* Legal / Info Footer */}
      <div className="mt-8 flex flex-col md:flex-row justify-between items-start gap-4 px-4">
        <div className="flex items-start gap-3 text-slate-400 max-w-md">
          <ShieldCheck className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <p className="text-xs font-medium leading-relaxed">
            Please arrive at the airport 2 hours before departure. Carry valid government-issued ID and travel documents at all times. Gate closes 20 minutes before departure.
          </p>
        </div>
        <div className="flex gap-4">
          <button className="text-slate-400 hover:text-primary transition-colors">
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BoardingPass;
