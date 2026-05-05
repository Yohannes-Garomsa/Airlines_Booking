import { Link } from 'react-router-dom';
import { Plane, Clock, DollarSign } from 'lucide-react';

const CITY_IMAGES = {
  'Dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80',
  'London': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&q=80',
  'New York': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=600&q=80',
  'Tokyo': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=600&q=80',
  'Paris': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80',
  'Singapore': 'https://images.unsplash.com/photo-1525625232747-0ef45f85a271?auto=format&fit=crop&w=600&q=80',
};

const FlightCard = ({ flight, selectedClass = 'Economy' }) => {
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const price = selectedClass === 'Business' ? flight.business_price : flight.economy_price;
  const seats = selectedClass === 'Business' ? flight.business_seats : flight.economy_seats;
  const cityName = flight.arrival_city.split('(')[0].trim();
  const bgImage = CITY_IMAGES[cityName] || 'https://images.unsplash.com/photo-1436491865332-7a61a109c055?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-500 border border-slate-100 group flex flex-col h-full">
      {/* Visual Header */}
      <div className="h-52 relative overflow-hidden">
        <img src={bgImage} alt={cityName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/20"></div>
        
        <div className="absolute top-4 left-4 flex gap-2">
          <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${seats > 10 ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">{seats} Seats</span>
          </div>
          {selectedClass === 'Business' && (
            <div className="bg-primary/90 backdrop-blur-md px-3 py-1 rounded-full shadow-lg flex items-center gap-1 text-white border border-white/20">
              <span className="text-[10px] font-black uppercase tracking-widest">VIP Business</span>
            </div>
          )}
        </div>

        <div className="absolute bottom-4 left-8">
           <p className="text-white/80 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Destination</p>
           <h4 className="text-3xl font-black text-white drop-shadow-lg leading-none">{cityName}</h4>
        </div>
      </div>

      {/* Flight Details */}
      <div className="p-8 flex-grow flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
               <img src={`https://ui-avatars.com/api/?name=${flight.airline}&background=random&color=fff&bold=true`} className="w-6 h-6 rounded" alt={flight.airline} />
            </div>
            <div>
              <h3 className="font-black text-slate-800 leading-none mb-1">{flight.airline}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{formatDate(flight.departure_time)}</p>
            </div>
          </div>
          <div className="text-right">
             <div className="flex items-baseline justify-end gap-0.5">
                <span className="text-xs font-black text-primary">$</span>
                <span className="text-3xl font-black text-primary tracking-tighter">{Math.floor(price)}</span>
                <span className="text-xs font-black text-primary">.{(price % 1).toFixed(2).split('.')[1]}</span>
             </div>
             <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Per Traveler</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 mb-8 bg-slate-50/50 p-6 rounded-3xl border border-slate-50">
          <div className="text-center">
            <p className="text-xl font-black text-slate-800 leading-none mb-1">{formatTime(flight.departure_time)}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{flight.departure_city.split('(')[1]?.replace(')', '') || 'ORG'}</p>
          </div>

          <div className="flex-grow flex flex-col items-center gap-1">
             <div className="w-full flex items-center gap-2">
                <div className="h-[2px] flex-grow bg-slate-200 rounded-full relative">
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-1 rounded-full border border-slate-100">
                      <Plane className="h-3 w-3 text-primary" />
                   </div>
                </div>
             </div>
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Non-stop</span>
          </div>

          <div className="text-center">
            <p className="text-xl font-black text-slate-800 leading-none mb-1">{formatTime(flight.arrival_time)}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{flight.arrival_city.split('(')[1]?.replace(')', '') || 'DST'}</p>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between gap-4 pt-6 border-t border-slate-100">
          <div className="flex items-center gap-2 text-slate-400">
             <Clock className="h-4 w-4" />
             <span className="text-[10px] font-bold uppercase tracking-widest">Est. 4h 30m</span>
          </div>
          <Link 
            to={`/booking/${flight.id}?class=${selectedClass}`} 
            className="bg-primary hover:bg-blue-800 text-white text-xs font-black uppercase tracking-widest py-4 px-8 rounded-2xl transition-all transform active:scale-95 shadow-xl shadow-blue-100"
          >
            Select Flight
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FlightCard;
