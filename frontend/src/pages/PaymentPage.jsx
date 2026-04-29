import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, Lock, ShieldCheck, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

const PaymentPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const booking = state?.booking;
  const flight = state?.flight;

  const handlePayment = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bookingId: parseInt(bookingId),
          amount: booking?.total_price || flight?.price,
          paymentMethod: 'visa_card'
        })
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate(`/ticket/${bookingId}`);
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.message || 'Payment failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during payment processing.');
    } finally {
      setLoading(false);
    }
  };

  if (!bookingId) return <div className="text-center py-20">Invalid booking session.</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-xl w-full">
        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">
          {/* Top Banner */}
          <div className="bg-primary p-10 text-white relative">
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] opacity-60 mb-1">Total Amount</p>
                <h1 className="text-5xl font-black tracking-tighter">${booking?.total_price || flight?.price}</h1>
              </div>
              <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
                <ShieldCheck className="h-8 w-8 text-accent" />
              </div>
            </div>
            <div className="mt-8 flex gap-2 items-center text-xs font-bold bg-black/20 w-fit px-4 py-2 rounded-full">
              <Lock className="h-3 w-3" />
              <span>SECURE ENCRYPTED PAYMENT</span>
            </div>
          </div>

          <div className="p-10">
            {error && (
              <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <p className="text-red-700 font-bold text-sm">{error}</p>
              </div>
            )}

            {success ? (
              <div className="text-center py-10 animate-bounce">
                <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-10 w-10 text-green-500" />
                </div>
                <h2 className="text-2xl font-black text-gray-800">Payment Successful!</h2>
                <p className="text-gray-500 font-medium">Generating your ticket...</p>
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  <div className="bg-slate-50 p-6 rounded-2xl border-2 border-primary/5">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Saved Card</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-white p-2 rounded-lg shadow-sm">
                           <CreditCard className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">•••• •••• •••• 4242</p>
                          <p className="text-xs text-gray-400 font-bold uppercase">Expires 12/28</p>
                        </div>
                      </div>
                      <div className="w-6 h-6 rounded-full border-4 border-primary flex items-center justify-center">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-4 rounded-2xl transition-all">
                      Add New Card
                    </button>
                    <button className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-4 rounded-2xl transition-all">
                      PayPal
                    </button>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="w-full bg-primary hover:bg-blue-800 disabled:bg-blue-300 text-white font-black py-5 rounded-2xl transition-all transform hover:scale-[1.01] active:scale-95 shadow-xl flex items-center justify-center gap-3 mt-10"
                >
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <>Pay Now <ShieldCheck className="h-5 w-5" /></>}
                </button>
                
                <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-6">
                  Payments are processed by SkyBound Secure
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
