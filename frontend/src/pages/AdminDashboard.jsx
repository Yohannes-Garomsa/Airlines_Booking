import React, { useState, useEffect } from 'react';
import { Plane, Users, ShoppingBag, Plus, Edit2, Trash2, X, Check, Loader2, ShieldCheck, Search } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('flights');
  const [data, setData] = useState({ flights: [], bookings: [], users: [] });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFlight, setCurrentFlight] = useState(null);
  const [formData, setFormData] = useState({
    airline: '', departure_city: '', arrival_city: '', 
    departure_time: '', arrival_time: '', price: '', seats_available: ''
  });

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const endpoints = {
        flights: '/flights',
        bookings: '/bookings',
        users: '/users'
      };
      
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}${endpoints[activeTab]}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      setData(prev => ({ ...prev, [activeTab]: result }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleFlightSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const method = currentFlight ? 'PUT' : 'POST';
    const url = currentFlight 
      ? `${import.meta.env.VITE_API_URL || '/api'}/flights/${currentFlight.id}`
      : `${import.meta.env.VITE_API_URL || '/api'}/flights`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteFlight = async (id) => {
    if (!window.confirm('Delete this flight?')) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`${import.meta.env.VITE_API_URL || '/api'}/flights/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = (flight = null) => {
    if (flight) {
      setCurrentFlight(flight);
      setFormData({
        ...flight,
        departure_time: flight.departure_time.slice(0, 16),
        arrival_time: flight.arrival_time.slice(0, 16)
      });
    } else {
      setCurrentFlight(null);
      setFormData({
        airline: '', departure_city: '', arrival_city: '', 
        departure_time: '', arrival_time: '', price: '', seats_available: ''
      });
    }
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-primary text-white p-8 flex flex-col shadow-2xl z-20">
        <div className="flex items-center gap-3 mb-12">
          <div className="bg-accent p-2 rounded-xl">
            <ShieldCheck className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter uppercase italic">Admin Panel</h1>
        </div>

        <nav className="space-y-4 flex-grow">
          {[
            { id: 'flights', label: 'Flights', icon: Plane },
            { id: 'bookings', label: 'Bookings', icon: ShoppingBag },
            { id: 'users', label: 'Users', icon: Users },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${
                activeTab === tab.id ? 'bg-white text-primary shadow-lg scale-105' : 'hover:bg-white/10'
              }`}
            >
              <tab.icon className="h-5 w-5" /> {tab.label}
            </button>
          ))}
        </nav>

        <div className="pt-8 border-t border-white/10 mt-auto">
          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest text-center">
            SkyBound Fleet v2.0
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-12">
          <h2 className="text-4xl font-black text-slate-800 tracking-tight uppercase">
            Manage {activeTab}
          </h2>
          {activeTab === 'flights' && (
            <button 
              onClick={() => openModal()}
              className="bg-primary hover:bg-blue-800 text-white font-black px-8 py-4 rounded-2xl shadow-xl flex items-center gap-2 transition-all transform hover:-translate-y-1"
            >
              <Plus className="h-5 w-5" /> Add Flight
            </button>
          )}
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
             <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {activeTab === 'flights' && ['Airline', 'Route', 'Price', 'Seats', 'Actions'].map(h => <th key={h} className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>)}
                  {activeTab === 'bookings' && ['ID', 'User', 'Flight', 'Amount', 'Status'].map(h => <th key={h} className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>)}
                  {activeTab === 'users' && ['Name', 'Email', 'Role', 'Joined'].map(h => <th key={h} className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {activeTab === 'flights' && data.flights.map(f => (
                  <tr key={f.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="p-6 font-bold text-slate-700">{f.airline}</td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{f.departure_city}</span> 
                        <Plane className="h-3 w-3 text-slate-300" />
                        <span className="font-bold">{f.arrival_city}</span>
                      </div>
                    </td>
                    <td className="p-6 font-black text-primary">${f.price}</td>
                    <td className="p-6 font-bold text-slate-500">{f.seats_available}</td>
                    <td className="p-6">
                      <div className="flex gap-2">
                        <button onClick={() => openModal(f)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 className="h-4 w-4" /></button>
                        <button onClick={() => deleteFlight(f.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {activeTab === 'bookings' && data.bookings.map(b => (
                  <tr key={b.id} className="border-b border-slate-50">
                    <td className="p-6 font-bold text-slate-400">#SB-{b.id}</td>
                    <td className="p-6 font-bold text-slate-700">{b.user_name}</td>
                    <td className="p-6 text-sm">
                      <span className="font-bold">{b.airline}</span>
                      <p className="text-xs text-slate-400">{b.departure_city} → {b.arrival_city}</p>
                    </td>
                    <td className="p-6 font-black text-primary">${b.total_price}</td>
                    <td className="p-6">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                         b.status === 'confirmed' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
                       }`}>{b.status}</span>
                    </td>
                  </tr>
                ))}
                {activeTab === 'users' && data.users.map(u => (
                  <tr key={u.id} className="border-b border-slate-50">
                    <td className="p-6 font-bold text-slate-700">{u.name}</td>
                    <td className="p-6 text-slate-500">{u.email}</td>
                    <td className="p-6">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                         u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                       }`}>{u.role}</span>
                    </td>
                    <td className="p-6 text-xs text-slate-400">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Flight Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-primary p-8 flex justify-between items-center text-white">
              <h3 className="text-2xl font-black uppercase tracking-tight">{currentFlight ? 'Edit Flight' : 'Add New Flight'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full"><X className="h-6 w-6" /></button>
            </div>
            <form onSubmit={handleFlightSubmit} className="p-8 grid grid-cols-2 gap-6">
               <div className="col-span-2">
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Airline Name</label>
                 <input 
                   required
                   type="text" value={formData.airline} onChange={e => setFormData({...formData, airline: e.target.value})}
                   className="w-full bg-slate-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-primary outline-none font-bold"
                 />
               </div>
               <div>
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Departure City</label>
                 <input 
                   required
                   type="text" value={formData.departure_city} onChange={e => setFormData({...formData, departure_city: e.target.value})}
                   className="w-full bg-slate-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-primary outline-none font-bold"
                 />
               </div>
               <div>
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Arrival City</label>
                 <input 
                   required
                   type="text" value={formData.arrival_city} onChange={e => setFormData({...formData, arrival_city: e.target.value})}
                   className="w-full bg-slate-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-primary outline-none font-bold"
                 />
               </div>
               <div>
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Departure Time</label>
                 <input 
                   required
                   type="datetime-local" value={formData.departure_time} onChange={e => setFormData({...formData, departure_time: e.target.value})}
                   className="w-full bg-slate-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-primary outline-none font-bold"
                 />
               </div>
               <div>
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Arrival Time</label>
                 <input 
                   required
                   type="datetime-local" value={formData.arrival_time} onChange={e => setFormData({...formData, arrival_time: e.target.value})}
                   className="w-full bg-slate-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-primary outline-none font-bold"
                 />
               </div>
               <div>
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Price ($)</label>
                 <input 
                   required
                   type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                   className="w-full bg-slate-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-primary outline-none font-bold"
                 />
               </div>
               <div>
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Available Seats</label>
                 <input 
                   required
                   type="number" value={formData.seats_available} onChange={e => setFormData({...formData, seats_available: e.target.value})}
                   className="w-full bg-slate-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-primary outline-none font-bold"
                 />
               </div>
               <button className="col-span-2 bg-primary hover:bg-blue-800 text-white font-black py-5 rounded-2xl shadow-xl mt-4">
                 {currentFlight ? 'Save Changes' : 'Create Flight'}
               </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
