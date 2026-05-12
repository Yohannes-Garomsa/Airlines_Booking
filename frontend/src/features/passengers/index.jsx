import React, { useState, useEffect } from 'react';
import { PassengerTable } from './components/PassengerTable';
import { PassengerForm } from './components/PassengerForm';
import { PassengerDetails } from './components/PassengerDetails';
import { passengerService } from './services/passengerService';
import { Button } from "@/components/ui/button";
import { Plus, Users, ShieldCheck, TrendingUp, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PassengerManagement() {
  const [passengers, setPassengers] = useState([]);
  const [viewingPassenger, setViewingPassenger] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPassenger, setEditingPassenger] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPassengers();
  }, []);

  const loadPassengers = async () => {
    setLoading(true);
    try {
      const data = await passengerService.getAll();
      setPassengers(data);
    } catch (error) {
      console.error("Failed to load passengers", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => {
    try {
      await passengerService.create(data);
      setIsFormOpen(false);
      await loadPassengers();
    } catch (error) {
      console.error("Failed to create passenger", error);
    }
  };

  const handleUpdate = async (data) => {
    try {
      await passengerService.update(editingPassenger.id, data);
      setEditingPassenger(null);
      setIsFormOpen(false);
      await loadPassengers();
    } catch (error) {
      console.error("Failed to update passenger", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this passenger record?")) {
      try {
        await passengerService.delete(id);
        await loadPassengers();
      } catch (error) {
        console.error("Failed to delete passenger", error);
      }
    }
  };

  const handleVerify = async (passenger) => {
    try {
      await passengerService.verify(passenger.id, 'Verified', 'Verified via Admin Dashboard');
      await loadPassengers();
    } catch (error) {
      console.error("Failed to verify passenger", error);
    }
  };

  return (
    <div className="space-y-12">
      {/* Feature Header */}
      <div className="flex flex-col md:flex-row justify-between gap-8 items-start md:items-center">
        <div>
          <h2 className="text-4xl font-black uppercase tracking-tight text-slate-800">Passenger Registry</h2>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2 flex items-center gap-2">
            <Users className="h-3 w-3" /> Managed Aviation Personnel & Travellers
          </p>
        </div>
        
        {!isFormOpen && (
          <Button 
            onClick={() => {
              setEditingPassenger(null);
              setIsFormOpen(true);
            }}
            className="bg-primary hover:bg-blue-800 text-white rounded-[1.5rem] h-16 px-10 font-black uppercase text-xs tracking-widest shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95"
          >
            <UserPlus className="h-5 w-5 mr-3" /> Register Passenger
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isFormOpen ? (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
          >
            <PassengerForm 
              initialData={editingPassenger} 
              onSubmit={editingPassenger ? handleUpdate : handleCreate}
              onCancel={() => setIsFormOpen(false)}
            />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-12"
          >
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <StatCard icon={Users} label="Total PAX" value={passengers.length} color="primary" />
              <StatCard icon={ShieldCheck} label="Verified" value={passengers.filter(p => p.status === 'Verified').length} color="green" />
              <StatCard icon={TrendingUp} label="International" value={passengers.filter(p => p.flightType === 'International').length} color="purple" />
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-40">
                <div className="h-16 w-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-8 font-black text-slate-400 uppercase tracking-widest text-[10px]">Syncing Registry...</p>
              </div>
            ) : (
              <PassengerTable 
                passengers={passengers} 
                onView={setViewingPassenger}
                onEdit={(p) => {
                  setEditingPassenger(p);
                  setIsFormOpen(true);
                }}
                onDelete={handleDelete}
                onVerify={handleVerify}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <PassengerDetails 
        passenger={viewingPassenger} 
        isOpen={!!viewingPassenger} 
        onClose={() => setViewingPassenger(null)} 
      />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    primary: "bg-primary/5 text-primary border-primary/10",
    green: "bg-green-50 text-green-600 border-green-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
  };
  
  return (
    <div className={`p-8 rounded-[2.5rem] border ${colors[color]} flex items-center justify-between group hover:scale-[1.02] transition-all cursor-default`}>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">{label}</p>
        <p className="text-4xl font-black tracking-tight">{value}</p>
      </div>
      <div className={`h-16 w-16 rounded-[1.5rem] flex items-center justify-center border ${colors[color]} bg-white shadow-xl shadow-slate-200/50 group-hover:rotate-12 transition-transform`}>
        <Icon className="h-8 w-8" />
      </div>
    </div>
  );
}
