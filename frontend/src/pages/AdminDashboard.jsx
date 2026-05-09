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

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
        tickets: '/tickets',
        fleet: '/admin/fleet',
        payments: '/admin/payments',
        analytics: '/admin/analytics',
        notifications: '/admin/notifications',
        airports: '/airports'
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

  const openFlightModal = (flight = null) => {
    if (flight) {
      setFlightForm({
        airline: flight.airline,
        flight_number: flight.flight_number,
        departure_airport_id: flight.departure_airport_id,
        arrival_airport_id: flight.arrival_airport_id,
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
      setFlightForm({
        airline: '', flight_number: '', departure_airport_id: '', arrival_airport_id: '',
        departure_time: '', arrival_time: '', economy_price: '',
        total_seats: '180', status: 'Scheduled', gate: '', terminal: ''
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
    if (activeTab === 'payments') return item.pnr?.toLowerCase().includes(searchLower) || item.user_name?.toLowerCase().includes(searchLower);
    if (activeTab === 'fleet') return item.tail_number?.toLowerCase().includes(searchLower) || item.model?.toLowerCase().includes(searchLower);
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

        <nav className="space-y-1 flex-grow">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all group ${
                activeTab === item.id 
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
            {activeTab === 'seats' && (
              <select 
                value={selectedFlightForSeats || ''} 
                onChange={(e) => setSelectedFlightForSeats(e.target.value)}
                className="px-6 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm font-bold text-sm outline-none focus:border-primary transition-all"
              >
                {data.flights.map(f => (
                  <option key={f.id} value={f.id}>{f.flight_number} - {f.departure_city} to {f.arrival_city}</option>
                ))}
              </select>
            )}
            {activeTab === 'fleet' && (
              <button className="bg-primary hover:bg-blue-800 text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-primary/20 flex items-center gap-2 transition-all transform hover:-translate-y-1 active:scale-95">
                <Plus className="h-5 w-5" /> Add Aircraft
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
                              <span className="text-2xl font-black text-slate-300">0{i+1}</span>
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

            {activeTab === 'notifications' && (
              <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm max-w-4xl mx-auto">
                 <div className="flex justify-between items-center mb-10">
                    <h3 className="text-2xl font-black uppercase tracking-tight">System Alert Logs</h3>
                    <button className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-black px-6 py-3 rounded-2xl text-[10px] uppercase transition-all">Clear All Logs</button>
                 </div>
                 <div className="space-y-6">
                    {data.notifications.map((notif, i) => (
                      <div key={i} className="flex gap-6 p-6 rounded-3xl border border-slate-100 hover:bg-slate-50 transition-all group">
                         <div className={`p-4 rounded-2xl h-fit ${notif.type === 'error' ? 'bg-red-50 text-red-500' : notif.type === 'warning' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500'}`}>
                            <AlertCircle className="h-6 w-6" />
                         </div>
                         <div className="flex-grow">
                            <div className="flex justify-between items-start mb-2">
                               <p className="font-black text-slate-800 uppercase tracking-tight">{notif.title || 'System Notification'}</p>
                               <span className="text-[10px] font-black text-slate-400 uppercase">{new Date(notif.created_at).toLocaleTimeString()}</span>
                            </div>
                            <p className="text-sm font-bold text-slate-500 leading-relaxed">{notif.message}</p>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            )}

            {activeTab === 'seats' && (
              <div className="bg-white rounded-[3rem] p-12 border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-12">
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Aircraft Seat Matrix</h3>
                    <p className="text-sm font-bold text-slate-400">Flight Telemetry: {data.flights.find(f => f.id == selectedFlightForSeats)?.flight_number}</p>
                  </div>
                  <div className="flex gap-6">
                    <div className="flex items-center gap-2"><div className="w-4 h-4 bg-slate-100 rounded-md border border-slate-200"></div> <span className="text-xs font-black uppercase text-slate-500">Available</span></div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 bg-primary rounded-md"></div> <span className="text-xs font-black uppercase text-slate-500">Occupied</span></div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 bg-accent/20 border-2 border-accent/50 rounded-md"></div> <span className="text-xs font-black uppercase text-slate-500">Business</span></div>
                  </div>
                </div>

                <div className="max-w-4xl mx-auto">
                   <div className="w-full h-12 bg-slate-50 rounded-t-[3rem] mb-12 border-b-4 border-slate-200 flex items-center justify-center">
                      <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Flight Deck / Cockpit</span>
                   </div>
                   
                   <div className="grid grid-cols-7 gap-4 p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className={`text-center font-black text-slate-300 text-xs py-2 ${i === 3 ? 'col-start-5' : ''}`}>
                          {['A', 'B', 'C', 'D', 'E', 'F'][i]}
                        </div>
                      ))}

                      {Array.from({ length: Math.ceil(data.seats.length / 6) }).map((_, rowIndex) => (
                        <React.Fragment key={rowIndex}>
                          {data.seats.slice(rowIndex * 6, (rowIndex + 1) * 6).map((seat, i) => (
                            <React.Fragment key={seat.id}>
                              <div 
                                className={`aspect-square rounded-xl flex items-center justify-center text-[10px] font-black transition-all cursor-pointer relative group ${
                                  seat.is_occupied 
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                                    : seat.seat_number.startsWith('1') || seat.seat_number.startsWith('2')
                                      ? 'bg-accent/20 text-primary border-2 border-accent/50'
                                      : 'bg-white text-slate-400 border border-slate-200 hover:border-primary hover:text-primary'
                                }`}
                              >
                                {seat.seat_number}
                                {seat.is_occupied && (
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white p-3 rounded-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl border border-white/10">
                                     <p className="font-black uppercase text-[10px] text-accent mb-1">Occupied</p>
                                     <p className="font-bold text-xs">{seat.passenger_name}</p>
                                     <p className="text-[10px] text-slate-400 font-bold">PNR: {seat.pnr}</p>
                                  </div>
                                )}
                              </div>
                              {i === 2 && <div className="flex items-center justify-center font-black text-slate-300 text-[10px]">{rowIndex + 1}</div>}
                            </React.Fragment>
                          ))}
                        </React.Fragment>
                      ))}
                   </div>
                </div>
              </div>
            )}

            {['flights', 'bookings', 'users', 'tickets', 'fleet', 'payments'].includes(activeTab) && (
              <div className="bg-white rounded-[3rem] shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100 font-black text-[10px] uppercase text-slate-400">
                      {activeTab === 'flights' && ['No.', 'Airline', 'Route', 'Economy', 'Business', 'Seats', 'Actions'].map(h => <th key={h} className="p-8">{h}</th>)}
                      {activeTab === 'bookings' && ['ID / PNR', 'Passenger', 'Flight Info', 'Class', 'Total', 'Status', 'Actions'].map(h => <th key={h} className="p-8">{h}</th>)}
                      {activeTab === 'tickets' && ['Ticket No.', 'Passenger', 'PNR', 'Departure', 'Actions'].map(h => <th key={h} className="p-8">{h}</th>)}
                      {activeTab === 'users' && ['Passenger Details', 'Role', 'Status', 'Joined', 'Management'].map(h => <th key={h} className="p-8">{h}</th>)}
                      {activeTab === 'fleet' && ['Tail Number', 'Model', 'Capacity', 'Status', 'Last Check', 'Actions'].map(h => <th key={h} className="p-8">{h}</th>)}
                      {activeTab === 'payments' && ['Trans ID', 'User / PNR', 'Amount', 'Method', 'Status', 'Date'].map(h => <th key={h} className="p-8">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item, idx) => (
                      <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                        {activeTab === 'users' && (
                          <>
                            <td className="p-8"><div className="flex items-center gap-4"><div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-400 text-xs">{item.name.charAt(0)}</div><div><p className="font-bold text-slate-800">{item.name}</p><p className="text-xs text-slate-400">{item.email}</p></div></div></td>
                            <td className="p-8"><span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase border bg-slate-50 text-slate-500 border-slate-100">{item.role}</span></td>
                            <td className="p-8"><div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${item.is_blocked ? 'bg-red-500' : 'bg-green-500'}`}></div><span className="text-xs font-bold text-slate-700">{item.is_blocked ? 'Blocked' : 'Active'}</span></div></td>
                            <td className="p-8 text-xs font-bold text-slate-400">{new Date(item.created_at).toLocaleDateString()}</td>
                            <td className="p-8"><button onClick={() => toggleUserStatus(item.id)} className={`p-3 rounded-xl ${item.is_blocked ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}><ShieldCheck className="h-4 w-4" /></button></td>
                          </>
                        )}
                        {activeTab === 'flights' && (
                          <>
                            <td className="p-8 font-black text-slate-800 tracking-tighter text-xs">{item.flight_number}</td>
                            <td className="p-8"><div className="flex items-center gap-3"><div className="w-2 h-8 bg-primary rounded-full"></div><span className="font-black text-slate-800 uppercase tracking-tight">{item.airline}</span></div></td>
                            <td className="p-8"><div className="flex items-center gap-4"><span className="font-black text-slate-700">{item.departure_city}</span> <div className="w-8 h-px bg-slate-200"></div> <span className="font-black text-slate-700">{item.arrival_city}</span></div><p className="text-[10px] text-slate-400 font-bold uppercase mt-1 italic">{new Date(item.departure_time).toLocaleString()}</p></td>
                            <td className="p-8 font-black text-slate-800">${item.economy_price}</td>
                            <td className="p-8 font-black text-primary">${item.business_price || (parseFloat(item.economy_price) * 1.5).toFixed(2)}</td>
                            <td className="p-8"><div className="flex items-center gap-2"><div className="flex-grow h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-primary" style={{ width: `${(item.available_seats / item.total_seats) * 100}%` }}></div></div><span className="text-[10px] font-bold text-slate-500">{item.available_seats}/{item.total_seats}</span></div></td>
                            <td className="p-8"><div className="flex gap-2"><button onClick={() => openFlightModal(item)} className="p-3 text-blue-500 hover:bg-blue-50 rounded-xl"><Edit2 className="h-4 w-4" /></button><button onClick={() => deleteFlight(item.id)} className="p-3 text-red-500 hover:bg-red-50 rounded-xl"><Trash2 className="h-4 w-4" /></button></div></td>
                          </>
                        )}
                        {activeTab === 'bookings' && (
                          <>
                            <td className="p-8"><div className="font-black text-slate-900 tracking-tighter text-lg">#SB-{item.id}</div><div className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{item.pnr}</div></td>
                            <td className="p-8"><div className="font-bold text-slate-800">{item.user_name}</div><div className="text-xs text-slate-400 font-medium">{item.user_email}</div></td>
                            <td className="p-8"><div className="font-black text-slate-800 uppercase text-xs tracking-widest mb-1">{item.airline}</div><div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase"><span>{item.departure_city}</span><Plane className="h-3 w-3" /><span>{item.arrival_city}</span></div></td>
                            <td className="p-8"><span className={`text-[10px] font-black uppercase px-4 py-1.5 rounded-xl border ${item.cabin_class === 'Business' ? 'bg-accent/10 text-primary border-accent/20' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>{item.cabin_class}</span></td>
                            <td className="p-8 font-black text-primary text-xl tracking-tighter">${item.total_price}</td>
                            <td className="p-8"><span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border flex items-center gap-2 w-fit ${item.status === 'confirmed' ? 'bg-green-50 text-green-600 border-green-200' : item.status === 'cancelled' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-orange-50 text-orange-600 border-orange-200'}`}><div className={`w-1.5 h-1.5 rounded-full ${item.status === 'confirmed' ? 'bg-green-500' : item.status === 'cancelled' ? 'bg-red-500' : 'bg-orange-500'}`}></div>{item.status}</span></td>
                            <td className="p-8">{item.status !== 'cancelled' && <button onClick={() => navigate(`/ticket/${item.id}`)} className="p-3 bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"><ExternalLink className="h-5 w-5" /></button>}</td>
                          </>
                        )}
                        {activeTab === 'payments' && (
                          <>
                             <td className="p-8 font-black text-slate-900 tracking-tighter">{item.transaction_id || `#TX-${item.id}`}</td>
                             <td className="p-8">
                                <p className="font-bold text-slate-800">{item.user_name}</p>
                                <p className="text-[10px] font-black text-primary uppercase">PNR: {item.pnr}</p>
                             </td>
                             <td className="p-8 font-black text-slate-900">${item.amount}</td>
                             <td className="p-8 font-bold text-slate-400 uppercase text-xs">{item.payment_method || 'CREDIT CARD'}</td>
                             <td className="p-8"><span className="px-4 py-1.5 rounded-full bg-green-50 text-green-600 border border-green-100 text-[10px] font-black uppercase">{item.status}</span></td>
                             <td className="p-8 text-xs font-bold text-slate-400">{new Date(item.payment_date).toLocaleDateString()}</td>
                          </>
                        )}
                        {activeTab === 'fleet' && (
                          <>
                             <td className="p-8 font-black text-slate-900 tracking-widest">{item.tail_number}</td>
                             <td className="p-8 font-bold text-slate-700">{item.model}</td>
                             <td className="p-8"><div className="text-xs font-bold text-slate-500"><p>E: <span className="text-slate-800">{item.economy_capacity}</span></p><p>B: <span className="text-primary">{item.business_capacity}</span></p></div></td>
                             <td className="p-8"><span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase border ${item.status === 'Active' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-orange-50 text-orange-600 border-orange-200'}`}>{item.status}</span></td>
                             <td className="p-8 text-xs font-bold text-slate-400">{item.last_maintenance || 'Pending'}</td>
                             <td className="p-8">
                                <div className="flex gap-2">
                                  <button onClick={() => toggleAircraftStatus(item.id)} className={`p-3 rounded-xl transition-all ${item.status === 'Active' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}`}><Wrench className="h-4 w-4" /></button>
                                  <button className="p-3 bg-red-50 text-red-600 rounded-xl"><Trash2 className="h-4 w-4" /></button>
                                </div>
                             </td>
                          </>
                        )}
                        {activeTab === 'tickets' && (
                          <>
                            <td className="p-8 font-black text-slate-800">{item.ticket_number}</td>
                            <td className="p-8"><div className="font-bold text-slate-700 uppercase">{item.passenger_name}</div><div className="text-xs text-slate-400 font-medium">{item.passenger_email}</div></td>
                            <td className="p-8 font-black text-primary">{item.pnr}</td>
                            <td className="p-8"><div className="font-bold text-slate-700">{item.departure_iata} → {item.arrival_iata}</div><div className="text-[10px] text-slate-400 font-bold uppercase mt-1 italic">{new Date(item.boarding_time).toLocaleString()}</div></td>
                            <td className="p-8"><div className="flex gap-2"><button className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"><Mail className="h-4 w-4" /></button><a href={`${import.meta.env.VITE_API_URL || '/api'}/tickets/${item.id}/pdf`} target="_blank" rel="noreferrer" className="p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-800 hover:text-white transition-all shadow-sm"><ExternalLink className="h-4 w-4" /></a></div></td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Flight Modal */}
      {isModalOpen && modalType === 'flight' && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[100] p-6">
           <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="bg-slate-50 p-8 border-b border-slate-200 flex justify-between items-center">
                 <div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{selectedItem ? 'Update Flight' : 'Add Flight'}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Operational Manifest Grid</p>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-2xl border border-slate-200 transition-all">
                    <X className="h-6 w-6" />
                 </button>
              </div>
              
              <form onSubmit={handleFlightSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-500 ml-4 tracking-widest">Airliner / Carrier</label>
                       <div className="relative">
                          <Plane className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                          <input 
                            required
                            type="text" 
                            placeholder="e.g. SkyBound Prime"
                            value={flightForm.airline}
                            onChange={e => setFlightForm({...flightForm, airline: e.target.value})}
                            className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-primary font-bold transition-all text-sm"
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-500 ml-4 tracking-widest">Flight Number</label>
                       <div className="relative">
                          <QrCode className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                          <input 
                            required
                            type="text" 
                            placeholder="e.g. SB-402"
                            value={flightForm.flight_number}
                            onChange={e => setFlightForm({...flightForm, flight_number: e.target.value})}
                            className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-primary font-bold transition-all text-sm uppercase"
                          />
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-500 ml-4 tracking-widest">Departure Node</label>
                       <select 
                         required
                         value={flightForm.departure_airport_id}
                         onChange={e => setFlightForm({...flightForm, departure_airport_id: e.target.value})}
                         className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-primary font-bold text-sm appearance-none"
                       >
                          <option value="">Select Origin</option>
                          {data.airports.map(a => <option key={a.id} value={a.id}>{a.city} ({a.iata_code})</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-500 ml-4 tracking-widest">Arrival Target</label>
                       <select 
                         required
                         value={flightForm.arrival_airport_id}
                         onChange={e => setFlightForm({...flightForm, arrival_airport_id: e.target.value})}
                         className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-primary font-bold text-sm appearance-none"
                       >
                          <option value="">Select Destination</option>
                          {data.airports.map(a => <option key={a.id} value={a.id}>{a.city} ({a.iata_code})</option>)}
                       </select>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-500 ml-4 tracking-widest">Takeoff Schedule</label>
                       <div className="relative">
                          <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                          <input 
                            required
                            type="datetime-local" 
                            value={flightForm.departure_time}
                            onChange={e => setFlightForm({...flightForm, departure_time: e.target.value})}
                            className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-primary font-bold text-sm"
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-500 ml-4 tracking-widest">ETA Projection</label>
                       <div className="relative">
                          <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                          <input 
                            required
                            type="datetime-local" 
                            value={flightForm.arrival_time}
                            onChange={e => setFlightForm({...flightForm, arrival_time: e.target.value})}
                            className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-primary font-bold text-sm"
                          />
                       </div>
                    </div>
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
                            onChange={e => setFlightForm({...flightForm, economy_price: e.target.value})}
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
                         onChange={e => setFlightForm({...flightForm, total_seats: e.target.value})}
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
                         onChange={e => setFlightForm({...flightForm, terminal: e.target.value})}
                         className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-primary font-bold text-sm uppercase"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-500 ml-4 tracking-widest">Gate</label>
                       <input 
                         type="text" 
                         placeholder="B2"
                         value={flightForm.gate}
                         onChange={e => setFlightForm({...flightForm, gate: e.target.value})}
                         className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-primary font-bold text-sm uppercase"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-500 ml-4 tracking-widest">Status</label>
                       <select 
                         required
                         value={flightForm.status}
                         onChange={e => setFlightForm({...flightForm, status: e.target.value})}
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

      {/* Footer Branding */}
      <footer className="fixed bottom-0 left-80 right-0 h-16 bg-white/50 backdrop-blur-md border-t border-slate-200 flex items-center justify-between px-12 z-10">
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">© 2026 SkyBound Airlines • Flight Operations Center</p>
         <div className="flex gap-6">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">v4.0.2 Stable</span>
            <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div><span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Real-time Connection</span></div>
         </div>
      </footer>
    </div>
  );
};

export default AdminDashboard;
