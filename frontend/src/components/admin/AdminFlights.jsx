import React, { useState, useEffect } from 'react';
import { Plane, Plus, Search, Filter, MoreVertical, Trash2, Edit2, X, ChevronRight, ChevronLeft, Loader2, MapPin } from 'lucide-react';
import AirportSearch from './AirportSearch';

const AdminFlights = () => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    airline: '',
    flight_number: '',
    departure_airport_id: null,
    arrival_airport_id: null,
    departure_time: '',
    arrival_time: '',
    economy_price: '',
    total_seats: 180
  });

  const [selectedDeparture, setSelectedDeparture] = useState(null);
  const [selectedArrival, setSelectedArrival] = useState(null);

  useEffect(() => {
    fetchFlights();
  }, []);

  const fetchFlights = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/flights`);
      const data = await res.json();
      setFlights(data);
    } catch (err) {
      console.error('Failed to fetch flights:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFlight = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/admin/flights`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          departure_airport_id: selectedDeparture?.id,
          arrival_airport_id: selectedArrival?.id
        })
      });

      if (res.ok) {
        setShowModal(false);
        resetForm();
        fetchFlights();
      }
    } catch (err) {
      console.error('Failed to create flight:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      airline: '',
      flight_number: '',
      departure_airport_id: null,
      arrival_airport_id: null,
      departure_time: '',
      arrival_time: '',
      economy_price: '',
      total_seats: 180
    });
    setSelectedDeparture(null);
    setSelectedArrival(null);
    setCurrentStep(1);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-4">
             <div className="p-3 bg-blue-50 rounded-2xl text-primary"><Plane className="h-6 w-6" /></div>
             <span className="text-green-500 font-bold text-xs uppercase tracking-widest">+12%</span>
          </div>
          <h4 className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">Total Active Flights</h4>
          <p className="text-3xl font-black text-slate-800 tracking-tighter">{flights.length}</p>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-black text-slate-800 tracking-tighter uppercase">Flight Inventory</h3>
            <div className="bg-slate-50 px-3 py-1 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Ops</div>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-primary hover:bg-blue-800 text-white font-black text-xs uppercase tracking-widest py-3 px-6 rounded-2xl transition-all flex items-center gap-2 shadow-xl shadow-blue-100"
          >
            <Plus className="h-4 w-4" /> Create New Flight
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Flight Info</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Route</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Schedule</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Capacity</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Price</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="6" className="py-20 text-center"><Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" /></td></tr>
              ) : flights.map((flight) => (
                <tr key={flight.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-xs text-slate-400">{flight.airline?.charAt(0)}</div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{flight.airline}</p>
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest">{flight.flight_number || 'SKB-123'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700">{flight.departure_iata}</span>
                      <ChevronRight className="h-3 w-3 text-slate-300" />
                      <span className="font-bold text-slate-700">{flight.arrival_iata}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{flight.departure_city} to {flight.arrival_city}</p>
                  </td>
                  <td className="px-8 py-6 text-sm">
                    <p className="font-bold text-slate-700">{new Date(flight.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(flight.departure_time).toLocaleDateString()}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-grow h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${(flight.available_seats / flight.total_seats) * 100}%` }}></div>
                      </div>
                      <span className="text-[10px] font-black text-slate-700">{flight.available_seats}/{flight.total_seats}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 font-black text-primary">${flight.economy_price}</td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-white hover:shadow-md rounded-lg text-slate-400 hover:text-primary transition-all"><Edit2 className="h-4 w-4" /></button>
                      <button className="p-2 hover:bg-white hover:shadow-md rounded-lg text-slate-400 hover:text-red-500 transition-all"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl relative z-10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tighter uppercase">Industry Flight Config</h3>
                <p className="text-xs text-slate-400 font-bold">Step {currentStep} of 3</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white rounded-xl text-slate-400 transition-all"><X className="h-5 w-5" /></button>
            </div>

            <div className="p-8">
              {currentStep === 1 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="p-4 bg-primary/5 rounded-2xl flex items-start gap-4 border border-primary/10">
                    <div className="p-2 bg-primary rounded-xl text-white"><MapPin className="h-5 w-5" /></div>
                    <div>
                      <p className="font-black text-primary text-[10px] uppercase tracking-widest mb-1">Phase 1</p>
                      <p className="font-bold text-slate-700 text-sm">Select departure origin airport.</p>
                    </div>
                  </div>
                  <AirportSearch 
                    label="Departure Airport" 
                    placeholder="Search by city or IATA..." 
                    onSelect={setSelectedDeparture}
                    value={selectedDeparture}
                  />
                  <div className="flex justify-end pt-4">
                    <button 
                      disabled={!selectedDeparture}
                      onClick={() => setCurrentStep(2)}
                      className="bg-primary disabled:opacity-50 text-white font-black text-xs uppercase tracking-widest py-4 px-10 rounded-2xl shadow-xl shadow-blue-100 flex items-center gap-2"
                    >
                      Next Step <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                   <div className="p-4 bg-primary/5 rounded-2xl flex items-start gap-4 border border-primary/10">
                    <div className="p-2 bg-primary rounded-xl text-white"><Plane className="h-5 w-5" /></div>
                    <div>
                      <p className="font-black text-primary text-[10px] uppercase tracking-widest mb-1">Phase 2</p>
                      <p className="font-bold text-slate-700 text-sm">Select arrival destination airport.</p>
                    </div>
                  </div>
                  <AirportSearch 
                    label="Arrival Airport" 
                    placeholder="Search by city or IATA..." 
                    onSelect={setSelectedArrival}
                    value={selectedArrival}
                  />
                  <div className="flex justify-between pt-4">
                    <button onClick={() => setCurrentStep(1)} className="text-slate-400 font-black text-xs uppercase tracking-widest px-6">Back</button>
                    <button 
                      disabled={!selectedArrival}
                      onClick={() => setCurrentStep(3)}
                      className="bg-primary disabled:opacity-50 text-white font-black text-xs uppercase tracking-widest py-4 px-10 rounded-2xl shadow-xl shadow-blue-100 flex items-center gap-2"
                    >
                      Next Step <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest">Airline Name</label>
                      <input 
                        type="text" 
                        value={formData.airline}
                        onChange={(e) => setFormData({...formData, airline: e.target.value})}
                        className="w-full px-4 py-4 bg-slate-50 border-0 rounded-2xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 transition-all text-sm" 
                        placeholder="e.g. SkyBound Emirates"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest">Flight #</label>
                      <input 
                        type="text" 
                        value={formData.flight_number}
                        onChange={(e) => setFormData({...formData, flight_number: e.target.value})}
                        className="w-full px-4 py-4 bg-slate-50 border-0 rounded-2xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 transition-all text-sm" 
                        placeholder="SK-450"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest">Price (USD)</label>
                      <input 
                        type="number" 
                        value={formData.economy_price}
                        onChange={(e) => setFormData({...formData, economy_price: e.target.value})}
                        className="w-full px-4 py-4 bg-slate-50 border-0 rounded-2xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 transition-all text-sm" 
                        placeholder="299.00"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest">Departure Time</label>
                      <input 
                        type="datetime-local" 
                        value={formData.departure_time}
                        onChange={(e) => setFormData({...formData, departure_time: e.target.value})}
                        className="w-full px-4 py-4 bg-slate-50 border-0 rounded-2xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 transition-all text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest">Arrival Time</label>
                      <input 
                        type="datetime-local" 
                        value={formData.arrival_time}
                        onChange={(e) => setFormData({...formData, arrival_time: e.target.value})}
                        className="w-full px-4 py-4 bg-slate-50 border-0 rounded-2xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 transition-all text-sm" 
                      />
                    </div>
                  </div>
                  <div className="flex justify-between pt-4">
                    <button onClick={() => setCurrentStep(2)} className="text-slate-400 font-black text-xs uppercase tracking-widest px-6">Back</button>
                    <button 
                      onClick={handleCreateFlight}
                      className="bg-green-500 hover:bg-green-600 text-white font-black text-xs uppercase tracking-widest py-4 px-10 rounded-2xl shadow-xl shadow-green-100"
                    >
                      Finalize Flight
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFlights;
