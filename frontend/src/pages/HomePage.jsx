import React, { useState, useEffect } from 'react';
import { Plane, Calendar, MapPin, Users, Search, AlertCircle, Loader2 } from 'lucide-react';
import { flightService } from './services/api';
import FlightCard from './components/FlightCard';

function HomePage() {
  const [searchParams, setSearchParams] = useState({
    departure_city: '',
    arrival_city: '',
    departure_date: ''
  });
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSearched(true);
    
    try {
      const data = await flightService.getFlights(searchParams);
      setFlights(data);
    } catch (err) {
      setError('Failed to fetch flights. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load all flights on initial mount
  useEffect(() => {
    const fetchInitialFlights = async () => {
      setLoading(true);
      try {
        const data = await flightService.getFlights();
        setFlights(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialFlights();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-primary text-white p-4 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-white/10 p-1.5 rounded-lg">
              <Plane className="h-7 w-7 text-accent" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter uppercase">SkyBound</h1>
          </div>
          <nav>
            <ul className="flex gap-8 font-bold text-sm tracking-wide uppercase">
              <li className="hover:text-accent transition-colors cursor-pointer">Deals</li>
              <li>
                <Link to="/dashboard" className="hover:text-accent transition-colors cursor-pointer">My Trips</Link>
              </li>
              <li className="bg-accent text-primary px-4 py-1.5 rounded-full hover:bg-yellow-400 transition-colors cursor-pointer">Login</li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero & Search Section */}
        <div className="bg-gradient-to-b from-primary via-blue-900 to-blue-800 text-white pt-16 pb-32 px-4 relative">
          <div className="container mx-auto text-center max-w-4xl relative z-10">
            <h2 className="text-6xl font-black mb-4 leading-tight">Elevate Your Travel.</h2>
            <p className="text-xl mb-12 text-blue-100 font-medium">Discover exclusive rates on global destinations.</p>
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-2xl p-8 flex flex-wrap gap-6 items-end text-gray-800 text-left border border-white/20">
              <div className="flex-1 min-w-[240px]">
                <label className="block text-xs font-black uppercase text-gray-400 mb-2 ml-1 tracking-widest">
                  From
                </label>
                <div className="relative">
                  <MapPin className="h-5 w-5 text-primary absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    name="departure_city"
                    value={searchParams.departure_city}
                    onChange={handleInputChange}
                    placeholder="Origin City" 
                    className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-primary outline-none font-bold text-gray-700 transition-all" 
                  />
                </div>
              </div>
              
              <div className="flex-1 min-w-[240px]">
                <label className="block text-xs font-black uppercase text-gray-400 mb-2 ml-1 tracking-widest">
                  To
                </label>
                <div className="relative">
                  <MapPin className="h-5 w-5 text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    name="arrival_city"
                    value={searchParams.arrival_city}
                    onChange={handleInputChange}
                    placeholder="Destination City" 
                    className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-primary outline-none font-bold text-gray-700 transition-all" 
                  />
                </div>
              </div>

              <div className="w-full md:w-auto flex-1 min-w-[180px]">
                <label className="block text-xs font-black uppercase text-gray-400 mb-2 ml-1 tracking-widest">
                  Departure Date
                </label>
                <div className="relative">
                  <Calendar className="h-5 w-5 text-primary absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="date" 
                    name="departure_date"
                    value={searchParams.departure_date}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-primary outline-none font-bold text-gray-700 transition-all" 
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full lg:w-auto bg-primary hover:bg-blue-800 disabled:bg-blue-300 text-white font-black px-10 py-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl flex items-center justify-center gap-2 group"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5 group-hover:scale-110 transition-transform" />}
                Find Flights
              </button>
            </form>
          </div>
          
          {/* Abstract background shapes */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 -right-48 w-80 h-80 bg-blue-400 rounded-full blur-3xl"></div>
          </div>
        </div>

        {/* Results Section */}
        <section className="container mx-auto -mt-16 pb-20 px-4 relative z-20">
          {error && (
            <div className="max-w-xl mx-auto mb-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-center gap-3 shadow-lg">
              <AlertCircle className="h-6 w-6 text-red-500" />
              <p className="text-red-700 font-bold">{error}</p>
            </div>
          )}

          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tight">
              {searched ? 'Search Results' : 'Featured Deals'}
              <span className="ml-3 text-sm font-bold text-gray-400">({flights.length} found)</span>
            </h3>
            <div className="h-1 flex-grow mx-6 bg-slate-200 rounded-full hidden md:block"></div>
          </div>

          {loading && !flights.length ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="font-bold text-gray-400 animate-pulse uppercase tracking-widest text-xs">Curating the best flights for you...</p>
            </div>
          ) : flights.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {flights.map(flight => (
                <FlightCard key={flight.id} flight={flight} />
              ))}
            </div>
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
      <footer className="bg-slate-900 text-slate-400 py-16 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 text-white mb-6">
            <Plane className="h-8 w-8 text-accent" />
            <span className="text-3xl font-black tracking-tighter italic uppercase">SkyBound</span>
          </div>
          <p className="max-w-md mx-auto mb-8 text-sm leading-relaxed">
            The world's most trusted airline booking platform. Connecting millions of travelers with the best global routes every day.
          </p>
          <div className="flex justify-center gap-8 mb-12">
            {['Destinations', 'About', 'Support', 'Legal'].map(link => (
              <a key={link} href="#" className="text-xs font-black uppercase tracking-widest hover:text-white transition-colors">{link}</a>
            ))}
          </div>
          <div className="pt-8 border-t border-slate-800 text-[10px] font-bold uppercase tracking-[0.2em]">
            © 2026 SkyBound Airlines. Built with excellence.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
