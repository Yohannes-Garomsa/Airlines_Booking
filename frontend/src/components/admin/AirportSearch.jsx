import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, X } from 'lucide-react';
import debounce from 'lodash/debounce';

const AirportSearch = ({ label, onSelect, placeholder, value: initialValue }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAirport, setSelectedAirport] = useState(initialValue || null);
  const dropdownRef = useRef(null);

  const fetchAirports = async (query) => {
    if (!query) return;
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/airports?search=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data);
      setIsOpen(true);
    } catch (err) {
      console.error('Failed to fetch airports:', err);
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetch = useRef(debounce(fetchAirports, 300)).current;

  useEffect(() => {
    if (searchTerm.length > 1) {
      debouncedFetch(searchTerm);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (airport) => {
    setSelectedAirport(airport);
    onSelect(airport);
    setSearchTerm('');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest">{label}</label>
      
      {selectedAirport ? (
        <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary font-black text-xs uppercase">
              {selectedAirport.iata_code}
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">{selectedAirport.name}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase">{selectedAirport.city}, {selectedAirport.country}</p>
            </div>
          </div>
          <button 
            onClick={() => {
              setSelectedAirport(null);
              onSelect(null);
            }}
            className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => searchTerm.length > 1 && setIsOpen(true)}
            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-0 rounded-2xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 transition-all text-sm"
          />
          {loading && <Loader2 className="h-4 w-4 absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-primary" />}
        </div>
      )}

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-[2rem] shadow-2xl border border-slate-100 z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-60 overflow-y-auto p-2">
            {results.map((airport) => (
              <button
                key={airport.id}
                onClick={() => handleSelect(airport)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-xl transition-all text-left group"
              >
                <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-primary/10 transition-colors">
                  <MapPin className="h-4 w-4 text-slate-400 group-hover:text-primary" />
                </div>
                <div className="flex-grow">
                  <p className="font-bold text-slate-700 text-sm">{airport.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    {airport.city}, {airport.country} • {airport.iata_code}
                  </p>
                </div>
                <div className="bg-slate-100 px-2 py-1 rounded text-[10px] font-black text-slate-400 group-hover:text-primary group-hover:bg-primary/5 transition-all">
                  {airport.iata_code}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AirportSearch;
