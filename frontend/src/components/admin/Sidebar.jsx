import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plane, Users, ShoppingBag, LayoutDashboard, Settings, LogOut, MapPin } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, path: '/admin' },
    { id: 'flights', label: 'Flights', icon: Plane, path: '/admin/flights' },
    { id: 'bookings', label: 'Bookings', icon: ShoppingBag, path: '/admin/bookings' },
    { id: 'users', label: 'Users', icon: Users, path: '/admin/users' },
  ];

  return (
    <div className="w-72 bg-white h-screen border-r border-slate-100 flex flex-col sticky top-0">
      <div className="p-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-xl">
            <Plane className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-black tracking-tighter uppercase text-slate-800">SkyBound <span className="text-primary text-[10px] block font-black tracking-widest -mt-1">Admin Panel</span></h1>
        </Link>
      </div>

      <nav className="flex-grow px-4 mt-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-black text-xs uppercase tracking-widest ${
                    isActive 
                      ? 'bg-primary text-white shadow-xl shadow-blue-100' 
                      : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-8 border-t border-slate-50">
        <button className="flex items-center gap-4 text-slate-400 hover:text-red-500 transition-colors font-black text-xs uppercase tracking-widest">
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
