// SkyBound Booking Interface v3.1 - Advanced Features Fixed
import React, { useState, useEffect, useContext } from 'react';
import { Plane, Calendar, MapPin, Users, Search, AlertCircle, Loader2, LogOut, User, Plus, Trash2, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { flightService } from '../services/api';
import FlightCard from '../components/FlightCard';
import { AuthContext } from '../context/AuthContext';
import { Footer } from '../components/Footer';
import CitySelector from '../components/CitySelector';

function HomePage() {
  const [tripType, setTripType] = useState('round-trip');
  const [segments, setSegments] = useState([
    { departure_city: '', arrival_city: '', departure_date: '', return_date: '' }
  ]);
  const [passengers, setPassengers] = useState({ adults: 1, children: 0, infants: 0 });
  const [cabinClass, setCabinClass] = useState('Economy');
  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);
  const [maxPrice, setMaxPrice] = useState('');
  const [maxDuration, setMaxDuration] = useState('');
  const [sortBy, setSortBy] = useState('departure_time_asc');
  const [page, setPage] = useState(1);
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const { user, logout } = useContext(AuthContext);

  const handleSegmentChange = (index, field, value) => {
    const newSegments = [...segments];
    newSegments[index][field] = value;
    setSegments(newSegments);
  };

  const addSegment = () => {
    if (segments.length < 4) {
      setSegments([...segments, { departure_city: '', arrival_city: '', departure_date: '' }]);
    }
  };

  const removeSegment = (index) => {
    if (segments.length > 1) {
      setSegments(segments.filter((_, i) => i !== index));
    }
  };

  const fetchFlights = async (currentPage = 1) => {
    setLoading(true);
    setError(null);
    try {
      // For now, search using the first segment's data
      const searchParams = {
        departure_city: segments[0].departure_city,
        arrival_city: segments[0].arrival_city,
        departure_date: segments[0].departure_date,
        max_price: maxPrice,
        max_duration: maxDuration,
        sort_by: sortBy,
        page: currentPage,
        limit: 10
      };
      const data = await flightService.getFlights(searchParams);
      setFlights(data);
    } catch (err) {
      setError('Failed to fetch flights. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearched(true);
    setPage(1);
    await fetchFlights(1);
  };

  // Load flights when page or sort changes
  useEffect(() => {
    fetchFlights(page);
  }, [page, sortBy]);

  const totalPassengers = passengers.adults + passengers.children + passengers.infants;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-primary text-white p-4 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-white/10 p-1.5 rounded-lg">
              <Plane className="h-7 w-7 text-accent" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter uppercase">SkyBound</h1>
          </Link>
          <nav>
            <ul className="flex gap-8 font-bold text-sm tracking-wide uppercase items-center">
              <li className="hover:text-accent transition-colors cursor-pointer">Deals</li>
              {user ? (
                <>
                  <li>
                    <Link to="/dashboard" className="hover:text-accent transition-colors cursor-pointer">My Trips</Link>
                  </li>
                  <li className="flex items-center gap-2 bg-blue-900/50 px-4 py-2 rounded-full border border-blue-700">
                    <User className="h-4 w-4 text-accent" />
                    <span>{user.name.split(' ')[0]}</span>
                  </li>
                  <li>
                    <button onClick={logout} className="hover:text-red-400 transition-colors flex items-center gap-1">
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/login" className="hover:text-accent transition-colors cursor-pointer">Login</Link>
                  </li>
                  <li>
                    <Link to="/register" className="bg-accent text-primary px-5 py-2 rounded-full hover:bg-yellow-400 transition-colors cursor-pointer shadow-md transform hover:scale-105 active:scale-95 flex items-center">
                      Sign Up
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <div className="relative min-h-[60vh] flex flex-col justify-center px-4 overflow-hidden">
          {/* Background Image & Overlay */}
          <div className="absolute inset-0 z-0">
            <img src="/hero-bg.png" alt="Airplane" className="w-full h-full object-cover object-top" />
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900/60 via-blue-900/20 to-transparent"></div>
          </div>
          
          <div className="container mx-auto text-center max-w-4xl relative z-10 -mt-20">
            <h2 className="text-6xl md:text-7xl font-black mb-4 leading-tight text-white drop-shadow-2xl tracking-tighter">
              Elevate Your Travel.
            </h2>
            <p className="text-xl md:text-2xl text-white font-bold drop-shadow-xl">
              Discover exclusive rates on global destinations with our premium fleet.
            </p>
          </div>
        </div>

        {/* Search Section */}
        <div className="container mx-auto px-4 relative z-20 -mt-24 mb-16 max-w-6xl">
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-slate-100">
            {/* Search Type & Class Selectors */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-100 pb-4">
              <div className="flex gap-6 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                {[
                  { id: 'round-trip', label: 'Round Trip' },
                  { id: 'one-way', label: 'One-Way' },
                  { id: 'multicity', label: 'Multicity' }
                ].map(type => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => {
                      setTripType(type.id);
                      if (type.id !== 'multicity') setSegments([{ departure_city: '', arrival_city: '', departure_date: '', return_date: '' }]);
                      else if (segments.length === 1) setSegments([...segments, { departure_city: '', arrival_city: '', departure_date: '', return_date: '' }]);
                    }}
                    className={`whitespace-nowrap text-sm font-black transition-all pb-4 border-b-2 ${tripType === type.id ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>

              <div className="flex bg-slate-100 p-1 rounded-2xl">
                {['Economy', 'Business'].map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCabinClass(c)}
                    className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                      cabinClass === c 
                        ? 'bg-white text-primary shadow-sm' 
                        : 'text-slate-500 hover:bg-white/50'
                    }`}
                  >
                    {c === 'Business' && <ShieldCheck className="h-3.5 w-3.5 text-accent" />}
                    {c === 'Business' ? 'Business (VIP)' : c}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSearch} className="space-y-6">
              {segments.map((segment, index) => (
                <div key={index} className="flex flex-wrap lg:flex-nowrap gap-4 items-end relative group">
                  {tripType === 'multicity' && index > 0 && (
                    <div className="absolute -left-10 top-1/2 -translate-y-1/2 hidden lg:flex items-center justify-center w-8 h-8 bg-slate-100 rounded-full text-slate-400 font-bold text-xs">
                      {index + 1}
                    </div>
                  )}
                  
                  <CitySelector
                    label="From"
                    placeholder="Origin City"
                    value={segment.departure_city}
                    onChange={(val) => {
                      handleSegmentChange(index, 'departure_city', val);
                      // Clear destination if origin changes to ensure valid pairing
                      handleSegmentChange(index, 'arrival_city', '');
                    }}
                    icon={MapPin}
                    type="origin"
                  />

                  <CitySelector
                    label="To"
                    placeholder="Destination"
                    value={segment.arrival_city}
                    onChange={(val) => handleSegmentChange(index, 'arrival_city', val)}
                    icon={MapPin}
                    type="destination"
                    dependency={segment.departure_city}
                  />

                  <div className="flex-1 min-w-[150px]">
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest">Departure</label>
                    <div className="relative">
                      <Calendar className="h-5 w-5 text-primary absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        required
                        type="date"
                        value={segment.departure_date}
                        onChange={(e) => handleSegmentChange(index, 'departure_date', e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold text-slate-700 transition-all"
                      />
                    </div>
                  </div>

                  {tripType === 'round-trip' && index === 0 && (
                    <div className="flex-1 min-w-[150px]">
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest">Return</label>
                      <div className="relative">
                        <Calendar className="h-5 w-5 text-secondary absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                          type="date"
                          value={segment.return_date}
                          onChange={(e) => handleSegmentChange(index, 'return_date', e.target.value)}
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold text-slate-700 transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {tripType === 'multicity' && index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeSegment(index)}
                      className="p-4 text-red-400 hover:bg-red-50 rounded-2xl transition-all"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}

              <div className="flex flex-wrap items-center justify-between gap-6 pt-4">
                <div className="flex flex-wrap items-center gap-6">
                  {tripType === 'multicity' && segments.length < 4 && (
                    <button
                      type="button"
                      onClick={addSegment}
                      className="flex items-center gap-2 text-primary font-black text-sm uppercase tracking-widest hover:text-blue-800 transition-all"
                    >
                      <Plus className="h-5 w-5" /> Add Flight
                    </button>
                  )}

                  {/* Passenger & Cabin Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowPassengerDropdown(!showPassengerDropdown)}
                      className="flex items-center gap-3 px-6 py-4 bg-slate-50 rounded-2xl font-bold text-slate-700 hover:bg-slate-100 transition-all"
                    >
                      <Users className="h-5 w-5 text-primary" />
                      <span>{totalPassengers} Passengers, {cabinClass}</span>
                    </button>

                    {showPassengerDropdown && (
                      <div className="absolute top-full left-0 mt-4 w-72 bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 z-50 animate-in fade-in zoom-in duration-200">
                        <div className="space-y-6">
                          {['adults', 'children', 'infants'].map(type => (
                            <div key={type} className="flex items-center justify-between">
                              <div>
                                <p className="font-bold text-slate-700 capitalize">{type}</p>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                                  {type === 'adults' ? '12+ Years' : type === 'children' ? '2-12 Years' : 'Under 2'}
                                </p>
                              </div>
                              <div className="flex items-center gap-4">
                                <button
                                  type="button"
                                  onClick={() => setPassengers(p => ({ ...p, [type]: Math.max(type === 'adults' ? 1 : 0, p[type] - 1) }))}
                                  className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center font-bold hover:bg-slate-50"
                                >-</button>
                                <span className="font-bold w-4 text-center">{passengers[type]}</span>
                                <button
                                  type="button"
                                  onClick={() => setPassengers(p => ({ ...p, [type]: p[type] + 1 }))}
                                  className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center font-bold hover:bg-slate-50"
                                >+</button>
                              </div>
                            </div>
                          ))}

                          {/* Cabin Class removed from here and moved to top for better visibility */}

                          <button
                            type="button"
                            onClick={() => setShowPassengerDropdown(false)}
                            className="w-full bg-primary text-white font-black py-3 rounded-2xl shadow-xl mt-4"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Simplified: Removed miles and promo code as requested */}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <input
                      type="number"
                      placeholder="Max Price"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="pl-8 pr-4 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold text-slate-700 transition-all w-32"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-accent hover:bg-yellow-500 disabled:bg-slate-200 text-primary font-black px-12 py-5 rounded-2xl shadow-xl transition-all transform hover:scale-[1.02] active:scale-95 flex items-center gap-3 uppercase tracking-widest text-sm"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                    Search flights
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Results Section */}
        <section className="container mx-auto mt-8 pb-20 px-4 relative z-20">
          {error && (
            <div className="max-w-xl mx-auto mb-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-center gap-3 shadow-lg">
              <AlertCircle className="h-6 w-6 text-red-500" />
              <p className="text-red-700 font-bold">{error}</p>
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-4">
              <h3 className="text-3xl font-black text-slate-800 tracking-tighter">
                {searched ? 'Search Results' : 'Featured Deals'}
              </h3>
              <div className="h-1 w-20 bg-primary rounded-full hidden md:block"></div>
            </div>

            {/* Advanced Filters */}
            {searched && (
              <div className="flex flex-wrap items-center gap-4 bg-white p-2 rounded-3xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-2 px-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sort:</span>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent border-0 font-black text-xs text-primary focus:ring-0 outline-none cursor-pointer p-0"
                  >
                    <option value="departure_time_asc">Earliest First</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="duration_short">Shortest Duration</option>
                  </select>
                </div>
                
                <div className="h-4 w-[1px] bg-slate-200 hidden md:block"></div>

                <div className="flex items-center gap-3 px-4 border-r border-slate-100 last:border-0">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Max Price</span>
                    <input 
                      type="number" 
                      placeholder="Any"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="bg-transparent border-0 p-0 font-black text-xs text-slate-700 w-16 focus:ring-0 outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 px-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Max Duration (h)</span>
                    <input 
                      type="number" 
                      placeholder="Any"
                      value={maxDuration}
                      onChange={(e) => setMaxDuration(e.target.value)}
                      className="bg-transparent border-0 p-0 font-black text-xs text-slate-700 w-16 focus:ring-0 outline-none"
                    />
                  </div>
                </div>

                <button 
                  onClick={() => fetchFlights(1)}
                  className="bg-primary text-white p-2 rounded-2xl hover:bg-blue-800 transition-all active:scale-95 shadow-lg shadow-blue-100"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {loading && !flights.length ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="font-bold text-gray-400 animate-pulse uppercase tracking-widest text-xs">Curating the best flights for you...</p>
            </div>
          ) : flights.length > 0 ? (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {flights.map((flight, idx) => (
                  <FlightCard 
                    key={flight.id} 
                    flight={flight} 
                    selectedClass={cabinClass} 
                    isFeatured={!searched && idx < 2} 
                  />
                ))}
              </div>


              <div className="flex justify-center items-center gap-4 mt-12">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                  className="px-6 py-2 bg-white text-primary font-bold rounded-xl shadow-md border border-slate-100 disabled:opacity-50 transition-all hover:bg-slate-50"
                >
                  Previous
                </button>
                <span className="font-black text-slate-400">Page {page}</span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={flights.length < 10 || loading}
                  className="px-6 py-2 bg-white text-primary font-bold rounded-xl shadow-md border border-slate-100 disabled:opacity-50 transition-all hover:bg-slate-50"
                >
                  Next
                </button>
              </div>
            </>
          ) : searched ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-dashed border-gray-200">
              <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h4 className="text-xl font-black text-gray-800 mb-2">No flights found</h4>
              <p className="text-gray-500 font-medium">Try adjusting your destination or dates for more options.</p>
            </div>
          ) : null}
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default HomePage;
