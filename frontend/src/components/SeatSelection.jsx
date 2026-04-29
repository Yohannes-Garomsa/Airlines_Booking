import React, { useState, useEffect } from 'react';
import { Plane, User, Loader2 } from 'lucide-react';

const SeatSelection = ({ flightId, onSelect }) => {
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeat, setSelectedSeat] = useState(null);

  useEffect(() => {
    const fetchSeats = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/seats/flight/${flightId}`);
        const data = await response.json();
        setSeats(data);
      } catch (error) {
        console.error('Error fetching seats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSeats();
  }, [flightId]);

  const handleSeatClick = (seat) => {
    if (seat.is_occupied) return;
    setSelectedSeat(seat.seat_number);
    onSelect(seat.seat_number);
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

  // Group seats by row
  const rows = seats.reduce((acc, seat) => {
    const rowNum = seat.seat_number.match(/\d+/)[0];
    if (!acc[rowNum]) acc[rowNum] = [];
    acc[rowNum].push(seat);
    return acc;
  }, {});

  return (
    <div className="bg-white rounded-[2rem] shadow-xl p-8">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-black text-gray-800 uppercase tracking-tighter flex items-center gap-2">
          <Plane className="h-5 w-5 text-primary" /> Select Your Seat
        </h3>
        <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest">
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-slate-100 rounded-sm"></div> Available</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-primary rounded-sm"></div> Selected</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-slate-300 rounded-sm"></div> Occupied</div>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
        <div className="flex flex-col gap-4">
          {Object.entries(rows).map(([rowNum, rowSeats]) => (
            <div key={rowNum} className="flex justify-center items-center gap-2">
              <span className="w-6 text-[10px] font-black text-slate-300">{rowNum}</span>
              <div className="flex gap-2">
                {rowSeats.slice(0, 3).map(seat => (
                  <button
                    key={seat.id}
                    disabled={seat.is_occupied}
                    onClick={() => handleSeatClick(seat)}
                    className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center font-bold text-xs ${
                      seat.is_occupied 
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                        : selectedSeat === seat.seat_number
                          ? 'bg-primary text-white shadow-lg shadow-blue-200 scale-110'
                          : 'bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-primary'
                    }`}
                  >
                    {seat.seat_number.slice(-1)}
                  </button>
                ))}
              </div>
              <div className="w-8"></div> {/* Aisle */}
              <div className="flex gap-2">
                {rowSeats.slice(3, 6).map(seat => (
                  <button
                    key={seat.id}
                    disabled={seat.is_occupied}
                    onClick={() => handleSeatClick(seat)}
                    className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center font-bold text-xs ${
                      seat.is_occupied 
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                        : selectedSeat === seat.seat_number
                          ? 'bg-primary text-white shadow-lg shadow-blue-200 scale-110'
                          : 'bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-primary'
                    }`}
                  >
                    {seat.seat_number.slice(-1)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedSeat && (
        <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selected Seat</p>
            <p className="text-2xl font-black text-primary">{selectedSeat}</p>
          </div>
          <div className="bg-blue-50 px-4 py-2 rounded-xl text-primary font-bold text-sm">
            No Extra Charge
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatSelection;
