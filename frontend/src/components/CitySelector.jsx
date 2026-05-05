import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Globe, Star, Search as SearchIcon } from 'lucide-react';

const POPULAR_DESTINATIONS = [
  { city: 'Dubai', country: 'UAE', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=150&q=80' },
  { city: 'London', country: 'UK', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=150&q=80' },
  { city: 'New York', country: 'USA', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=150&q=80' },
  { city: 'Tokyo', country: 'Japan', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=150&q=80' },
  { city: 'Paris', country: 'France', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=150&q=80' },
  { city: 'Singapore', country: 'Singapore', image: 'https://images.unsplash.com/photo-1525625232747-0ef45f85a271?auto=format&fit=crop&w=150&q=80' },
];

const CitySelector = ({ value, onChange, placeholder, icon: Icon, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [realCities, setRealCities] = useState([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/flights/cities`);
        if (res.ok) {
          const data = await res.json();
          setRealCities(data);
        }
      } catch (err) {
        console.error('Failed to fetch cities:', err);
      }
    };
    fetchCities();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (city) => {
    onChange(city);
    setIsOpen(false);
    setSearchTerm('');
  };

  const filteredPopular = POPULAR_DESTINATIONS.filter(d => 
    d.city.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReal = realCities.filter(c => 
    c.toLowerCase().includes(searchTerm.toLowerCase()) && 
    !POPULAR_DESTINATIONS.some(p => p.city.toLowerCase() === c.toLowerCase())
  );

  return (
    <div className="flex-1 min-w-[240px] relative" ref={dropdownRef}>
      <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest">{label}</label>
      <div 
        className={`relative cursor-pointer transition-all ${isOpen ? 'ring-2 ring-primary bg-white' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Icon className={`h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 ${isOpen ? 'text-primary' : 'text-slate-400'}`} />
        <input
          readOnly
          type="text"
          placeholder={placeholder}
          value={value}
          className="w-full pl-12 pr-4 py-4 bg-slate-50 border-0 rounded-2xl outline-none font-bold text-slate-700 cursor-pointer"
        />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full min-w-[320px] bg-white rounded-[2rem] shadow-2xl border border-slate-100 z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-slate-50 bg-slate-50/50">
            <div className="relative">
              <SearchIcon className="h-4 w-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                autoFocus
                type="text"
                placeholder="Search city or country..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-sm focus:border-primary transition-all"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto p-2 scrollbar-thin">
            {filteredPopular.length > 0 && (
              <div className="mb-4">
                <p className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Star className="h-3 w-3 text-accent fill-accent" /> Featured Destinations
                </p>
                <div className="grid grid-cols-2 gap-2 p-2">
                  {filteredPopular.slice(0, 4).map((dest) => (
                    <div 
                      key={dest.city}
                      onClick={() => handleSelect(dest.city)}
                      className="group relative h-24 rounded-2xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                    >
                      <img src={dest.image} alt={dest.city} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                      <div className="absolute bottom-3 left-3">
                        <p className="text-white font-black text-xs leading-none mb-1">{dest.city}</p>
                        <p className="text-white/60 text-[8px] font-bold uppercase tracking-tighter">{dest.country}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Globe className="h-3 w-3" /> {searchTerm ? 'Search Results' : 'Available Routes'}
              </p>
              <div className="space-y-1">
                {(searchTerm ? [...filteredPopular, ...filteredReal.map(c => ({city: c}))] : filteredReal.map(c => ({city: c}))).map((item, idx) => {
                  const fullCity = typeof item === 'string' ? item : item.city;
                  const [cityName, cityCode] = fullCity.includes('(') 
                    ? [fullCity.split('(')[0].trim(), fullCity.split('(')[1].replace(')', '').trim()]
                    : [fullCity, 'INTL'];
                  
                  return (
                    <button
                      key={`${fullCity}-${idx}`}
                      onClick={() => handleSelect(fullCity)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-xl transition-all text-left group"
                    >
                      <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-primary/10 transition-colors">
                        <MapPin className="h-4 w-4 text-slate-400 group-hover:text-primary" />
                      </div>
                      <div className="flex-grow">
                        <p className="font-bold text-slate-700 text-sm">{cityName}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                          {item.country || 'Global Destination'} • {cityCode}
                        </p>
                      </div>
                      <div className="bg-slate-50 px-2 py-1 rounded text-[8px] font-black text-slate-300 group-hover:text-primary group-hover:bg-primary/5 transition-all">
                        {cityCode}
                      </div>
                    </button>
                  );
                })}
                {filteredReal.length === 0 && !searchTerm && (
                  <p className="text-center py-4 text-xs text-slate-400 font-bold uppercase tracking-widest italic">No other routes available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitySelector;
