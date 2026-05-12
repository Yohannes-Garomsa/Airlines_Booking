import React from 'react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  CreditCard, 
  ShieldCheck, 
  History,
  X,
  Plane
} from "lucide-react";

const statusStyles = {
  Verified: "bg-green-100 text-green-700 border-green-200",
  Pending: "bg-amber-100 text-amber-700 border-amber-200",
  Rejected: "bg-red-100 text-red-700 border-red-200",
};

export function PassengerDetails({ passenger, isOpen, onClose }) {
  if (!passenger) return null;

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-w-4xl mx-auto rounded-t-[3rem] border-0 h-[90vh]">
        <div className="mx-auto w-full max-w-3xl overflow-y-auto scrollbar-hide p-8">
          <DrawerHeader className="relative pb-10">
            <div className="flex items-center gap-8">
              <div className="h-24 w-24 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border-4 border-white shadow-xl">
                <User className="h-10 w-10" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <DrawerTitle className="text-3xl font-black text-slate-800 uppercase tracking-tight">
                    {passenger.firstName} {passenger.lastName}
                  </DrawerTitle>
                  <Badge className={`${statusStyles[passenger.status]} rounded-full px-4 py-1 font-black text-[10px] uppercase tracking-widest border-0`}>
                    {passenger.status}
                  </Badge>
                </div>
                <DrawerDescription className="text-slate-400 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                  <Plane className="h-3 w-3" /> Passenger ID: #{passenger.id}
                </DrawerDescription>
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 hover:bg-slate-100 absolute top-0 right-0">
                  <X className="h-6 w-6 text-slate-400" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 py-10 px-4">
            <section className="space-y-8">
              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">Profile Information</h4>
                <div className="space-y-4">
                  <InfoItem icon={Mail} label="Email Address" value={passenger.email} />
                  <InfoItem icon={Phone} label="Primary Contact" value={passenger.phoneNumber} />
                  <InfoItem icon={Calendar} label="Date of Birth" value={new Date(passenger.dateOfBirth).toLocaleDateString()} />
                  <InfoItem icon={MapPin} label="Nationality" value={passenger.nationality} />
                </div>
              </div>

              <Separator className="bg-slate-100" />

              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">Identification</h4>
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                  <InfoItem icon={CreditCard} label={passenger.documentType || 'Passport'} value={passenger.fanNumber || passenger.passportNumber} />
                  {passenger.finNumber && <InfoItem icon={ShieldCheck} label="FIN Number" value={passenger.finNumber} />}
                </div>
              </div>
            </section>

            <section className="space-y-8">
              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">Emergency Context</h4>
                <div className="space-y-4">
                  <InfoItem icon={User} label="Contact Person" value={passenger.emergencyContactName} />
                  <InfoItem icon={Phone} label="Emergency Phone" value={passenger.emergencyContactPhone} />
                </div>
              </div>

              <Separator className="bg-slate-100" />

              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">System Audit</h4>
                <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full"></div>
                  <div className="relative z-10 space-y-6">
                    <div className="flex items-center gap-4">
                      <History className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Registered on</p>
                        <p className="font-bold">{new Date(passenger.registrationDate).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <ShieldCheck className="h-5 w-5 text-green-400" />
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Verification</p>
                        <p className="font-bold">{passenger.status} Status</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <DrawerFooter className="pt-10 flex flex-row gap-4 justify-end">
            <Button variant="outline" onClick={onClose} className="rounded-2xl h-14 px-8 font-bold border-slate-200">
              Close Preview
            </Button>
            <Button className="rounded-2xl h-14 px-8 font-black uppercase text-[10px] tracking-widest bg-primary hover:bg-blue-800 shadow-xl shadow-primary/20">
              Authorize Action
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-1">
        <Icon className="h-4 w-4 text-slate-400" />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1.5">{label}</p>
        <p className="font-bold text-slate-700">{value || 'Not Provided'}</p>
      </div>
    </div>
  );
}
