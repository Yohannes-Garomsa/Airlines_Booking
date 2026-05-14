import React, { useState, useEffect } from 'react';
import { Wrench, Plane, Plus, Trash2, Edit2, AlertCircle, CheckCircle2, ShieldCheck, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FleetManagement = () => {
  const [fleet, setFleet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    model: '',
    tail_number: '',
    economy_capacity: '',
    business_capacity: '',
    status: 'Active',
    last_maintenance: ''
  });
  const [formLoading, setFormLoading] = useState(false);

  const fetchFleet = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${API_URL}/admin/fleet`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch fleet data');
      const data = await response.json();
      setFleet(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFleet();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openModal = (aircraft = null) => {
    if (aircraft) {
      setEditingId(aircraft.id);
      setFormData({
        model: aircraft.model,
        tail_number: aircraft.tail_number,
        economy_capacity: aircraft.economy_capacity,
        business_capacity: aircraft.business_capacity,
        status: aircraft.status,
        last_maintenance: aircraft.last_maintenance ? aircraft.last_maintenance.split('T')[0] : ''
      });
    } else {
      setEditingId(null);
      setFormData({
        model: '',
        tail_number: '',
        economy_capacity: '',
        business_capacity: '',
        status: 'Active',
        last_maintenance: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || '/api';
      const url = editingId ? `${API_URL}/admin/fleet/${editingId}` : `${API_URL}/admin/fleet`;
      const method = editingId ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        economy_capacity: parseInt(formData.economy_capacity),
        business_capacity: parseInt(formData.business_capacity)
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Operation failed');
      }
      
      await fetchFleet();
      closeModal();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setFormLoading(false);
    }
  };

  const deleteAircraft = async (id) => {
    if (!window.confirm('Are you sure you want to remove this aircraft from the fleet? This action cannot be undone.')) return;
    
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${API_URL}/admin/fleet/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to delete aircraft');
      
      await fetchFleet();
    } catch (err) {
      alert(`Error deleting aircraft: ${err.message}`);
    }
  };

  const toggleMaintenance = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${API_URL}/admin/fleet/${id}/maintenance`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to update status');
      
      await fetchFleet();
    } catch (err) {
      alert(`Error updating status: ${err.message}`);
    }
  };

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
        <AlertCircle className="h-6 w-6" /> Error loading fleet: {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Actions */}
      <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-200">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-slate-800">Fleet Operations</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Manage aircraft configuration and maintenance</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-primary hover:bg-blue-800 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 transition-all hover:scale-105 shadow-xl shadow-primary/30"
        >
          <Plus className="h-4 w-4" /> Register Aircraft
        </button>
      </div>

      {/* Fleet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {fleet.map((aircraft) => (
          <motion.div
            key={aircraft.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] border border-slate-200 shadow-lg overflow-hidden group hover:shadow-2xl transition-all duration-300"
          >
            <div className={`h-32 p-8 relative overflow-hidden ${aircraft.status === 'Active' ? 'bg-gradient-to-br from-primary to-blue-900' : 'bg-gradient-to-br from-orange-500 to-red-600'}`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-black text-white">{aircraft.model}</h3>
                  <p className="text-white/80 font-black tracking-widest text-[10px] uppercase mt-1">{aircraft.tail_number}</p>
                </div>
                <Plane className="h-10 w-10 text-white/30" />
              </div>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-center">
                <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${aircraft.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                  {aircraft.status}
                </span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Maintained: {aircraft.last_maintenance ? new Date(aircraft.last_maintenance).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Economy</p>
                  <p className="text-xl font-black text-slate-800">{aircraft.economy_capacity} <span className="text-xs text-slate-400">seats</span></p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Business</p>
                  <p className="text-xl font-black text-slate-800">{aircraft.business_capacity} <span className="text-xs text-slate-400">seats</span></p>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => toggleMaintenance(aircraft.id)}
                  title={aircraft.status === 'Active' ? 'Send to Maintenance' : 'Mark as Active'}
                  className={`flex-1 p-3 rounded-xl flex justify-center items-center transition-colors ${aircraft.status === 'Active' ? 'text-orange-500 hover:bg-orange-50' : 'text-green-500 hover:bg-green-50'}`}
                >
                  <Wrench className="h-5 w-5" />
                </button>
                <button
                  onClick={() => openModal(aircraft)}
                  className="flex-1 p-3 rounded-xl flex justify-center items-center text-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <Edit2 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => deleteAircraft(aircraft.id)}
                  className="flex-1 p-3 rounded-xl flex justify-center items-center text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden my-8"
            >
              <div className="bg-primary p-8 flex justify-between items-center">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                  {editingId ? 'Update Aircraft' : 'Register New Aircraft'}
                </h2>
                <button onClick={closeModal} className="text-white/50 hover:text-white transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Aircraft Model</label>
                    <input
                      type="text"
                      name="model"
                      required
                      value={formData.model}
                      onChange={handleInputChange}
                      placeholder="e.g. Boeing 777-300ER"
                      className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Tail Number</label>
                    <input
                      type="text"
                      name="tail_number"
                      required
                      value={formData.tail_number}
                      onChange={handleInputChange}
                      placeholder="e.g. ET-APZ"
                      className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold uppercase focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Economy Capacity</label>
                    <input
                      type="number"
                      name="economy_capacity"
                      required
                      min="0"
                      value={formData.economy_capacity}
                      onChange={handleInputChange}
                      className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Business Capacity</label>
                    <input
                      type="number"
                      name="business_capacity"
                      required
                      min="0"
                      value={formData.business_capacity}
                      onChange={handleInputChange}
                      className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Current Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold focus:ring-2 focus:ring-primary transition-all appearance-none"
                    >
                      <option value="Active">Active / Ready</option>
                      <option value="Maintenance">In Maintenance</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Last Maintenance</label>
                    <input
                      type="date"
                      name="last_maintenance"
                      value={formData.last_maintenance}
                      onChange={handleInputChange}
                      className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>
                </div>
                
                <div className="pt-8 border-t border-slate-100 flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-500 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="bg-primary hover:bg-blue-800 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 transition-all shadow-xl shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {formLoading ? 'Processing...' : (editingId ? 'Update Aircraft' : 'Save Aircraft')} <CheckCircle2 className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FleetManagement;
