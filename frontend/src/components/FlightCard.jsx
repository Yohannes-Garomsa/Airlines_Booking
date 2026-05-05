import { Link } from 'react-router-dom';
import { Plane, Clock, DollarSign } from 'lucide-react';

const FlightCard = ({ flight, selectedClass = 'Economy' }) => {
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const price = selectedClass === 'Business' ? flight.business_price : flight.economy_price;
  const seats = selectedClass === 'Business' ? flight.business_seats : flight.economy_seats;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow border border-gray-100 group">
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-colors">
              <Plane className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-gray-800">{flight.airline}</h3>
                {selectedClass === 'Business' && (
                  <span className="bg-yellow-100 text-yellow-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">VIP</span>
                )}
              </div>
              <p className="text-sm text-gray-500">{formatDate(flight.departure_time)}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-primary">${price}</span>
            <p className="text-xs text-gray-400">per person ({selectedClass})</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6 relative">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">{formatTime(flight.departure_time)}</p>
            <p className="text-sm font-semibold text-gray-500">{flight.departure_city}</p>
          </div>

          <div className="flex-grow flex flex-col items-center px-4">
            <div className="w-full border-t-2 border-dashed border-gray-200 relative mb-1">
              <Plane className="h-4 w-4 text-gray-300 absolute -top-2 left-1/2 -translate-x-1/2 transform rotate-90" />
            </div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">Non-stop</span>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">{formatTime(flight.arrival_time)}</p>
            <p className="text-sm font-semibold text-gray-500">{flight.arrival_city}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
          <div className="flex items-center gap-1 text-gray-500">
            <Clock className="h-4 w-4" />
            <span className="text-xs font-medium">Flight Time: ~4h</span>
          </div>
          <Link to={`/booking/${flight.id}?class=${selectedClass}`} className="bg-primary hover:bg-blue-800 text-white font-bold py-2 px-6 rounded-lg transition-all transform active:scale-95 shadow-lg shadow-blue-200">
            Book Now
          </Link>
        </div>
      </div>
      
      {/* Availability indicator */}
      <div className={`py-1 px-6 text-center ${seats < 10 ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
         <p className="text-[10px] font-bold uppercase tracking-wider">
           Only {seats} seats left in {selectedClass}
         </p>
      </div>
    </div>
  );
};

export default FlightCard;
