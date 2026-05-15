import React, { useState, useEffect } from 'react';
import { Plane, User, Loader2 } from 'lucide-react';
import { io } from 'socket.io-client';

const SeatSelection = ({ flightId, requiredSeats = 1, onSelect }) => {
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState([]);

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

    const socket = io(import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000');
    
    socket.on('seatUpdate', (updatedSeat) => {
      if (updatedSeat.flight_id === parseInt(flightId)) {
        setSeats(currentSeats => 
          currentSeats.map(seat => 
            seat.id === updatedSeat.id ? updatedSeat : seat
          )
        );
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [flightId]);

  const handleSeatClick = (seat) => {
    if (seat.is_occupied) return;

    const seatNumber = seat.seat_number;
    const isSelected = selectedSeats.includes(seatNumber);

    let nextSelected = [];
    if (isSelected) {
      nextSelected = selectedSeats.filter((item) => item !== seatNumber);
    } else {
      if (selectedSeats.length >= requiredSeats) {
        return;
      }
      nextSelected = [...selectedSeats, seatNumber];
    }

    setSelectedSeats(nextSelected);
    onSelect(nextSelected);
  };

  useEffect(() => {
    setSelectedSeats((prev) => prev.slice(0, requiredSeats));
  }, [requiredSeats]);

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
                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                        : selectedSeats.includes(seat.seat_number)
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
                        : selectedSeats.includes(seat.seat_number)
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

      <div className="mt-8 pt-6 border-t border-slate-50">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selected Seats</p>
              <p className="text-2xl font-black text-primary">{selectedSeats.length} / {requiredSeats}</p>
            </div>
            <div className="bg-blue-50 px-4 py-2 rounded-xl text-primary font-bold text-sm">
              No Extra Charge
            </div>
          </div>
          {selectedSeats.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedSeats.map((seat) => (
                <span key={seat} className="px-3 py-2 rounded-full bg-slate-100 text-slate-700 text-xs font-black">
                  {seat}
                </span>
              ))}
            </div>
          )}
          {selectedSeats.length < requiredSeats && (
            <p className="text-sm text-slate-500">Select {requiredSeats - selectedSeats.length} more seat{requiredSeats - selectedSeats.length === 1 ? '' : 's'}.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;
