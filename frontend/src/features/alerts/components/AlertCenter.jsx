import React, { useState, useEffect } from 'react';
import {
  Bell, AlertTriangle, Wrench, X, CheckCheck,
  AlertCircle, Info, Plane, RefreshCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Priority config ---
const PRIORITY_CONFIG = {
  high: {
    badge: 'bg-red-50 text-red-600 border-red-100',
    icon: AlertTriangle,
    iconColor: 'text-red-500',
    dot: 'bg-red-500',
    border: 'border-l-4 border-red-400'
  },
  medium: {
    badge: 'bg-orange-50 text-orange-600 border-orange-100',
    icon: AlertCircle,
    iconColor: 'text-orange-500',
    dot: 'bg-orange-400',
    border: 'border-l-4 border-orange-400'
  },
  low: {
    badge: 'bg-blue-50 text-blue-600 border-blue-100',
    icon: Info,
    iconColor: 'text-blue-500',
    dot: 'bg-blue-400',
    border: 'border-l-4 border-blue-400'
  }
};

const TYPE_ICONS = {
  capacity: Plane,
  cancellation: AlertTriangle,
  maintenance: Wrench,
  booking: Bell,
  system: Info
};

const AlertItem = ({ alert, onMarkRead, isComputed }) => {
  const priority = alert.priority || 'low';
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.low;
  const TypeIcon = TYPE_ICONS[alert.type] || Bell;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`bg-white rounded-3xl p-6 shadow-sm border border-slate-100 ${cfg.border} ${alert.is_read ? 'opacity-60' : ''} transition-opacity`}
    >
      <div className="flex gap-5 items-start">
        {/* Priority dot + icon */}
        <div className="relative mt-1">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${priority === 'high' ? 'bg-red-50' : priority === 'medium' ? 'bg-orange-50' : 'bg-blue-50'}`}>
            <TypeIcon className={`h-5 w-5 ${cfg.iconColor}`} />
          </div>
          {!alert.is_read && (
            <div className={`absolute -top-1 -right-1 w-3 h-3 ${cfg.dot} rounded-full border-2 border-white`} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${cfg.badge} mb-2`}>
                {priority} priority
              </span>
              <h4 className="font-black text-slate-800 text-sm">{alert.title}</h4>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                {new Date(alert.created_at).toLocaleDateString()}{' '}
                {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              {!isComputed && !alert.is_read && (
                <button
                  onClick={() => onMarkRead(alert.id)}
                  className="p-2 text-slate-300 hover:text-green-500 hover:bg-green-50 rounded-xl transition-colors"
                  title="Mark as read"
                >
                  <CheckCheck className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          <p className="text-sm text-slate-500 font-medium mt-1 leading-relaxed">{alert.message}</p>
          {isComputed && (
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-2 inline-block">
              ⚙ System-generated • Live
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const AlertCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'high' | 'system'

  const fetchData = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      const token = localStorage.getItem('token');
      const API = import.meta.env.VITE_API_URL || '/api';
      const res = await fetch(`${API}/admin/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch alerts');
      const json = await res.json();
      setNotifications(json.notifications || []);
      setAlerts(json.alerts || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const markRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const API = import.meta.env.VITE_API_URL || '/api';
      await fetch(`${API}/admin/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (e) {
      console.error('Failed to mark read:', e);
    }
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    await Promise.all(unread.map(n => markRead(n.id)));
  };

  // Filter logic
  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'high') return n.priority === 'high';
    return true;
  });

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'unread' || filter === 'system') return true;
    if (filter === 'high') return a.priority === 'high';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const highCount = [...notifications, ...alerts].filter(x => x.priority === 'high').length;

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

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-slate-800 flex items-center gap-3">
            <Bell className="h-6 w-6 text-primary" /> Alert Center
            {(unreadCount + alerts.length) > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full">
                {unreadCount + alerts.length}
              </span>
            )}
          </h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Operational intelligence & system notifications</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => fetchData(true)}
            className={`p-3 rounded-xl border border-slate-100 bg-white shadow-sm text-slate-400 hover:text-primary transition-all ${refreshing ? 'animate-spin text-primary' : ''}`}
            title="Refresh">
            <RefreshCcw className="h-4 w-4" />
          </button>
          {unreadCount > 0 && (
            <button onClick={markAllRead}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-green-600 hover:bg-green-50 border border-green-100 transition-all">
              <CheckCheck className="h-4 w-4" /> Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Live Alerts', value: alerts.length, color: 'from-red-500 to-orange-600' },
          { label: 'Unread', value: unreadCount, color: 'from-primary to-blue-800' },
          { label: 'High Priority', value: highCount, color: 'from-amber-500 to-yellow-600' },
          { label: 'Total Stored', value: notifications.length, color: 'from-slate-600 to-slate-800' }
        ].map((stat, i) => (
          <div key={i} className={`bg-gradient-to-br ${stat.color} p-6 rounded-3xl text-white shadow-lg`}>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/60">{stat.label}</p>
            <p className="text-3xl font-black mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'All' },
          { key: 'unread', label: 'Unread' },
          { key: 'high', label: 'High Priority' },
          { key: 'system', label: 'System Alerts' }
        ].map(tab => (
          <button key={tab.key} onClick={() => setFilter(tab.key)}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
              filter === tab.key
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'bg-white text-slate-400 border border-slate-200 hover:border-primary hover:text-primary'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Live System Alerts (computed) */}
      {(filter === 'all' || filter === 'high' || filter === 'system') && filteredAlerts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Live Operational Alerts
          </h3>
          <AnimatePresence>
            {filteredAlerts.map(alert => (
              <AlertItem key={alert.id} alert={alert} onMarkRead={() => {}} isComputed={true} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Stored Notifications */}
      {filter !== 'system' && (
        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
            Stored Notifications
          </h3>
          {filteredNotifications.length > 0 ? (
            <AnimatePresence>
              {filteredNotifications.map(n => (
                <AlertItem key={n.id} alert={n} onMarkRead={markRead} isComputed={false} />
              ))}
            </AnimatePresence>
          ) : (
            <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm">
              <Bell className="h-10 w-10 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-bold">
                {filter === 'unread' ? 'All caught up! No unread notifications.' : 'No notifications found.'}
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default AlertCenter;
