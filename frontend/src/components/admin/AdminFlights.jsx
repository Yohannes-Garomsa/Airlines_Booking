import React, { useState, useEffect } from 'react';
import { Plane, Plus, Search, Filter, MoreVertical, Trash2, Edit2, X, ChevronRight, ChevronLeft, Loader2, MapPin, Check } from 'lucide-react';
import AirportSearch from './AirportSearch';

const AdminFlights = () => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [editingFlight, setEditingFlight] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({
    airline: '',
    flight_number: '',
    departure_airport_id: null,
    arrival_airport_id: null,
    departure_time: '',
    arrival_time: '',
    economy_price: '',
    total_seats: 180,
    aircraft_id: null
  });
  const [fleet, setFleet] = useState([]);
  const [availableFleet, setAvailableFleet] = useState([]);
  const [loadingFleet, setLoadingFleet] = useState(false);

  const [selectedDeparture, setSelectedDeparture] = useState(null);
  const [selectedArrival, setSelectedArrival] = useState(null);

  useEffect(() => {
    fetchFlights();
    fetchFleet();
  }, []);

  const fetchFleet = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/admin/fleet`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setFleet(data);
    } catch (err) {
      console.error('Failed to fetch fleet:', err);
    }
  };

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

  const fetchAvailableFleet = async (depTime, arrTime, excludeId) => {
    if (!depTime || !arrTime) return;
    setLoadingFleet(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/admin/fleet/available?departure_time=${depTime}&arrival_time=${arrTime}${excludeId ? `&exclude_flight_id=${excludeId}` : ''}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setAvailableFleet(data);
    } catch (err) {
      console.error('Failed to fetch available fleet:', err);
    } finally {
      setLoadingFleet(false);
    }
  };

  useEffect(() => {
    if (showEditModal && formData.departure_time && formData.arrival_time) {
      fetchAvailableFleet(formData.departure_time, formData.arrival_time, editingFlight?.id);
    }
  }, [showEditModal, formData.departure_time, formData.arrival_time]);

  const activeFleet = fleet.filter(a => a.status === 'Active');
  const selectedAircraft = fleet.find(a => a.id === formData.aircraft_id);

  const openEditModal = (flight) => {
    setEditingFlight(flight);
    setFormData({
      airline: flight.airline,
      flight_number: flight.flight_number || '',
      departure_airport_id: flight.departure_airport_id,
      arrival_airport_id: flight.arrival_airport_id,
      departure_time: flight.departure_time?.slice(0, 16) || '',
      arrival_time: flight.arrival_time?.slice(0, 16) || '',
      economy_price: flight.economy_price,
      total_seats: flight.total_seats,
      aircraft_id: flight.aircraft_id || null
    });
    setCurrentStep(3);
    setShowEditModal(true);
  };

  const handleUpdateFlight = async () => {
    if (!editingFlight) return;
    
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/flights/${editingFlight.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setShowEditModal(false);
        resetForm();
        setEditingFlight(null);
        fetchFlights();
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.message || 'Failed to update flight'}`);
      }
    } catch (err) {
      console.error('Failed to update flight:', err);
      alert('Error updating flight');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteFlight = async (flightId) => {
    if (!window.confirm('Are you sure you want to delete this flight? This action cannot be undone.')) {
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/flights/${flightId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        fetchFlights();
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.message || 'Failed to delete flight'}`);
      }
    } catch (err) {
      console.error('Failed to delete flight:', err);
      alert('Error deleting flight');
    } finally {
      setActionLoading(false);
    }
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
            <div className="bg-slate-50 px-3 py-1 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">{activeFleet.length} Active Fleet</div>
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
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] font-black text-primary uppercase tracking-widest">{flight.flight_number || 'SKB-123'}</p>
                          {flight.aircraft_model && (
                            <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                              {flight.aircraft_model} ({flight.tail_number})
                            </span>
                          )}
                        </div>
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
                      <button 
                        onClick={() => openEditModal(flight)}
                        disabled={actionLoading}
                        className="p-2 hover:bg-white hover:shadow-md rounded-lg text-slate-400 hover:text-primary transition-all disabled:opacity-50"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteFlight(flight.id)}
                        disabled={actionLoading}
                        className="p-2 hover:bg-white hover:shadow-md rounded-lg text-slate-400 hover:text-red-500 transition-all disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
                <p className="text-xs text-slate-400 font-bold">Step {currentStep} of 4</p>
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
                      disabled={!formData.departure_time || !formData.arrival_time}
                      onClick={() => {
                        fetchAvailableFleet(formData.departure_time, formData.arrival_time, null);
                        setCurrentStep(4);
                      }}
                      className="bg-primary disabled:opacity-50 text-white font-black text-xs uppercase tracking-widest py-4 px-10 rounded-2xl shadow-xl shadow-blue-100 flex items-center gap-2"
                    >
                      Next Step <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                   <div className="p-4 bg-primary/5 rounded-2xl flex items-start gap-4 border border-primary/10">
                    <div className="p-2 bg-primary rounded-xl text-white"><ShieldCheck className="h-5 w-5" /></div>
                    <div>
                      <p className="font-black text-primary text-[10px] uppercase tracking-widest mb-1">Phase 4</p>
                      <p className="font-bold text-slate-700 text-sm">Assign an available aircraft from the fleet.</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {loadingFleet ? (
                      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto mb-2" />
                        <p className="text-sm font-bold text-slate-500">Checking schedule availability...</p>
                      </div>
                    ) : availableFleet.length > 0 ? availableFleet.map(aircraft => (
                      <div 
                        key={aircraft.id}
                        onClick={() => setFormData({...formData, aircraft_id: aircraft.id, total_seats: aircraft.economy_capacity + aircraft.business_capacity})}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex justify-between items-center ${
                          formData.aircraft_id === aircraft.id 
                            ? 'border-primary bg-primary/5 shadow-md' 
                            : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${formData.aircraft_id === aircraft.id ? 'bg-primary text-white' : 'bg-white text-slate-400'}`}>
                            <Plane className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{aircraft.model}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{aircraft.tail_number}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-slate-800 text-xs">{aircraft.economy_capacity + aircraft.business_capacity} Seats</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">Capacity</p>
                        </div>
                      </div>
                    )) : (
                      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <AlertCircle className="h-8 w-8 text-orange-400 mx-auto mb-2" />
                        <p className="text-sm font-bold text-slate-500">No active aircraft available</p>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase">All active aircraft are busy during this time</p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between pt-4">
                    <button onClick={() => setCurrentStep(3)} className="text-slate-400 font-black text-xs uppercase tracking-widest px-6">Back</button>
                    <button 
                      disabled={!formData.aircraft_id}
                      onClick={handleCreateFlight}
                      className="bg-green-500 disabled:opacity-50 hover:bg-green-600 text-white font-black text-xs uppercase tracking-widest py-4 px-10 rounded-2xl shadow-xl shadow-green-100"
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

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowEditModal(false)}></div>
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl relative z-10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tighter uppercase">Edit Flight Details</h3>
                <p className="text-xs text-slate-400 font-bold">{editingFlight?.flight_number || 'Flight'}</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-white rounded-xl text-slate-400 transition-all"><X className="h-5 w-5" /></button>
            </div>

            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
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
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest">Aircraft Assignment</label>
                  <select 
                    value={formData.aircraft_id || ''}
                    onChange={(e) => {
                      const selectedId = e.target.value === '' ? null : parseInt(e.target.value);
                      const ac = fleet.find(a => a.id === selectedId);
                      setFormData({
                        ...formData, 
                        aircraft_id: selectedId,
                        total_seats: ac ? (ac.economy_capacity + ac.business_capacity) : formData.total_seats
                      });
                    }}
                    className="w-full px-4 py-4 bg-slate-50 border-0 rounded-2xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 transition-all text-sm appearance-none" 
                  >
                    <option value="">-- Select Available Aircraft --</option>
                    {availableFleet.length > 0 ? availableFleet.map(ac => (
                      <option key={ac.id} value={ac.id}>
                        {ac.model} ({ac.tail_number}) - {ac.economy_capacity + ac.business_capacity} seats
                      </option>
                    )) : (
                      <option value="" disabled>No aircraft available for this time</option>
                    )}
                  </select>
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

              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <button 
                  onClick={() => setShowEditModal(false)}
                  disabled={actionLoading}
                  className="flex-1 px-6 py-4 text-slate-600 font-black text-xs uppercase tracking-widest rounded-2xl border-2 border-slate-200 hover:border-slate-300 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpdateFlight}
                  disabled={actionLoading}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-black text-xs uppercase tracking-widest py-4 rounded-2xl shadow-xl shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Updating...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFlights;
