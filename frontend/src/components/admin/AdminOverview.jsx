import React from 'react';
import { Plane, Users, ShoppingBag, TrendingUp, Clock, AlertTriangle, CheckCircle2, Activity } from 'lucide-react';

const AdminOverview = ({ stats }) => {
  const cards = [
    { 
      label: 'Revenue', 
      value: `$${parseFloat(stats.total_revenue || 0).toLocaleString()}`, 
      sub: 'Total Confirmed',
      icon: ShoppingBag, 
      color: 'text-green-500', 
      bg: 'bg-green-500/10',
      trend: '+12.5%'
    },
    { 
      label: 'Bookings', 
      value: stats.total_bookings || 0, 
      sub: 'All time reservations',
      icon: Activity, 
      color: 'text-blue-500', 
      bg: 'bg-blue-500/10',
      trend: '+5.2%'
    },
    { 
      label: 'Registered Passengers', 
      value: stats.total_users || 0, 
      sub: 'Active traveler accounts',
      icon: Users, 
      color: 'text-purple-500', 
      bg: 'bg-purple-500/10',
      trend: '+2.1%'
    },
    { 
      label: 'Occupancy', 
      value: `${Math.round(stats.avg_occupancy || 0)}%`, 
      sub: 'Avg. seat load factor',
      icon: TrendingUp, 
      color: 'text-orange-500', 
      bg: 'bg-orange-500/10',
      trend: 'Optimal'
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-white/80 backdrop-blur-md p-6 rounded-[2.5rem] border border-slate-200/50 shadow-sm hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={`${card.bg} p-3 rounded-2xl`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
              <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${card.trend.includes('+') ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                {card.trend}
              </span>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{card.label}</p>
            <h3 className="text-3xl font-black text-slate-800 tracking-tighter mb-1">{card.value}</h3>
            <p className="text-xs font-bold text-slate-400">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* System Health */}
        <div className="lg:col-span-2 bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full -mr-32 -mt-32"></div>
           <div className="relative z-10">
             <div className="flex justify-between items-center mb-8">
               <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                 <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                 System Health: Normal
               </h3>
               <span className="text-xs font-bold text-slate-400 bg-white/5 px-4 py-2 rounded-xl">Live Feedback</span>
             </div>

             <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Active Flights</p>
                  <p className="text-4xl font-black text-accent">{stats.total_flights || 0}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">On Time %</p>
                  <p className="text-4xl font-black text-green-400">94.2%</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Delayed</p>
                  <p className="text-4xl font-black text-orange-400">{stats.delayed_flights || 0}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Cancelled</p>
                  <p className="text-4xl font-black text-red-400">{stats.cancelled_flights || 0}</p>
                </div>
             </div>

             <div className="mt-12 p-6 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-accent p-3 rounded-2xl">
                    <AlertTriangle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-black text-sm uppercase">Active Alerts</p>
                    <p className="text-xs text-slate-400 font-bold">Weather advisory for Addis Ababa (ADD) - Possible delays</p>
                  </div>
                </div>
                <button className="bg-white text-primary font-black px-6 py-3 rounded-xl text-xs uppercase hover:scale-105 transition-all">Resolve</button>
             </div>
           </div>
        </div>

        {/* Real-time Activity Feed */}
        <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
           <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-8">Recent Activity</h3>
           <div className="space-y-6">
              {[
                { type: 'booking', msg: 'New booking #SB-2041', time: '2m ago', icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-50' },
                { type: 'checkin', msg: 'Passenger checked in for FL302', time: '15m ago', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
                { type: 'delay', msg: 'FL102 delayed by 15 mins', time: '24m ago', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
                { type: 'user', msg: 'New passenger registered', time: '1h ago', icon: Users, color: 'text-purple-500', bg: 'bg-purple-50' },
              ].map((act, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className={`${act.bg} ${act.color} p-3 rounded-2xl h-fit group-hover:scale-110 transition-all`}>
                    <act.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-grow pb-6 border-b border-slate-50 last:border-0">
                    <p className="text-sm font-bold text-slate-700">{act.msg}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{act.time}</p>
                  </div>
                </div>
              ))}
           </div>
           <button className="w-full mt-4 py-4 text-xs font-black text-primary uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all">View System Logs</button>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
