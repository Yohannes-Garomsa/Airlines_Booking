import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Plane, ArrowRight } from 'lucide-react';

const ConfirmationPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-12 text-center relative overflow-hidden">
        {/* Confetti decoration */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-10 left-10 w-2 h-2 bg-accent rounded-full animate-ping"></div>
          <div className="absolute top-20 right-10 w-3 h-3 bg-primary rounded-full animate-bounce"></div>
          <div className="absolute bottom-10 left-20 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        </div>

        <div className="bg-green-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
          <CheckCircle className="h-12 w-12 text-green-500" />
        </div>
        
        <h1 className="text-3xl font-black text-gray-800 mb-4 tracking-tighter uppercase">Booking Confirmed!</h1>
        <p className="text-gray-500 font-medium mb-12">
          Your journey with <span className="text-primary font-bold">SkyBound</span> is officially scheduled. Check your email for details.
        </p>

        <div className="space-y-4">
          <Link 
            to="/" 
            className="w-full bg-primary hover:bg-blue-800 text-white font-black py-4 px-8 rounded-2xl transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl flex items-center justify-center gap-2 group"
          >
            Explore More Flights <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-4 px-8 rounded-2xl transition-all">
            Download Ticket (PDF)
          </button>
        </div>
      </div>
      
      <div className="mt-12 flex items-center gap-2 text-slate-400">
        <Plane className="h-5 w-5" />
        <span className="text-sm font-black uppercase tracking-widest italic">SkyBound Airlines</span>
      </div>
    </div>
  );
};

export default ConfirmationPage;
