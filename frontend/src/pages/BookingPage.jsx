import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Plane, User, Mail, CreditCard, ChevronLeft, ChevronRight, Loader2, CheckCircle, ShieldCheck, Briefcase, Clock, AlertCircle, Globe, FileText, Phone, Calendar, ArrowRight, ArrowLeft } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import React, { useState, useEffect, useContext, useRef } from 'react';
import SeatSelection from '../components/SeatSelection';

// ─── helpers ──────────────────────────────────────────────────────────────────
const API = import.meta.env.VITE_API_URL || '/api';
const blankPassenger = (isPrimary = false) => ({
  firstName: '', lastName: '', gender: 'Male', dateOfBirth: '',
  documentType: 'Fayda ID', fanNumber: '', finNumber: '', passportNumber: '',
  passportExpiry: '', nationality: 'Ethiopia', passportCountry: '',
  email: '', phoneNumber: '',
  emergencyContactName: isPrimary ? '' : null,
  emergencyContactPhone: isPrimary ? '' : null,
});

const STEPS = ['Personal', 'Identity', 'Contact', 'Review'];

// ─── PassengerStepForm ─────────────────────────────────────────────────────────
function PassengerStepForm({ index, total, data, onChange, flightType, isLast }) {
  const [step, setStep] = useState(0);
  const isIntl = flightType === 'International';
  const isPrimary = index === 0;

  const set = (field, val) => onChange({ ...data, [field]: val });

  const canProceed = () => {
    if (step === 0) return data.firstName && data.lastName && data.dateOfBirth && data.gender;
    if (step === 1) {
      if (isIntl) return data.passportNumber && data.passportExpiry && data.nationality && data.passportCountry;
      if (data.documentType === 'Fayda ID') return data.fanNumber || data.finNumber;
      return data.passportNumber && data.passportExpiry;
    }
    if (step === 2) return data.email && data.phoneNumber;
    return true;
  };

  const inputCls = 'w-full h-14 px-5 bg-slate-50 rounded-2xl border-0 outline-none focus:ring-2 focus:ring-primary font-semibold text-slate-800 transition-all';
  const labelCls = 'block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1';

  return (
    <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
      {/* header */}
      <div className="bg-gradient-to-r from-primary to-blue-700 px-8 py-5 text-white flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-70">
            Passenger {index + 1} of {total}
          </p>
          <h3 className="text-lg font-black">{STEPS[step]} Information</h3>
        </div>
        <div className="flex gap-2">
          {STEPS.map((s, i) => (
            <div key={i} className={`h-2 w-8 rounded-full transition-all ${i <= step ? 'bg-white' : 'bg-white/30'}`} />
          ))}
        </div>
      </div>

      <div className="p-8 space-y-5">
        {/* STEP 0 – Personal */}
        {step === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>First Name *</label>
              <input className={inputCls} placeholder="Abebe" value={data.firstName} onChange={e => set('firstName', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Last Name *</label>
              <input className={inputCls} placeholder="Bikila" value={data.lastName} onChange={e => set('lastName', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Date of Birth *</label>
              <input type="date" className={inputCls} value={data.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Gender *</label>
              <select className={inputCls} value={data.gender} onChange={e => set('gender', e.target.value)}>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
          </div>
        )}

        {/* STEP 1 – Identity */}
        {step === 1 && (
          <div className="space-y-5">
            {/* Document type selector (domestic only) */}
            {!isIntl && (
              <div>
                <label className={labelCls}>Document Type *</label>
                <div className="grid grid-cols-2 gap-4">
                  {['Fayda ID', 'Passport'].map(dt => (
                    <button
                      key={dt}
                      type="button"
                      onClick={() => set('documentType', dt)}
                      className={`p-5 rounded-2xl border-2 text-left transition-all font-bold ${data.documentType === dt ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 text-slate-500 hover:border-slate-200'}`}
                    >
                      <div className="flex items-center gap-3">
                        {dt === 'Fayda ID' ? <FileText className="h-5 w-5" /> : <Globe className="h-5 w-5" />}
                        <div>
                          <p className="font-black text-sm">{dt}</p>
                          <p className="text-[10px] font-bold opacity-60">{dt === 'Fayda ID' ? 'Ethiopian National ID' : 'International Passport'}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* International notice */}
            {isIntl && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
                <Globe className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-amber-700 font-semibold text-sm">International flight — Passport is mandatory per ICAO regulations.</p>
              </div>
            )}

            {/* Fayda ID fields */}
            {!isIntl && data.documentType === 'Fayda ID' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>FAN Number (16 digits) <span className="text-primary/50">or FIN</span></label>
                  <input className={inputCls} placeholder="0000 0000 0000 0000" value={data.fanNumber} onChange={e => set('fanNumber', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>FIN Number (12 digits) <span className="text-primary/50">or FAN</span></label>
                  <input className={inputCls} placeholder="000000000000" value={data.finNumber} onChange={e => set('finNumber', e.target.value)} />
                </div>
              </div>
            )}

            {/* Passport fields */}
            {(isIntl || data.documentType === 'Passport') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>Passport Number *</label>
                  <input className={inputCls} placeholder="EP000000" value={data.passportNumber} onChange={e => set('passportNumber', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Expiry Date * <span className="text-primary/50">(Min. 6 months validity)</span></label>
                  <input type="date" className={inputCls} value={data.passportExpiry} onChange={e => set('passportExpiry', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Nationality / Citizenship *</label>
                  <input className={inputCls} placeholder="Ethiopian" value={data.nationality} onChange={e => set('nationality', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Passport Issuing Country *</label>
                  <input className={inputCls} placeholder="Ethiopia" value={data.passportCountry} onChange={e => set('passportCountry', e.target.value)} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2 – Contact */}
        {step === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>Email Address *</label>
              <input type="email" className={inputCls} placeholder="pax@example.com" value={data.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Phone Number *</label>
              <input className={inputCls} placeholder="+251 91 123 4567" value={data.phoneNumber} onChange={e => set('phoneNumber', e.target.value)} />
            </div>
            {isPrimary && (
              <>
                <div>
                  <label className={labelCls}>Emergency Contact Name</label>
                  <input className={inputCls} placeholder="Full Name" value={data.emergencyContactName || ''} onChange={e => set('emergencyContactName', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Emergency Contact Phone</label>
                  <input className={inputCls} placeholder="+251 91 000 0000" value={data.emergencyContactPhone || ''} onChange={e => set('emergencyContactPhone', e.target.value)} />
                </div>
              </>
            )}
          </div>
        )}

        {/* STEP 3 – Review */}
        {step === 3 && (
          <div className="space-y-3">
            <div className="bg-slate-50 rounded-2xl p-6 space-y-3">
              {[
                ['Full Name', `${data.firstName} ${data.lastName}`],
                ['Gender / DOB', `${data.gender} · ${data.dateOfBirth}`],
                ['Document', data.documentType === 'Fayda ID' ? `Fayda ID · FAN: ${data.fanNumber || 'N/A'}` : `Passport ${data.passportNumber}`],
                ['Email', data.email],
                ['Phone', data.phoneNumber],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-slate-200 pb-3 last:border-0 last:pb-0">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{k}</span>
                  <span className="font-bold text-slate-700 text-sm">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* nav */}
      <div className="px-8 pb-8 flex justify-between">
        {step > 0 ? (
          <button type="button" onClick={() => setStep(s => s - 1)} className="flex items-center gap-2 h-12 px-6 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        ) : <div />}
        {step < 3 ? (
          <button
            type="button"
            onClick={() => { if (canProceed()) setStep(s => s + 1); }}
            className={`flex items-center gap-2 h-12 px-8 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${canProceed() ? 'bg-primary text-white hover:bg-blue-800 shadow-lg shadow-primary/20' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
          >
            Continue <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <div className="flex items-center gap-2 h-12 px-6 rounded-2xl bg-green-50 text-green-700 font-black text-[11px] uppercase tracking-widest">
            <CheckCircle className="h-4 w-4" /> Ready
          </div>
        )}
      </div>
    </div>
  );
}

// ─── BookingPage ───────────────────────────────────────────────────────────────
const BookingPage = () => {
  const { flightId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const cabinClass = new URLSearchParams(location.search).get('class') || 'Economy';

  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [passengerCounts, setPassengerCounts] = useState({ adults: 1, children: 0, infants: 0 });
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengers, setPassengers] = useState([blankPassenger(true)]);
  const [modalConfig, setModalConfig] = useState(null);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const { user } = useContext(AuthContext);
  const timeoutRef = useRef(null);
  const warningRef = useRef(null);

  const flightType = flight
    ? (flight.departure_country === flight.arrival_country ? 'Domestic' : 'International')
    : 'Domestic';

  const seatsNeeded = passengerCounts.adults + passengerCounts.children;
  const totalPax = passengerCounts.adults + passengerCounts.children + passengerCounts.infants;

  // Sync passenger list length to total pax
  useEffect(() => {
    setPassengers(prev => {
      if (totalPax > prev.length) {
        const extras = Array.from({ length: totalPax - prev.length }, (_, i) => blankPassenger(prev.length + i === 0));
        return [...prev, ...extras];
      }
      return prev.slice(0, totalPax);
    });
  }, [totalPax]);

  useEffect(() => {
    if (!user) { navigate('/login', { state: { from: location }, replace: true }); return; }
    const reset = () => {
      clearTimeout(timeoutRef.current); clearTimeout(warningRef.current);
      setShowTimeoutWarning(false);
      warningRef.current = setTimeout(() => setShowTimeoutWarning(true), 4 * 60 * 1000);
      timeoutRef.current = setTimeout(() => setModalConfig({
        title: 'Session Expired', message: 'Your booking session has expired.',
        icon: <Clock className="h-8 w-8 text-red-500" />, actionText: 'Return to Home',
        onAction: () => navigate('/', { replace: true }), isDestructive: true,
      }), 5 * 60 * 1000);
    };
    reset();
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(e => document.addEventListener(e, reset));
    return () => { clearTimeout(timeoutRef.current); clearTimeout(warningRef.current); events.forEach(e => document.removeEventListener(e, reset)); };
  }, [user, navigate, location]);

  useEffect(() => {
    if (location.state?.passengerCounts) setPassengerCounts(location.state.passengerCounts);
  }, [location.state]);

  useEffect(() => {
    fetch(`${API}/flights/${flightId}`)
      .then(r => r.json()).then(setFlight).catch(console.error).finally(() => setLoading(false));
  }, [flightId]);

  useEffect(() => {
    setSelectedSeats(prev => prev.slice(0, seatsNeeded));
  }, [seatsNeeded]);

  const getBasePrice = () => flight ? (Number(cabinClass === 'Business' ? flight.business_price : flight.economy_price) || 0) : 0;
  const getPrice = () => {
    const base = getBasePrice();
    return parseFloat((passengerCounts.adults * base + passengerCounts.children * base * 0.9).toFixed(2));
  };

  const allReady = () => passengers.every(p => p.firstName && p.lastName && p.email && p.phoneNumber);

  const handleSubmit = async () => {
    if (!user) { navigate('/login', { state: { from: location }, replace: true }); return; }
    if (selectedSeats.length !== seatsNeeded) {
      setModalConfig({ title: 'Select Seats', message: `Please select ${seatsNeeded} seat(s) before continuing.`, icon: <AlertCircle className="h-8 w-8 text-yellow-500" />, actionText: 'OK', onAction: () => setModalConfig(null) });
      return;
    }
    if (!allReady()) {
      setModalConfig({ title: 'Incomplete Forms', message: 'Please complete all passenger information before proceeding.', icon: <AlertCircle className="h-8 w-8 text-yellow-500" />, actionText: 'OK', onAction: () => setModalConfig(null) });
      return;
    }
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const paxWithType = passengers.map(p => ({ ...p, flightType }));
      const res = await fetch(`${API}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ flightId: parseInt(flightId), totalPrice: getPrice(), cabinClass, passengerCounts, passengers: paxWithType, seatNumbers: selectedSeats }),
      });
      if (res.ok) {
        const data = await res.json();
        await Promise.all(selectedSeats.map(seatNumber =>
          fetch(`${API}/seats/reserve`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ flightId: parseInt(flightId), seatNumber, bookingId: data.id }),
          })
        ));
        navigate(`/payment/${data.id}`, { state: { booking: data, flight } });
      } else {
        const err = await res.json().catch(() => null);
        if (err?.message === 'You have already booked this flight.') {
          setModalConfig({ title: 'Already Booked', message: err.message, icon: <CheckCircle className="h-8 w-8 text-primary" />, actionText: 'Go to Dashboard', onAction: () => navigate('/dashboard', { replace: true }) });
        } else {
          setModalConfig({ title: 'Booking Failed', message: err?.message || 'Could not process your booking.', icon: <AlertCircle className="h-8 w-8 text-red-500" />, actionText: 'Try Again', onAction: () => setModalConfig(null), isDestructive: true });
        }
      }
    } catch (err) { console.error(err); } finally { setSubmitting(false); }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen"><Loader2 className="animate-spin h-12 w-12 text-primary" /></div>;
  if (!flight) return <div className="text-center py-20 text-slate-500">Flight not found.</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-primary text-white p-4 shadow-md sticky top-0 z-30">
        <div className="container mx-auto flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tighter">Passenger Registration</h1>
            <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">
              {flightType === 'International' ? '🌍 International Flight — Passport Required' : '🏠 Domestic Flight'}
            </p>
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="bg-primary/10 h-1">
        <div className="bg-primary h-1 transition-all" style={{ width: allReady() ? '100%' : '30%' }} />
      </div>

      <main className="container mx-auto mt-10 px-4 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <SeatSelection flightId={flightId} requiredSeats={seatsNeeded} onSelect={setSelectedSeats} />

            {passengers.map((pax, i) => (
              <PassengerStepForm
                key={i}
                index={i}
                total={passengers.length}
                data={pax}
                onChange={updated => setPassengers(prev => prev.map((p, j) => j === i ? updated : p))}
                flightType={flightType}
                isLast={i === passengers.length - 1}
              />
            ))}

            <button
              disabled={submitting || !allReady()}
              onClick={handleSubmit}
              className="w-full bg-primary hover:bg-blue-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-black py-5 rounded-2xl transition-all hover:scale-[1.01] active:scale-95 shadow-xl flex items-center justify-center gap-3"
            >
              {submitting ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                <><ShieldCheck className="h-5 w-5" /> Confirm Booking & Proceed to Payment</>
              )}
            </button>

            {!allReady() && (
              <p className="text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest -mt-4">
                Complete all passenger forms above to proceed
              </p>
            )}
          </div>

          {/* Flight Summary */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl shadow-xl p-6 sticky top-24 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-400" />
              <h3 className="text-base font-black text-slate-800 mb-5 uppercase tracking-tight">Flight Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-xl"><Plane className="h-5 w-5 text-primary" /></div>
                  <div>
                    <p className="font-bold text-slate-700">{flight.airline}</p>
                    <p className="text-[10px] font-black text-primary uppercase">{cabinClass} Class</p>
                  </div>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-4">
                  <div><p className="text-[10px] font-black text-slate-400 uppercase">From</p><p className="font-bold text-slate-800">{flight.departure_city}</p></div>
                  <div className="text-right"><p className="text-[10px] font-black text-slate-400 uppercase">To</p><p className="font-bold text-slate-800">{flight.arrival_city}</p></div>
                </div>
                <div className={`text-center py-2 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest ${flightType === 'International' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
                  {flightType} Flight
                </div>
                <div className="space-y-2 border-t border-slate-100 pt-4">
                  {passengerCounts.adults > 0 && <div className="flex justify-between text-sm text-slate-500"><span>Adults ({passengerCounts.adults} × ${getBasePrice().toFixed(2)})</span><span>${(passengerCounts.adults * getBasePrice()).toFixed(2)}</span></div>}
                  {passengerCounts.children > 0 && <div className="flex justify-between text-sm text-slate-500"><span>Children ({passengerCounts.children})</span><span>${(passengerCounts.children * getBasePrice() * 0.9).toFixed(2)}</span></div>}
                  {passengerCounts.infants > 0 && <div className="flex justify-between text-sm text-slate-500"><span>Infants ({passengerCounts.infants})</span><span>$0.00</span></div>}
                  <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total</span>
                    <span className="text-3xl font-black text-primary">${getPrice()}</span>
                  </div>
                </div>
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500"><Briefcase className="h-4 w-4 text-green-500" /><span>7kg Carry-on</span></div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500"><Briefcase className="h-4 w-4 text-green-500" /><span>23kg Checked Bag</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Timeout warning */}
      {showTimeoutWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><Clock className="h-8 w-8 text-red-500" /></div>
            <h3 className="text-2xl font-black text-gray-800 mb-2">Session Expiring</h3>
            <p className="text-gray-600 font-medium mb-6">Your session will expire in 1 minute due to inactivity.</p>
            <button onClick={() => setShowTimeoutWarning(false)} className="w-full bg-primary text-white font-black py-4 rounded-2xl">Continue Booking</button>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalConfig && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${modalConfig.isDestructive ? 'bg-red-100' : 'bg-blue-50'}`}>{modalConfig.icon}</div>
            <h3 className="text-2xl font-black text-gray-800 mb-2">{modalConfig.title}</h3>
            <p className="text-gray-600 font-medium mb-6">{modalConfig.message}</p>
            <button onClick={modalConfig.onAction} className={`w-full text-white font-black py-4 rounded-2xl ${modalConfig.isDestructive ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-blue-800'}`}>{modalConfig.actionText}</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
