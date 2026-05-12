import React, { useState, useEffect, useContext } from 'react';
import {
  Plane, Users, ShoppingBag, Plus, Edit2, Trash2, X, Check, Loader2,
  ShieldCheck, Search, Ticket, QrCode, Mail, ExternalLink, Filter,
  LayoutDashboard, Grid, CheckCircle2, CreditCard, Wrench, Map,
  BarChart3, Bell, ChevronRight, LogOut, Settings, Info, TrendingUp, AlertCircle, Clock, MapPin, DollarSign
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import AdminOverview from '../components/admin/AdminOverview';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [data, setData] = useState({
    flights: [], bookings: [], users: [], tickets: [],
    fleet: [], seats: [], airports: [],
    payments: [], analytics: { popularRoutes: [], revenueTrend: [] }, notifications: []
  });
  const [loading, setLoading] = useState(true);
  const { user: currentUser, logout } = useContext(AuthContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'flight'
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [now, setNow] = useState(new Date());
  const [stats, setStats] = useState({});
  const [selectedFlightForSeats, setSelectedFlightForSeats] = useState(null);

  // Flight Form State
  const [flightForm, setFlightForm] = useState({
    airline: '', flight_number: '', departure_airport_id: '', arrival_airport_id: '',
    departure_time: '', arrival_time: '', economy_price: '',
    total_seats: '180', status: 'Scheduled', gate: '', terminal: ''
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

      const endpoint = endpoints[activeTab === 'flights' ? 'flights' : activeTab];

      if (activeTab === 'seats') {
        if (!selectedFlightForSeats && data.flights.length > 0) {
          setSelectedFlightForSeats(data.flights[0].id);
        }
        if (selectedFlightForSeats) {
          const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/admin/seats/${selectedFlightForSeats}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const result = await res.json();
            setData(prev => ({ ...prev, seats: result }));
          }
        }
        setLoading(false);
        return;
      }

      // Pre-fetch airports for flight form
      if (activeTab === 'flights' && data.airports.length === 0) {
        const airRes = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/airports`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (airRes.ok) {
          const airResult = await airRes.json();
          setData(prev => ({ ...prev, airports: airResult }));
        }
      }

      if (!endpoint) {
        setLoading(false);
        return;
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const result = await res.json();
        setData(prev => ({ ...prev, [activeTab]: result }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (data.flights.length === 0) {
      const fetchFlights = async () => {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/flights`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const result = await res.json();
          setData(prev => ({ ...prev, flights: result }));
        }
      };
      fetchFlights();
    }
    fetchStats();
    fetchData();
  }, [activeTab, selectedFlightForSeats]);

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

  const toggleAircraftStatus = async (aircraftId) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${import.meta.env.VITE_API_URL || '/api'}/admin/fleet/${aircraftId}/maintenance`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFlightSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const method = selectedItem ? 'PUT' : 'POST';
    const url = selectedItem
      ? `${import.meta.env.VITE_API_URL || '/api'}/admin/flights/${selectedItem.id}`
      : `${import.meta.env.VITE_API_URL || '/api'}/admin/flights`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(flightForm)
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
        setFlightForm({
          airline: '', flight_number: '', departure_airport_id: '', arrival_airport_id: '',
          departure_time: '', arrival_time: '', economy_price: '',
          total_seats: '180', status: 'Scheduled', gate: '', terminal: ''
        });
        setSelectedItem(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteFlight = async (flightId) => {
    if (!window.confirm('Terminate this flight record from the active grid?')) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`${import.meta.env.VITE_API_URL || '/api'}/admin/flights/${flightId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteAirport = async (id) => {
    if (!window.confirm('Delete this airport? This might affect existing flights.')) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`${import.meta.env.VITE_API_URL || '/api'}/admin/airports/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAirportSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/admin/airports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(airportFormData)
      });
      if (res.ok) {
        setIsAirportModalOpen(false);
        setAirportFormData({ name: '', city: '', country: '', iata_code: '', icao_code: '' });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllAirports = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/admin/airports`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const result = await res.json();
        setAllAirports(result);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = (flight = null) => {
    if (flight) {
      setFlightForm({
        airline: flight.airline,
        departure_city: flight.departure_city,
        arrival_city: flight.arrival_city,
        departure_time: flight.departure_time.slice(0, 16),
        arrival_time: flight.arrival_time.slice(0, 16),
        economy_price: flight.economy_price,
        total_seats: flight.total_seats,
        status: flight.status,
        gate: flight.gate || '',
        terminal: flight.terminal || ''
      });
      setSelectedItem(flight);
    } else {
      setCurrentFlight(null);
      setFormData({
        airline: '', departure_city: '', arrival_city: '',
        departure_time: '', arrival_time: '', economy_price: '',
        economy_seats: '', business_seats: ''
      });
      setSelectedItem(null);
    }
    setModalType('flight');
    setIsModalOpen(true);
  };

  const menuItems = [
    { id: 'overview', label: 'Control Room', icon: LayoutDashboard },
    { id: 'flights', label: 'Flight Ops', icon: Plane },
    { id: 'bookings', label: 'Reservations', icon: ShoppingBag },
    { id: 'users', label: 'Passengers', icon: Users },
    { id: 'tickets', label: 'E-Ticketing', icon: Ticket },
    { id: 'seats', label: 'Seat Matrix', icon: Grid },
    { id: 'payments', label: 'Revenue & FX', icon: CreditCard },
    { id: 'fleet', label: 'Fleet Mgmt', icon: Wrench },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'notifications', label: 'Alert Center', icon: Bell },
  ];

  const filteredData = (Array.isArray(data[activeTab]) ? data[activeTab] : []).filter(item => {
    const searchLower = searchTerm.toLowerCase();
    if (activeTab === 'flights') return item.airline?.toLowerCase().includes(searchLower) || item.departure_city?.toLowerCase().includes(searchLower) || item.flight_number?.toLowerCase().includes(searchLower);
    if (activeTab === 'bookings') return item.user_name?.toLowerCase().includes(searchLower) || item.pnr?.toLowerCase().includes(searchLower);
    if (activeTab === 'users') return item.name?.toLowerCase().includes(searchLower) || item.email?.toLowerCase().includes(searchLower);
    if (activeTab === 'tickets') return item.passenger_name?.toLowerCase().includes(searchLower) || item.ticket_number?.includes(searchTerm);
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-inter">
      {/* Sidebar */}
      <aside className="w-80 bg-[#0F172A] text-slate-400 p-8 flex flex-col shadow-2xl z-20 sticky top-0 h-screen overflow-y-auto scrollbar-hide">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="bg-primary p-2.5 rounded-2xl shadow-lg shadow-primary/20">
            <Plane className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter uppercase italic text-white leading-none">SkyBound</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Global Command Hub</p>
          </div>
        </div>

        <nav className="space-y-4 flex-grow">
          {[
            { id: 'flights', label: 'Fleet & Flights', icon: Plane },
            { id: 'bookings', label: 'Reservations', icon: ShoppingBag },
            { id: 'tickets', label: 'E-Tickets', icon: Ticket },
            { id: 'users', label: currentUser?.role === 'superadmin' ? 'Team & Passengers' : 'Passengers', icon: Users },
          ].map(tab => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all group ${activeTab === item.id
                  ? 'bg-primary text-white shadow-xl shadow-primary/20'
                  : 'hover:bg-white/5 hover:text-white'
                }`}
            >
              <item.icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${activeTab === item.id ? 'text-white' : 'text-slate-500 group-hover:text-primary'}`} />
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="pt-8 border-t border-slate-800/50 mt-8 space-y-4">
          <button onClick={logout} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-red-400 hover:bg-red-500/10 transition-all">
            <LogOut className="h-5 w-5" /> <span className="text-sm">Signal Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Mission Control */}
      <main className="flex-grow p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-12">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">
            {menuItems.find(m => m.id === activeTab)?.label}
          </h2>

          <div className="flex gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder={`Query ${activeTab}...`}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-12 pr-6 py-4 w-80 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none font-bold text-sm focus:border-primary transition-all"
              />
            </div>
            {activeTab === 'flights' && (
              <button
                onClick={() => openFlightModal()}
                className="bg-primary hover:bg-blue-800 text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-primary/20 flex items-center gap-2 transition-all transform hover:-translate-y-1 active:scale-95"
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

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="mt-6 font-black text-slate-400 uppercase tracking-widest text-[10px]">Syncing Data Links...</p>
          </div>
        ) : (
          <div className="space-y-12">
            {activeTab === 'overview' && <AdminOverview stats={stats} />}

            {activeTab === 'analytics' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
                  <h3 className="text-xl font-black uppercase tracking-tight mb-8 flex items-center gap-3">
                    <TrendingUp className="h-6 w-6 text-primary" /> Popular Routes
                  </h3>
                  <div className="space-y-6">
                    {data.analytics?.popularRoutes?.length > 0 ? data.analytics.popularRoutes.map((route, i) => (
                      <div key={i} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:scale-[1.02] transition-all">
                        <div className="flex items-center gap-6">
                          <span className="text-2xl font-black text-slate-300">0{i + 1}</span>
                          <div>
                            <p className="font-black text-slate-800 uppercase tracking-tight">{route.departure_city} → {route.arrival_city}</p>
                            <p className="text-xs font-bold text-slate-400">Total Bookings: {route.booking_count}</p>
                          </div>
                        </div>
                        <div className="h-2 w-24 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${(route.booking_count / (data.analytics.popularRoutes[0]?.booking_count || 1)) * 100}%` }}></div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-20 text-slate-400 font-bold">No trending routes yet.</div>
                    )}
                  </div>
                </div>
                <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-[100px] rounded-full"></div>
                  <h3 className="text-xl font-black uppercase tracking-tight mb-8 relative z-10 flex items-center gap-3">
                    <CreditCard className="h-6 w-6 text-accent" /> Revenue Velocity
                  </h3>
                  <div className="space-y-4 relative z-10">
                    {data.analytics?.revenueTrend?.length > 0 ? (
                      <div className="flex items-end gap-2 h-16">
                        {data.analytics.revenueTrend.slice(-12).map((trend, i) => (
                          <div key={i} className="bg-accent/20 w-full rounded-t-lg transition-all hover:bg-accent" style={{ height: `${(trend.daily_revenue / (Math.max(...data.analytics.revenueTrend.map(t => t.daily_revenue)) || 1)) * 100}%` }}></div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-16 flex items-center justify-center text-slate-500 text-[10px] font-black uppercase">Data Buffer Empty</div>
                    )}
                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 mt-4">
                      <span>30 Days Ago</span>
                      <span>Today</span>
                    </div>
                  </div>
                  <div className="mt-12 p-8 bg-white/5 rounded-[2rem] border border-white/10">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Projected Monthly</p>
                    <p className="text-4xl font-black text-accent">${(parseFloat(stats.total_revenue || 0) * 1.2).toLocaleString()}</p>
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
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${u.role === 'superadmin' ? 'bg-purple-50 text-purple-600 border-purple-100' :
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
                              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all shadow-sm ${u.role === 'admin'
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
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${item.status === 'confirmed' ? 'bg-green-50 text-green-600 border-green-100' :
                                item.status === 'cancelled' ? 'bg-red-50 text-red-600 border-red-100' :
                                  item.status === 'completed' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                              }`}>{item.status}</span>
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
                  type="text" value={formData.airline} onChange={e => setFormData({ ...formData, airline: e.target.value })}
                  className="w-full bg-slate-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-primary outline-none font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Departure City</label>
                <input
                  required
                  type="text" value={formData.departure_city} onChange={e => setFormData({ ...formData, departure_city: e.target.value })}
                  className="w-full bg-slate-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-primary outline-none font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Arrival City</label>
                <input
                  required
                  type="text" value={formData.arrival_city} onChange={e => setFormData({ ...formData, arrival_city: e.target.value })}
                  className="w-full bg-slate-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-primary outline-none font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Departure Time</label>
                <input
                  required
                  type="datetime-local" value={formData.departure_time} onChange={e => setFormData({ ...formData, departure_time: e.target.value })}
                  className="w-full bg-slate-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-primary outline-none font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Arrival Time</label>
                <input
                  required
                  type="datetime-local" value={formData.arrival_time} onChange={e => setFormData({ ...formData, arrival_time: e.target.value })}
                  className="w-full bg-slate-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-primary outline-none font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Economy Price ($)</label>
                <input
                  required
                  type="number" value={formData.economy_price} onChange={e => setFormData({ ...formData, economy_price: e.target.value })}
                  className="w-full bg-slate-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-primary outline-none font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 text-accent">Business Price (VIP - AUTO 10%)</label>
                <div className="w-full bg-slate-100 border-0 rounded-2xl p-4 font-black text-primary">
                  ${(parseFloat(formData.economy_price || 0) * 1.1).toFixed(2)}
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-4 tracking-widest">Economy Tariff ($)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                      <input
                        required
                        type="number"
                        placeholder="450.00"
                        value={flightForm.economy_price}
                        onChange={e => setFlightForm({ ...flightForm, economy_price: e.target.value })}
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-primary font-bold text-sm"
                      />
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 ml-4 italic">* Business price auto-calculated (+10%)</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-4 tracking-widest">Total Payload (Seats)</label>
                    <input
                      required
                      type="number"
                      value={flightForm.total_seats}
                      onChange={e => setFlightForm({ ...flightForm, total_seats: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-primary font-bold text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-4 tracking-widest">Terminal</label>
                    <input
                      type="text"
                      placeholder="T1"
                      value={flightForm.terminal}
                      onChange={e => setFlightForm({ ...flightForm, terminal: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-primary font-bold text-sm uppercase"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-4 tracking-widest">Gate</label>
                    <input
                      type="text"
                      placeholder="B2"
                      value={flightForm.gate}
                      onChange={e => setFlightForm({ ...flightForm, gate: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-primary font-bold text-sm uppercase"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-4 tracking-widest">Status</label>
                    <select
                      required
                      value={flightForm.status}
                      onChange={e => setFlightForm({ ...flightForm, status: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-primary font-bold text-sm appearance-none"
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="In-Air">In-Air</option>
                      <option value="Delayed">Delayed</option>
                      <option value="Landed">Landed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="pt-6">
                  <button type="submit" className="w-full py-5 bg-primary text-white font-black uppercase tracking-[0.2em] rounded-3xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                    {selectedItem ? 'Update Flight' : 'Add Flight'}
                  </button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
