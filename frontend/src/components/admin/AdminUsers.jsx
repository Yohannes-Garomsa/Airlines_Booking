import React, { useState, useEffect } from 'react';
import { Users, Loader2, Shield, ShieldAlert, Ban, CheckCircle, Trash2, Mail } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${import.meta.env.VITE_API_URL || '/api'}/admin/users/${id}/status`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchUsers();
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const handleChangeRole = async (id, currentRole) => {
    try {
      const token = localStorage.getItem('token');
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      await fetch(`${import.meta.env.VITE_API_URL || '/api'}/admin/users/${id}/role`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ role: newRole })
      });
      fetchUsers();
    } catch (err) {
      console.error('Failed to change role:', err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50">
           <h3 className="text-xl font-black text-slate-800 tracking-tighter uppercase">User Base Control</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">User</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Email</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Role</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="5" className="py-20 text-center"><Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" /></td></tr>
              ) : users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${u.role === 'admin' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                        {u.name.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-800 text-sm">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Mail className="h-3 w-3" />
                      <span className="text-sm font-bold">{u.email}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border inline-flex items-center gap-1.5 ${u.role === 'admin' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                      {u.role === 'admin' ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
                      {u.role}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {u.is_blocked ? (
                      <div className="flex items-center gap-1.5 text-red-500 font-black text-[10px] uppercase tracking-widest">
                        <Ban className="h-3 w-3" /> Blocked
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-green-500 font-black text-[10px] uppercase tracking-widest">
                        <CheckCircle className="h-3 w-3" /> Active
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleChangeRole(u.id, u.role)}
                        className="px-3 py-2 bg-slate-50 hover:bg-amber-50 text-slate-400 hover:text-amber-600 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest border border-transparent hover:border-amber-100"
                      >
                        Change Role
                      </button>
                      <button 
                        onClick={() => handleToggleBlock(u.id)}
                        className={`p-2 rounded-xl transition-all ${u.is_blocked ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}
                      >
                        {u.is_blocked ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
