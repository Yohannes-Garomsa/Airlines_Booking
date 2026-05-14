import React, { useState, useEffect } from 'react';
import {
  TrendingUp, BarChart3, Map, Users, AlertCircle, CreditCard,
  ArrowUpRight, ArrowDownRight, Plane
} from 'lucide-react';
import { motion } from 'framer-motion';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revenueView, setRevenueView] = useState('revenue'); // 'revenue' | 'bookings'

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const token = localStorage.getItem('token');
        const API = import.meta.env.VITE_API_URL || '/api';
        const res = await fetch(`${API}/admin/analytics`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch analytics');
        const json = await res.json();
        setData(json);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center py-32">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
    </div>
  );

  if (error) return (
    <div className="bg-red-50 text-red-600 p-6 rounded-3xl font-bold flex items-center gap-3">
      <AlertCircle className="h-6 w-6" /> {error}
    </div>
  );

  const { popularRoutes = [], revenueTrend = [], cabinSplit = [], bookingVelocity = [], cancellationStats = {} } = data;

  // Build chart data
  const chartValues = revenueTrend.map(d =>
    revenueView === 'revenue' ? parseFloat(d.daily_revenue) : parseInt(d.daily_bookings)
  );
  const maxVal = Math.max(...chartValues, 1);

  // Cancellation rate
  const cancelRate = cancellationStats.total > 0
    ? ((cancellationStats.cancelled / cancellationStats.total) * 100).toFixed(1)
    : '0.0';

  // Total revenue from trend
  const totalTrendRevenue = revenueTrend.reduce((sum, d) => sum + parseFloat(d.daily_revenue || 0), 0);
  const totalTrendBookings = revenueTrend.reduce((sum, d) => sum + parseInt(d.daily_bookings || 0), 0);

  // Cabin split helpers
  const economyRow = cabinSplit.find(c => c.cabin_class?.toLowerCase() === 'economy') || {};
  const businessRow = cabinSplit.find(c => c.cabin_class?.toLowerCase() === 'business') || {};
  const totalCabinCount = parseInt(economyRow.count || 0) + parseInt(businessRow.count || 0) || 1;

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-slate-800 flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-primary" /> Analytics Intelligence
          </h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">30-day performance telemetry</p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: 'Revenue (30d)', value: `$${totalTrendRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
            icon: CreditCard, color: 'from-primary to-blue-900', trend: '+12.4%', up: true
          },
          {
            label: 'Bookings (30d)', value: totalTrendBookings.toLocaleString(),
            icon: TrendingUp, color: 'from-emerald-500 to-green-700', trend: '+8.1%', up: true
          },
          {
            label: 'Cancellation Rate', value: `${cancelRate}%`,
            icon: AlertCircle, color: 'from-orange-500 to-red-600', trend: '-1.2%', up: false
          },
          {
            label: 'Popular Routes', value: popularRoutes.length,
            icon: Map, color: 'from-violet-500 to-purple-700', trend: 'Tracked', up: null
          }
        ].map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className={`bg-gradient-to-br ${kpi.color} p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden`}
          >
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
            <kpi.icon className="h-7 w-7 text-white/60 mb-4 relative z-10" />
            <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1 relative z-10">{kpi.label}</p>
            <p className="text-3xl font-black relative z-10">{kpi.value}</p>
            {kpi.up !== null && (
              <div className={`mt-3 flex items-center gap-1 text-[10px] font-black ${kpi.up ? 'text-green-300' : 'text-red-300'} relative z-10`}>
                {kpi.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {kpi.trend}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Revenue / Booking Trend Chart */}
      <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 blur-[100px] rounded-full" />
        <div className="flex justify-between items-center mb-8 relative z-10">
          <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-primary" />
            {revenueView === 'revenue' ? 'Revenue Velocity' : 'Booking Velocity'}
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">(Last 30 days)</span>
          </h3>
          <div className="flex bg-white/5 rounded-xl p-1 gap-1">
            {['revenue', 'bookings'].map(v => (
              <button key={v} onClick={() => setRevenueView(v)}
                className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${revenueView === v ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'}`}>
                {v}
              </button>
            ))}
          </div>
        </div>

        {chartValues.length > 0 ? (
          <div className="relative z-10">
            {/* Y-axis labels */}
            <div className="flex items-end gap-1 h-40">
              {chartValues.map((val, i) => {
                const pct = (val / maxVal) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col justify-end items-center group cursor-pointer relative">
                    <div
                      className="w-full rounded-t-lg bg-primary/30 hover:bg-primary transition-all duration-300"
                      style={{ height: `${pct}%`, minHeight: '4px' }}
                    />
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity bg-white text-slate-800 text-[10px] font-black px-3 py-2 rounded-xl shadow-xl whitespace-nowrap z-20">
                      {revenueView === 'revenue' ? `$${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : `${val} bookings`}
                      <br /><span className="text-slate-400">{revenueTrend[i] ? new Date(revenueTrend[i].day).toLocaleDateString() : ''}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] font-black uppercase text-slate-600 mt-3">
              <span>{revenueTrend[0] ? new Date(revenueTrend[0].day).toLocaleDateString() : '30d ago'}</span>
              <span>Today</span>
            </div>
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center text-slate-600 font-black uppercase text-[10px] tracking-widest">
            No trend data yet — bookings will populate this chart.
          </div>
        )}
      </div>

      {/* Bottom row: Routes + Cabin Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Popular Routes Leaderboard */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-200 shadow-xl">
          <h3 className="text-lg font-black uppercase tracking-tight mb-8 flex items-center gap-3">
            <Plane className="h-5 w-5 text-primary" /> Route Leaderboard
          </h3>
          <div className="space-y-4">
            {popularRoutes.length > 0 ? popularRoutes.map((route, i) => {
              const pct = (route.booking_count / (popularRoutes[0]?.booking_count || 1)) * 100;
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                  className="group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-black text-slate-200 w-8">#{i + 1}</span>
                      <div>
                        <p className="font-black text-slate-800 text-sm">
                          {route.departure_city} <span className="text-primary mx-1">→</span> {route.arrival_city}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-800">{route.booking_count} <span className="text-[10px] font-bold text-slate-400">bookings</span></p>
                      {route.route_revenue && (
                        <p className="text-[10px] font-black text-primary">${parseFloat(route.route_revenue).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                      )}
                    </div>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full"
                      initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: i * 0.07 }} />
                  </div>
                </motion.div>
              );
            }) : (
              <p className="text-center text-slate-400 font-bold py-10">No route data yet.</p>
            )}
          </div>
        </div>

        {/* Cabin Split + Cancellation */}
        <div className="flex flex-col gap-6">

          {/* Cabin class donut-style */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl flex-1">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Cabin Class Split</h3>
            <div className="space-y-5">
              {[
                { label: 'Economy', row: economyRow, color: 'bg-primary' },
                { label: 'Business', row: businessRow, color: 'bg-amber-400' }
              ].map(({ label, row, color }) => {
                const pct = Math.round((parseInt(row.count || 0) / totalCabinCount) * 100);
                return (
                  <div key={label}>
                    <div className="flex justify-between text-xs font-black text-slate-600 mb-2">
                      <span>{label}</span>
                      <span>{row.count || 0} <span className="text-slate-300">({pct}%)</span></span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div className={`h-full ${color} rounded-full`}
                        initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.9 }} />
                    </div>
                    {row.revenue && (
                      <p className="text-[10px] text-slate-400 font-bold mt-1">
                        Rev: ${parseFloat(row.revenue).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cancellation widget */}
          <div className={`p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden ${parseFloat(cancelRate) >= 10 ? 'bg-gradient-to-br from-red-600 to-orange-600' : 'bg-gradient-to-br from-slate-700 to-slate-900'}`}>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
            <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2 relative z-10">Cancellation Rate</p>
            <p className="text-5xl font-black relative z-10">{cancelRate}%</p>
            <p className="text-xs font-bold text-white/50 mt-3 relative z-10">
              {cancellationStats.cancelled || 0} of {cancellationStats.total || 0} total bookings
            </p>
            <p className={`text-[10px] font-black uppercase tracking-widest mt-2 relative z-10 ${parseFloat(cancelRate) >= 10 ? 'text-red-200' : 'text-green-400'}`}>
              {parseFloat(cancelRate) >= 10 ? '⚠ Above threshold — investigate' : '✓ Within normal range'}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Analytics;
