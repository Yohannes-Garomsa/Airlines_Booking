import React, { useState, useEffect } from 'react';
import { Grid, Plane, Users, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';

const SeatMatrix = () => {
  const [flights, setFlights] = useState([]);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || '/api';
        const response = await fetch(`${API_URL}/flights`);
        if (!response.ok) throw new Error('Failed to fetch flights');
        const data = await response.json();
        setFlights(data);
        if (data.length > 0) {
          setSelectedFlight(data[0].id);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFlights();
  }, []);

  useEffect(() => {
    if (!selectedFlight) return;

    const fetchSeats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const API_URL = import.meta.env.VITE_API_URL || '/api';
        const response = await fetch(`${API_URL}/admin/seats/${selectedFlight}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch seat matrix');
        const data = await response.json();
        setSeats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSeats();

    // Real-time sync
    const socket = io(import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000');
    
    socket.on('seatUpdate', (updatedSeat) => {
      if (updatedSeat.flight_id === parseInt(selectedFlight)) {
        setSeats(currentSeats => 
          currentSeats.map(seat => 
            seat.id === updatedSeat.id ? { ...seat, ...updatedSeat } : seat
          )
        );
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedFlight]);

  // Generate Cabin Layout (Simplified: rows of 6 for economy, rows of 4 for business)
  // We'll separate seats into Business and Economy based on seat class.
  const businessSeats = seats.filter(s => s.seat_class === 'Business').sort((a, b) => a.seat_number.localeCompare(b.seat_number));
  const economySeats = seats.filter(s => s.seat_class === 'Economy').sort((a, b) => a.seat_number.localeCompare(b.seat_number));

  const renderSeat = (seat) => {
    const isOccupied = seat.is_occupied;
    const isBusiness = seat.seat_class === 'Business';
    
    // Base styles - Synched with User Booking View
    let seatColor = isOccupied ? 'bg-slate-300 text-slate-500 shadow-inner' : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-blue-50 hover:text-primary';
    if (!isOccupied && isBusiness) seatColor = 'bg-accent/10 text-accent-foreground border border-accent/20 hover:bg-accent/20';

    return (
      <div key={seat.id} className="relative group cursor-pointer flex justify-center items-center">
        <div className={`w-12 h-14 rounded-t-xl rounded-b-md flex items-center justify-center font-bold text-xs transition-all ${seatColor}`}>
          {seat.seat_number}
        </div>
        
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-900 text-white text-[10px] uppercase font-black tracking-widest p-4 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 shadow-2xl">
          <div className="flex flex-col gap-1">
            <span className="text-slate-400">Class: <span className="text-white">{seat.seat_class}</span></span>
            <span className="text-slate-400">Status: <span className={isOccupied ? 'text-red-400' : 'text-green-400'}>{isOccupied ? 'Occupied' : 'Available'}</span></span>
            {isOccupied && (
              <>
                <div className="h-[1px] w-full bg-slate-700 my-1"></div>
                <span className="text-slate-400">Passenger: <span className="text-white">{seat.passenger_name || 'N/A'}</span></span>
                <span className="text-slate-400">PNR: <span className="text-accent">{seat.pnr || 'N/A'}</span></span>
              </>
            )}
          </div>
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"></div>
        </div>
      </div>
    );
  };

  const currentFlight = flights.find(f => f.id === parseInt(selectedFlight));

  if (loading && !seats.length) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-200 gap-6">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-slate-800 flex items-center gap-3">
            <Grid className="h-6 w-6 text-primary" /> Seat Matrix
          </h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Live Cabin Occupancy</p>
        </div>
        <div className="w-full md:w-96">
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-4">Select Flight</label>
          <select
            value={selectedFlight || ''}
            onChange={(e) => setSelectedFlight(e.target.value)}
            className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary transition-all appearance-none outline-none"
          >
            {flights.map(flight => (
              <option key={flight.id} value={flight.id}>
                {flight.airline} • {flight.flight_number} ({flight.departure_iata} ➔ {flight.arrival_iata})
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-6 rounded-3xl font-bold flex items-center gap-3">
          <AlertCircle className="h-6 w-6" /> Error loading seats: {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Stats Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-200">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Occupancy Overview</h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <span className="font-bold text-slate-600">Total Capacity</span>
                  <span className="text-xl font-black text-slate-800">{seats.length}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <span className="font-bold text-slate-600 flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-300"></div> Occupied</span>
                  <span className="text-xl font-black text-slate-500">{seats.filter(s => s.is_occupied).length}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <span className="font-bold text-slate-600 flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-50 border border-slate-200"></div> Available</span>
                  <span className="text-xl font-black text-slate-400">{seats.filter(s => !s.is_occupied).length}</span>
                </div>
                
                {/* Visual Progress Bar */}
                <div className="pt-4">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    <span>Fill Rate</span>
                    <span>{Math.round((seats.filter(s => s.is_occupied).length / (seats.length || 1)) * 100)}%</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-slate-300 to-slate-400 rounded-full transition-all duration-1000"
                      style={{ width: `${(seats.filter(s => s.is_occupied).length / (seats.length || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2"></div>
               <Plane className="h-8 w-8 text-primary mb-4 relative z-10" />
               <h3 className="text-xl font-black tracking-tight relative z-10">Flight {currentFlight?.flight_number}</h3>
               <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-1 relative z-10">{currentFlight?.departure_city} ➔ {currentFlight?.arrival_city}</p>
               <div className="mt-6 pt-6 border-t border-white/10 relative z-10">
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Departure</p>
                 <p className="font-bold">{currentFlight ? new Date(currentFlight.departure_time).toLocaleString() : 'N/A'}</p>
               </div>
            </div>
          </div>

          {/* Cabin Visualizer */}
          <div className="lg:col-span-3 bg-white p-10 rounded-[3rem] shadow-xl border border-slate-200 overflow-x-auto relative">
             <div className="absolute left-10 top-1/2 -translate-y-1/2 w-4 h-3/4 border-r-2 border-dashed border-slate-200"></div>
             
             <div className="min-w-[600px] flex flex-col items-center">
                {/* Nose of plane */}
                <div className="w-64 h-32 bg-slate-50 border-t-[8px] border-l-[4px] border-r-[4px] border-slate-200 rounded-t-[100px] mb-8 relative flex items-center justify-center">
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Cockpit</div>
                </div>

                {/* Business Class */}
                {businessSeats.length > 0 && (
                  <div className="w-full max-w-2xl bg-slate-50 rounded-3xl p-8 border border-slate-100 mb-8 relative">
                    <div className="absolute -left-4 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-black uppercase tracking-[0.5em] text-slate-300 whitespace-nowrap">Business Class</div>
                    <div className="grid grid-cols-5 gap-y-6">
                      {/* We mock a 2-aisle-2 layout by inserting empty divs */}
                      {businessSeats.map((seat, index) => (
                        <React.Fragment key={seat.id}>
                          {renderSeat(seat)}
                          {/* Add aisle after 2nd seat in a row */}
                          {index % 4 === 1 && <div className="w-12 h-14 flex items-center justify-center text-[10px] text-slate-200">Aisle</div>}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}

                {/* Economy Class */}
                {economySeats.length > 0 && (
                  <div className="w-full max-w-2xl bg-white rounded-3xl p-8 border border-slate-100 relative">
                    <div className="absolute -left-4 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-black uppercase tracking-[0.5em] text-slate-300 whitespace-nowrap">Economy Class</div>
                    <div className="grid grid-cols-7 gap-y-4">
                      {/* We mock a 3-aisle-3 layout */}
                      {economySeats.map((seat, index) => (
                        <React.Fragment key={seat.id}>
                          {renderSeat(seat)}
                          {/* Add aisle after 3rd seat in a row */}
                          {index % 6 === 2 && <div className="w-12 h-14 flex items-center justify-center text-[10px] text-slate-200">Aisle</div>}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tail of plane */}
                <div className="w-64 h-24 bg-slate-50 border-b-[4px] border-l-[4px] border-r-[4px] border-slate-200 rounded-b-[50px] mt-8 flex items-center justify-center">
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Galley / Lavatory</div>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatMatrix;
