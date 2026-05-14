import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, TrendingUp, AlertCircle, ArrowUpRight, ArrowDownRight, RefreshCcw, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock Exchange Rates for simulation
const EXCHANGE_RATES = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  ETB: 57.25, // Mock rate for Ethiopian Birr
};

const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  ETB: 'Br',
};

const RevenueFX = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currency, setCurrency] = useState('USD');
  const [fxRefreshing, setFxRefreshing] = useState(false);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem('token');
        const API_URL = import.meta.env.VITE_API_URL || '/api';
        const response = await fetch(`${API_URL}/admin/payments`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch financial data');
        const data = await response.json();
        setPayments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const simulateFxRefresh = () => {
    setFxRefreshing(true);
    setTimeout(() => {
      // In a real app, we'd fetch live rates here
      setFxRefreshing(false);
    }, 1500);
  };

  const formatMoney = (amount) => {
    // Convert from base USD
    const converted = amount * EXCHANGE_RATES[currency];
    return `${CURRENCY_SYMBOLS[currency]}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Calculations
  const successfulPayments = payments.filter(p => p.status === 'completed');
  const pendingPayments = payments.filter(p => p.status === 'pending');
  const refundedPayments = payments.filter(p => p.status === 'refunded' || p.status === 'failed');

  const totalRevenue = successfulPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
  const pendingRevenue = pendingPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
  const avgTransaction = successfulPayments.length ? totalRevenue / successfulPayments.length : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-3xl font-bold flex items-center gap-3">
        <AlertCircle className="h-6 w-6" /> Error loading financials: {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header and FX Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-200 gap-6">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-slate-800 flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-primary" /> Revenue & FX Console
          </h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Live Financial Telemetry</p>
        </div>
        
        <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100">
          <button 
            onClick={simulateFxRefresh}
            className={`p-3 rounded-xl bg-white shadow-sm border border-slate-100 text-slate-400 hover:text-primary transition-all ${fxRefreshing ? 'animate-spin text-primary' : ''}`}
            title="Refresh FX Rates"
          >
            <RefreshCcw className="h-4 w-4" />
          </button>
          
          <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
            {['USD', 'EUR', 'GBP', 'ETB'].map(cur => (
              <button
                key={cur}
                onClick={() => setCurrency(cur)}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  currency === cur 
                  ? 'bg-white text-primary shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {cur}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2"></div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 relative z-10">Net Revenue (Cleared)</p>
          <h3 className="text-4xl font-black text-white relative z-10">{formatMoney(totalRevenue)}</h3>
          <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-green-400 bg-green-400/10 w-max px-3 py-1 rounded-full relative z-10">
            <ArrowUpRight className="h-3 w-3" /> +12.5% this month
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-200"
        >
          <div className="flex justify-between items-start mb-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pending Ledger</p>
            <div className="p-2 bg-orange-50 text-orange-500 rounded-lg"><Clock className="h-4 w-4" /></div>
          </div>
          <h3 className="text-3xl font-black text-slate-800">{formatMoney(pendingRevenue)}</h3>
          <p className="text-xs font-bold text-slate-400 mt-4">{pendingPayments.length} transactions awaiting clearance</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-200"
        >
          <div className="flex justify-between items-start mb-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Avg Transaction Value</p>
            <div className="p-2 bg-blue-50 text-blue-500 rounded-lg"><Activity className="h-4 w-4" /></div>
          </div>
          <h3 className="text-3xl font-black text-slate-800">{formatMoney(avgTransaction)}</h3>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-50 w-max px-3 py-1 rounded-full">
            <ArrowDownRight className="h-3 w-3" /> -2.1% this week
          </div>
        </motion.div>
      </div>

      {/* Transaction Ledger Table */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-700">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 font-black text-[10px] uppercase text-slate-400">
                <th className="p-6">Transaction ID</th>
                <th className="p-6">Date / Time</th>
                <th className="p-6">User / PNR</th>
                <th className="p-6">Method</th>
                <th className="p-6">Amount</th>
                <th className="p-6">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.length > 0 ? payments.map((payment) => (
                <tr key={payment.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="p-6 font-bold text-slate-600 font-mono text-xs">{payment.transaction_id || `TXN-${payment.id}`}</td>
                  <td className="p-6">
                    <p className="font-bold text-slate-700">{new Date(payment.payment_date).toLocaleDateString()}</p>
                    <p className="text-[10px] font-black uppercase text-slate-400">{new Date(payment.payment_date).toLocaleTimeString()}</p>
                  </td>
                  <td className="p-6">
                    <p className="font-bold text-slate-700">{payment.user_name}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">{payment.pnr}</p>
                  </td>
                  <td className="p-6">
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                      {payment.payment_method}
                    </span>
                  </td>
                  <td className="p-6 font-black text-slate-800">
                    {formatMoney(parseFloat(payment.amount))}
                  </td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                      payment.status === 'completed' ? 'bg-green-50 text-green-600 border-green-100' :
                      payment.status === 'failed' || payment.status === 'refunded' ? 'bg-red-50 text-red-600 border-red-100' :
                      'bg-orange-50 text-orange-600 border-orange-100'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-slate-400 font-bold">No transactions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Simple Clock icon component since it wasn't imported from lucide-react in the main import
const Clock = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

export default RevenueFX;
