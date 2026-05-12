import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  MoreVertical, 
  Eye, 
  Edit2, 
  Trash2, 
  ShieldCheck, 
  Filter,
  ArrowUpDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const statusStyles = {
  Verified: "bg-green-100 text-green-700 border-green-200",
  Pending: "bg-amber-100 text-amber-700 border-amber-200",
  Rejected: "bg-red-100 text-red-700 border-red-200",
};

export function PassengerTable({ passengers, onView, onEdit, onDelete, onVerify }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All");

  const filtered = passengers.filter(p => {
    const matchesSearch = `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "All" || p.flightType === filter || p.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search by name or PAX ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 rounded-2xl border-slate-200 focus:ring-primary shadow-sm"
          />
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-12 rounded-2xl gap-2 border-slate-200 text-slate-600">
                <Filter className="h-4 w-4" />
                Filter: {filter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl p-2 w-48">
              {["All", "Domestic", "International", "Verified", "Pending", "Rejected"].map(f => (
                <DropdownMenuItem 
                  key={f} 
                  onClick={() => setFilter(f)}
                  className="rounded-xl px-4 py-3 font-medium cursor-pointer"
                >
                  {f}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
              <TableHead className="font-bold py-6 px-8 text-slate-500 uppercase tracking-widest text-[10px]">PAX ID</TableHead>
              <TableHead className="font-bold py-6 px-8 text-slate-500 uppercase tracking-widest text-[10px]">Passenger Name</TableHead>
              <TableHead className="font-bold py-6 px-8 text-slate-500 uppercase tracking-widest text-[10px]">Type / Nat.</TableHead>
              <TableHead className="font-bold py-6 px-8 text-slate-500 uppercase tracking-widest text-[10px]">Identification</TableHead>
              <TableHead className="font-bold py-6 px-8 text-slate-500 uppercase tracking-widest text-[10px]">Status</TableHead>
              <TableHead className="font-bold py-6 px-8 text-slate-500 uppercase tracking-widest text-[10px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {filtered.map((p) => (
                <motion.tr 
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  key={p.id}
                  className="group hover:bg-slate-50/80 transition-colors cursor-pointer border-b border-slate-100 last:border-0"
                  onClick={() => onView(p)}
                >
                  <TableCell className="py-6 px-8 font-black text-slate-400 text-xs">#{p.id}</TableCell>
                  <TableCell className="py-6 px-8">
                    <div className="font-bold text-slate-800">{p.firstName} {p.lastName}</div>
                    <div className="text-xs text-slate-400 font-medium">{p.email}</div>
                  </TableCell>
                  <TableCell className="py-6 px-8">
                    <div className="flex flex-col gap-1">
                      <span className={`text-[10px] font-black uppercase tracking-tighter ${p.flightType === 'International' ? 'text-primary' : 'text-slate-500'}`}>
                        {p.flightType}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">{p.nationality}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-6 px-8">
                    <div className="font-bold text-slate-700 text-xs">{p.documentType || 'Passport'}</div>
                    <div className="text-[10px] text-slate-400 font-bold tracking-widest">{p.fanNumber || p.passportNumber}</div>
                  </TableCell>
                  <TableCell className="py-6 px-8">
                    <Badge variant="outline" className={`${statusStyles[p.status]} rounded-full px-4 py-1 border-0 font-black text-[10px] uppercase tracking-widest`}>
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-6 px-8 text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-2xl p-2 w-48 shadow-2xl border-slate-200">
                        <DropdownMenuItem onClick={() => onView(p)} className="rounded-xl px-4 py-3 font-medium gap-3 cursor-pointer">
                          <Eye className="h-4 w-4 text-slate-400" /> View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(p)} className="rounded-xl px-4 py-3 font-medium gap-3 cursor-pointer">
                          <Edit2 className="h-4 w-4 text-blue-400" /> Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onVerify(p)} className="rounded-xl px-4 py-3 font-medium gap-3 cursor-pointer">
                          <ShieldCheck className="h-4 w-4 text-green-400" /> Verify Status
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(p.id)} className="rounded-xl px-4 py-3 font-medium gap-3 cursor-pointer text-red-500 focus:text-red-500">
                          <Trash2 className="h-4 w-4" /> Delete Record
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
        
        {filtered.length === 0 && (
          <div className="py-32 flex flex-col items-center justify-center text-slate-400">
            <div className="bg-slate-50 p-6 rounded-full mb-6">
              <Search className="h-10 w-10 text-slate-200" />
            </div>
            <p className="font-black uppercase tracking-widest text-[10px]">No Passengers found</p>
            <p className="text-sm mt-2 font-medium">Try adjusting your filters or search term</p>
          </div>
        )}
      </div>
    </div>
  );
}
