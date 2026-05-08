import React, { useState, useEffect, useContext } from 'react';
import { Plane, Users, ShoppingBag, Plus, Edit2, Trash2, X, Check, Loader2, ShieldCheck, Search, Ticket, QrCode, Mail, ExternalLink, Filter } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'flights');
  const [data, setData] = useState({ flights: [], bookings: [], users: [], tickets: [] });
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useContext(AuthContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFlight, setCurrentFlight] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [now, setNow] = useState(new Date());
  const [stats, setStats] = useState({ total_flights: 0, total_bookings: 0, total_users: 0, total_revenue: 0 });

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const [formData, setFormData] = useState({
    airline: '', departure_city: '', arrival_city: '', 
    departure_time: '', arrival_time: '', economy_price: '', 
    economy_seats: '', business_seats: ''
  });

  const fetchStats = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const result = await res.json();
        setStats(result);
      }
    } catch (err) {
      console.error('Stats fetch error:', err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const endpoints = {
        flights: '/flights',
        bookings: '/admin/bookings',
        users: '/admin/users',
        tickets: '/tickets'
      };
      
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}${endpoints[activeTab]}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          navigate('/login');
          return;
        }
        return;
      }
      
      const result = await res.json();
      setData(prev => ({ ...prev, [activeTab]: result }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchData();
  }, [activeTab]);

  const toggleUserStatus = async (userId) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${import.meta.env.VITE_API_URL || '/api'}/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const getTimeRemaining = (expiresAt) => {
    if (!expiresAt) return null;
    const diff = new Date(expiresAt) - now;
    if (diff <= 0) return 'EXPIRED';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${hours > 0 ? hours + 'h ' : ''}${mins}m ${secs}s left`;
  };

  const updateUserRole = async (userId, newRole) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        fetchData();
      } else {
        const err = await res.json();
        alert(err.message || 'Action failed.');
      }
    } catch (err) {
      console.error('Role update error:', err);
    }
  };

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
        fetchStats();
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
      fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = (flight = null) => {
    if (flight) {
      setCurrentFlight(flight);
      setFormData({
        airline: flight.airline,
        departure_city: flight.departure_city,
        arrival_city: flight.arrival_city,
        departure_time: flight.departure_time.slice(0, 16),
        arrival_time: flight.arrival_time.slice(0, 16),
        economy_price: flight.economy_price,
        economy_seats: flight.economy_seats,
        business_seats: flight.business_seats
      });
    } else {
      setCurrentFlight(null);
      setFormData({
        airline: '', departure_city: '', arrival_city: '', 
        departure_time: '', arrival_time: '', economy_price: '', 
        economy_seats: '', business_seats: ''
      });
    }
    setIsModalOpen(true);
  };

  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminFormData, setAdminFormData] = useState({ name: '', email: '', password: '' });

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/admin/create`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(adminFormData)
      });
      if (res.ok) {
        setIsAdminModalOpen(false);
        setAdminFormData({ name: '', email: '', password: '' });
        fetchData();
        fetchStats();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to create admin.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredData = (data[activeTab] || []).filter(item => {
    const searchLower = searchTerm.toLowerCase();
    if (activeTab === 'flights') return item.airline?.toLowerCase().includes(searchLower) || item.departure_city?.toLowerCase().includes(searchLower);
    if (activeTab === 'bookings') return item.user_name?.toLowerCase().includes(searchLower) || item.pnr?.toLowerCase().includes(searchLower);
    if (activeTab === 'users') return item.name?.toLowerCase().includes(searchLower) || item.email?.toLowerCase().includes(searchLower);
    if (activeTab === 'tickets') return item.passenger_name?.toLowerCase().includes(searchLower) || item.ticket_number?.includes(searchTerm);
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-80 bg-primary text-white p-8 flex flex-col shadow-2xl z-20 sticky top-0 h-screen">
        <Link to="/" className="flex items-center gap-3 mb-12 hover:opacity-80 transition-opacity">
          <div className="bg-accent p-2 rounded-xl">
            <ShieldCheck className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter uppercase italic leading-none">SkyBound</h1>
            <p className="text-[10px] font-black text-accent uppercase tracking-widest mt-1">Global Admin Control</p>
          </div>
        </Link>

        <nav className="space-y-4 flex-grow">
          {[
            { id: 'flights', label: 'Fleet & Flights', icon: Plane },
            { id: 'bookings', label: 'Reservations', icon: ShoppingBag },
            { id: 'tickets', label: 'E-Tickets', icon: Ticket },
            { id: 'users', label: currentUser?.role === 'superadmin' ? 'Team & Passengers' : 'Passengers', icon: Users },
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

          <div className="pt-6 border-t border-white/10 mt-6">
            <button
              onClick={() => navigate('/admin/verify')}
              className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black bg-accent text-primary shadow-xl hover:scale-105 transition-all uppercase tracking-widest text-xs"
            >
              <QrCode className="h-5 w-5" /> Verify Ticket
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-12 overflow-y-auto">
        <header className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tight uppercase mb-2">
              {activeTab} Management
            </h2>
            <p className="text-slate-500 font-bold">Monitor and control your airline operations</p>
          </div>
          
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
              <input 
                type="text" 
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-4 w-72 bg-white border-0 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary outline-none font-bold text-sm"
              />
            </div>
            {activeTab === 'flights' && (
              <button 
                onClick={() => openModal()}
                className="bg-primary hover:bg-blue-800 text-white font-black px-8 py-4 rounded-2xl shadow-xl flex items-center gap-2 transition-all transform hover:-translate-y-1"
              >
                <Plus className="h-5 w-5" /> Add Flight
              </button>
            )}
            {activeTab === 'users' && currentUser?.role === 'superadmin' && (
              <button 
                onClick={() => setIsAdminModalOpen(true)}
                className="bg-accent hover:bg-yellow-500 text-primary font-black px-8 py-4 rounded-2xl shadow-xl flex items-center gap-2 transition-all transform hover:-translate-y-1"
              >
                <Plus className="h-5 w-5" /> Add Admin
              </button>
            )}
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Revenue', value: `$${parseFloat(stats.total_revenue).toLocaleString()}`, icon: ShoppingBag, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Total Bookings', value: stats.total_bookings, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Active Users', value: stats.total_users, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Total Flights', value: stats.total_flights, icon: Plane, color: 'text-orange-600', bg: 'bg-orange-50' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-4">
              <div className={`${stat.bg} p-4 rounded-2xl`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-black text-slate-800 tracking-tighter">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
             <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : (
          <div>
            {activeTab === 'users' && (
              <div className="mb-6 flex justify-between items-center px-4">
                <h3 className="text-xl font-black text-slate-800 uppercase italic">Registered Passengers</h3>
                <div className="bg-primary/5 border border-primary/10 px-6 py-3 rounded-2xl flex items-center gap-3">
                   <ShieldCheck className="h-5 w-5 text-primary" />
                   <div>
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Admin Team Slots</p>
                     <p className="text-sm font-black text-primary uppercase">
                       {data.users.filter(u => u.role === 'admin').length} / 3 Occupied
                     </p>
                   </div>
                </div>
              </div>
            )}
            
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 font-black text-[10px] uppercase text-slate-400">
                    {activeTab === 'flights' && ['Airline', 'Route', 'Economy', 'Business', 'Seats', 'Actions'].map(h => <th key={h} className="p-6">{h}</th>)}
                    {activeTab === 'bookings' && ['ID / PNR', 'Passenger', 'Flight Info', 'Class', 'Total', 'Status', 'Actions'].map(h => <th key={h} className="p-6">{h}</th>)}
                    {activeTab === 'tickets' && ['Ticket No.', 'Passenger', 'PNR', 'Departure', 'Actions'].map(h => <th key={h} className="p-6">{h}</th>)}
                    {activeTab === 'users' && ['Passenger Details', 'Role', 'Status', 'Joined', 'Management'].map(h => <th key={h} className="p-6">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {activeTab === 'users' ? filteredData.map(u => (
                    <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="p-6">
                        <p className="font-bold text-slate-700">{u.name}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </td>
                      <td className="p-6">
                         <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                           u.role === 'superadmin' ? 'bg-purple-50 text-purple-600 border-purple-100' : 
                           u.role === 'admin' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                         }`}>{u.role}</span>
                      </td>
                      <td className="p-6">
                         <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${u.is_blocked ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                           {u.is_blocked ? 'Blocked' : 'Active'}
                         </span>
                      </td>
                      <td className="p-6 text-xs text-slate-400">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="p-6">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => toggleUserStatus(u.id)}
                            title={u.is_blocked ? 'Unblock User' : 'Block User'}
                            className={`p-2 rounded-lg transition-colors ${u.is_blocked ? 'text-green-500 hover:bg-green-50' : 'text-red-500 hover:bg-red-50'}`}
                          >
                            <ShieldCheck className="h-4 w-4" />
                          </button>
                          
                          {currentUser?.role === 'superadmin' && u.role !== 'superadmin' && (
                            <button 
                              onClick={() => updateUserRole(u.id, u.role === 'admin' ? 'user' : 'admin')}
                              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all shadow-sm ${
                                u.role === 'admin' 
                                  ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                                  : 'bg-primary text-white hover:bg-blue-800'
                              }`}
                            >
                              {u.role === 'admin' ? 'Demote' : 'Promote'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )) : filteredData.map(item => (
                    <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      {activeTab === 'flights' && (
                        <>
                          <td className="p-6 font-bold text-slate-700">{item.airline}</td>
                          <td className="p-6">
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{item.departure_city}</span> 
                              <Plane className="h-3 w-3 text-slate-300" />
                              <span className="font-bold">{item.arrival_city}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(item.departure_time).toLocaleString()}</p>
                          </td>
                          <td className="p-6 font-black text-slate-700">${item.economy_price}</td>
                          <td className="p-6 font-black text-primary">${(parseFloat(item.economy_price) * 1.1).toFixed(2)}</td>
                          <td className="p-6 font-bold text-slate-500">{item.available_seats} / {item.total_seats}</td>
                          <td className="p-6">
                            <div className="flex gap-2">
                              <button onClick={() => openModal(item)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="h-4 w-4" /></button>
                              <button onClick={() => deleteFlight(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="h-4 w-4" /></button>
                            </div>
                          </td>
                        </>
                      )}
                      {activeTab === 'bookings' && (
                        <>
                          <td className="p-6">
                            <div className="font-black text-slate-800">#SB-{item.id}</div>
                            <div className="text-[10px] font-black text-primary uppercase tracking-widest">{item.pnr}</div>
                          </td>
                          <td className="p-6">
                            <div className="font-bold text-slate-700">{item.user_name}</div>
                            <div className="text-xs text-slate-400">{item.user_email}</div>
                          </td>
                          <td className="p-6">
                            <div className="font-bold text-slate-700">{item.airline}</div>
                            <div className="text-xs text-slate-400 uppercase tracking-tighter">{item.departure_city} → {item.arrival_city}</div>
                          </td>
                          <td className="p-6">
                            <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg ${item.cabin_class === 'Business' ? 'bg-accent text-primary' : 'bg-slate-100 text-slate-600'}`}>
                              {item.cabin_class}
                            </span>
                          </td>
                          <td className="p-6 font-black text-primary">${item.total_price}</td>
                          <td className="p-6">
                             <div className="flex flex-col gap-1">
                               <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border w-fit ${
                                 item.status === 'confirmed' ? 'bg-green-50 text-green-600 border-green-100' : 
                                 item.status === 'cancelled' ? 'bg-red-50 text-red-600 border-red-100' : 
                                 item.status === 'completed' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                               }`}>{item.status}</span>
                               {item.status === 'pending' && (
                                 <span className="text-[9px] font-black text-red-500 uppercase tracking-tighter ml-1 italic">
                                   {getTimeRemaining(item.expires_at)}
                                 </span>
                               )}
                             </div>
                          </td>
                          <td className="p-6">
                            <button onClick={() => navigate(`/ticket/${item.id}`)} className="p-2 text-slate-400 hover:text-primary transition-colors">
                              <ExternalLink className="h-5 w-5" />
                            </button>
                          </td>
                        </>
                      )}
                      {activeTab === 'tickets' && (
                        <>
                          <td className="p-6 font-black text-slate-800">{item.ticket_number}</td>
                          <td className="p-6">
                             <div className="font-bold text-slate-700 uppercase">{item.passenger_name}</div>
                             <div className="text-xs text-slate-400">{item.passenger_email}</div>
                          </td>
                          <td className="p-6 font-black text-primary">{item.pnr}</td>
                          <td className="p-6">
                             <div className="font-bold text-slate-700">{item.departure_iata} → {item.arrival_iata}</div>
                             <div className="text-[10px] text-slate-400 font-bold uppercase">{new Date(item.boarding_time).toLocaleString()}</div>
                          </td>
                          <td className="p-6">
                             <div className="flex gap-2">
                               <button 
                                 onClick={() => resendTicket(item.id)}
                                 className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                               >
                                 <Mail className="h-4 w-4" />
                               </button>
                               <a 
                                 href={`${import.meta.env.VITE_API_URL || '/api'}/tickets/${item.id}/pdf`}
                                 target="_blank" rel="noreferrer"
                                 className="p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-800 hover:text-white transition-all shadow-sm"
                               >
                                 <ExternalLink className="h-4 w-4" />
                               </a>
                             </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredData.length === 0 && (
                <div className="p-20 text-center flex flex-col items-center">
                  <Search className="h-12 w-12 text-slate-200 mb-4" />
                  <p className="text-slate-400 font-bold italic">No matching results found in {activeTab}.</p>
                </div>
              )}
            </div>
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
            <form onSubmit={handleFlightSubmit} className="p-8 grid grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
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
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Economy Price ($)</label>
                 <input 
                   required
                   type="number" value={formData.economy_price} onChange={e => setFormData({...formData, economy_price: e.target.value})}
                   className="w-full bg-slate-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-primary outline-none font-bold"
                 />
               </div>
               <div>
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 text-accent">Business Price (VIP - AUTO 10%)</label>
                 <div className="w-full bg-slate-100 border-0 rounded-2xl p-4 font-black text-primary">
                   ${(parseFloat(formData.economy_price || 0) * 1.1).toFixed(2)}
                 </div>
               </div>
               <div>
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Economy Seats</label>
                 <input 
                   required
                   type="number" value={formData.economy_seats} onChange={e => setFormData({...formData, economy_seats: e.target.value})}
                   className="w-full bg-slate-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-primary outline-none font-bold"
                 />
               </div>
               <div>
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Business Seats (VIP)</label>
                 <input 
                   required
                   type="number" value={formData.business_seats} onChange={e => setFormData({...formData, business_seats: e.target.value})}
                   className="w-full bg-slate-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-primary outline-none font-bold"
                 />
               </div>
               <button className="col-span-2 bg-primary hover:bg-blue-800 text-white font-black py-5 rounded-2xl shadow-xl mt-4 transition-all active:scale-95">
                 {currentFlight ? 'Save Changes' : 'Create Flight'}
               </button>
            </form>
          </div>
        </div>
      )}

      {/* Admin Creation Modal */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-accent p-8 flex justify-between items-center text-primary">
              <h3 className="text-2xl font-black uppercase tracking-tight">Create New Admin</h3>
              <button onClick={() => setIsAdminModalOpen(false)} className="p-2 hover:bg-black/5 rounded-full"><X className="h-6 w-6" /></button>
            </div>
            <form onSubmit={handleAdminSubmit} className="p-8 space-y-6">
               <div>
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                 <input 
                   required
                   type="text" value={adminFormData.name} onChange={e => setAdminFormData({...adminFormData, name: e.target.value})}
                   className="w-full bg-slate-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-accent outline-none font-bold"
                 />
               </div>
               <div>
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                 <input 
                   required
                   type="email" value={adminFormData.email} onChange={e => setAdminFormData({...adminFormData, email: e.target.value})}
                   className="w-full bg-slate-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-accent outline-none font-bold"
                 />
               </div>
               <div>
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Secure Password</label>
                 <input 
                   required
                   type="password" value={adminFormData.password} onChange={e => setAdminFormData({...adminFormData, password: e.target.value})}
                   className="w-full bg-slate-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-accent outline-none font-bold"
                 />
               </div>
               <button className="w-full bg-primary text-white font-black py-5 rounded-2xl shadow-xl mt-4 transition-all active:scale-95">
                 Create Admin Account
               </button>
               <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest">Limit: 3 Admins Maximum</p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
