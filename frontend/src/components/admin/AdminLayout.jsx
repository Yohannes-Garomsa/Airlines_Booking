import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const AdminLayout = () => {
  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar />
      <div className="flex-grow p-10 overflow-y-auto h-screen">
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Admin Control Center</h2>
            <p className="text-slate-400 font-bold text-sm">Manage flights, bookings, and users from one place.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3 px-4">
              <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white font-black text-xs">A</div>
              <span className="font-bold text-xs text-slate-600 uppercase tracking-widest">Admin User</span>
            </div>
          </div>
        </header>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
