import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { passengerSchema } from "../schemas/passengerSchema";
import { countries } from "../constants/countries";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { 
  User, 
  CreditCard, 
  Phone, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2,
  FileText,
  Globe,
  MapPin,
  Calendar,
  Mail,
  ChevronDown,
  Search
} from "lucide-react";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

const steps = [
  { id: 'personal', title: 'Personal', icon: User },
  { id: 'identity', title: 'Identity', icon: CreditCard },
  { id: 'contact', title: 'Contact', icon: Phone },
  { id: 'review', title: 'Verify', icon: ShieldCheck },
];

function CountrySelector({ value, onChange, placeholder, icon: Icon = Globe }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredCountries = countries.filter(c => 
    c.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-16 w-full rounded-[1.5rem] bg-slate-50 border-0 font-bold px-6 flex justify-between items-center hover:bg-slate-100 transition-all text-slate-700"
        >
          <div className="flex items-center gap-3">
            <Icon className="h-4 w-4 text-slate-400" />
            {value || placeholder}
          </div>
          <ChevronDown className={`h-4 w-4 shrink-0 opacity-50 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[400px] rounded-[2rem] overflow-hidden border-0 shadow-2xl bg-white" align="start" side="bottom" sideOffset={12}>
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search global registry..."
              className="h-12 rounded-xl bg-white border-slate-200 pl-12 font-bold focus:ring-primary"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <ScrollArea className="h-80 p-2">
          <div className="space-y-1">
            {filteredCountries.length === 0 && (
              <div className="p-10 text-center text-slate-400">
                <Globe className="h-10 w-10 mx-auto mb-4 opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-widest">No matching territory</p>
              </div>
            )}
            {filteredCountries.map((country) => (
              <button
                key={country}
                onClick={() => {
                  onChange(country);
                  setOpen(false);
                  setSearch("");
                }}
                className={`w-full text-left p-4 rounded-xl font-bold flex items-center justify-between group hover:bg-primary hover:text-white transition-all ${
                  value === country ? 'bg-primary/5 text-primary' : 'text-slate-600'
                }`}
              >
                {country}
                {value === country && <CheckCircle2 className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

export function PassengerForm({ initialData, onSubmit, onCancel }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [flightType, setFlightType] = useState(initialData?.flightType || "Domestic");

  const form = useForm({
    resolver: zodResolver(passengerSchema),
    defaultValues: {
      firstName: initialData?.firstName || "",
      middleName: initialData?.middleName || "",
      lastName: initialData?.lastName || "",
      gender: initialData?.gender || "Male",
      dateOfBirth: initialData?.dateOfBirth ? new Date(initialData.dateOfBirth) : null,
      flightType: initialData?.flightType || "Domestic",
      documentType: initialData?.documentType || "Fayda ID",
      fanNumber: initialData?.fanNumber || "",
      finNumber: initialData?.finNumber || "",
      passportNumber: initialData?.passportNumber || "",
      passportExpiry: initialData?.passportExpiry ? new Date(initialData.passportExpiry) : null,
      passportCountry: initialData?.passportCountry || "",
      passportIssueDate: initialData?.passportIssueDate ? new Date(initialData.passportIssueDate) : null,
      passportType: initialData?.passportType || "Regular",
      residenceCountry: initialData?.residenceCountry || "",
      nationality: initialData?.nationality || "Ethiopia",
      phoneNumber: initialData?.phoneNumber || "",
      email: initialData?.email || "",
      emergencyContactName: initialData?.emergencyContactName || "",
      emergencyContactPhone: initialData?.emergencyContactPhone || "",
      emergencyRelationship: initialData?.emergencyRelationship || "",
      dualCitizenship: initialData?.dualCitizenship || false,
      status: initialData?.status || "Pending",
      adminNotes: initialData?.adminNotes || "",
    }
  });

  const { watch, setValue, trigger } = form;
  const watchedFlightType = watch("flightType");
  const watchedDob = watch("dateOfBirth");

  // Sync state with form watch
  useEffect(() => {
    setFlightType(watchedFlightType);
  }, [watchedFlightType]);

  const passengerType = React.useMemo(() => {
    if (!watchedDob) return "Adult";
    const age = new Date().getFullYear() - new Date(watchedDob).getFullYear();
    if (age <= 1) return "Infant";
    if (age <= 11) return "Child";
    return "Adult";
  }, [watchedDob]);

  const nextStep = async () => {
    const fields = getStepFields(currentStep);
    const isValid = await trigger(fields);
    if (isValid) setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const getStepFields = (step) => {
    switch(step) {
      case 0: return ["firstName", "lastName", "gender", "dateOfBirth"];
      case 1: 
        return flightType === "Domestic" 
          ? ["documentType", "fanNumber", "finNumber", "passportNumber", "passportExpiry"]
          : ["passportNumber", "passportExpiry", "passportCountry", "nationality"];
      case 2: return ["phoneNumber", "email", "emergencyContactName", "emergencyContactPhone"];
      default: return [];
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Flight Type Selector */}
      <div className="flex justify-center mb-12">
        <Tabs value={flightType} onValueChange={(v) => setValue("flightType", v)} className="w-full max-w-2xl">
          <TabsList className="grid grid-cols-2 p-2 bg-slate-900 rounded-[2.5rem] h-20 shadow-2xl">
            <TabsTrigger 
              value="Domestic" 
              className="rounded-[2rem] font-black uppercase text-[11px] tracking-widest text-slate-400 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl transition-all"
            >
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${flightType === 'Domestic' ? 'bg-white/20' : 'bg-slate-800'}`}>
                  <MapPin className="h-4 w-4" />
                </div>
                Domestic Ops
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="International" 
              className="rounded-[2rem] font-black uppercase text-[11px] tracking-widest text-slate-400 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl transition-all"
            >
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${flightType === 'International' ? 'bg-white/20' : 'bg-slate-800'}`}>
                  <Globe className="h-4 w-4" />
                </div>
                International
              </div>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Stepper */}
      <div className="flex justify-between items-center mb-16 px-8 py-10 bg-white/40 backdrop-blur-md rounded-[3rem] border border-white/50 shadow-sm">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = currentStep > index;
          const isActive = currentStep === index;
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center gap-4 relative z-10">
                <div className={`h-16 w-16 rounded-3xl flex items-center justify-center transition-all duration-700 border-2 ${
                  isCompleted ? 'bg-green-500 border-green-500 shadow-2xl shadow-green-200 rotate-[360deg]' : 
                  isActive ? 'bg-slate-900 border-slate-900 shadow-2xl shadow-slate-900/40 scale-110 -rotate-3' : 
                  'bg-white border-slate-200'
                }`}>
                  {isCompleted ? <CheckCircle2 className="text-white h-7 w-7" /> : <Icon className={`h-7 w-7 ${isActive ? 'text-white' : 'text-slate-400'}`} />}
                </div>
                <div className="text-center">
                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] block ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>{step.title}</span>
                  <span className={`text-[8px] font-bold uppercase tracking-widest block mt-1 ${isActive ? 'text-primary' : 'text-slate-300'}`}>Phase 0{index + 1}</span>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-[3px] bg-slate-100 mx-4 -mt-14 relative overflow-hidden rounded-full">
                  <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: isCompleted ? "100%" : "0%" }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="h-full bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]"
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-0 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.1)] rounded-[3rem] overflow-hidden bg-white/80 backdrop-blur-xl border border-white/20">
                <CardContent className="p-12">
                  <div className="mb-10 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      {React.createElement(steps[currentStep].icon, { className: "h-6 w-6" })}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black uppercase tracking-tight text-slate-800">{steps[currentStep].title} Information</h3>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mt-1">Registry Protocol Phase 0{currentStep + 1}</p>
                    </div>
                  </div>

                  {currentStep === 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2">
                              <User className="h-3 w-3" /> First Name
                            </FormLabel>
                            <FormControl>
                              <div className="relative group">
                                <Input placeholder="Abebe" className="h-16 rounded-[1.5rem] bg-slate-50 border-0 focus:ring-2 focus:ring-primary font-bold pl-6 transition-all group-focus-within:bg-white group-focus-within:shadow-xl" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2">
                              <User className="h-3 w-3" /> Last Name
                            </FormLabel>
                            <FormControl>
                              <div className="relative group">
                                <Input placeholder="Bikila" className="h-16 rounded-[1.5rem] bg-slate-50 border-0 focus:ring-2 focus:ring-primary font-bold pl-6 transition-all group-focus-within:bg-white group-focus-within:shadow-xl" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2">
                              <User className="h-3 w-3" /> Gender Identity
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-16 rounded-[1.5rem] bg-slate-50 border-0 focus:ring-2 focus:ring-primary font-bold px-6 transition-all">
                                  <SelectValue placeholder="Select Gender" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="rounded-2xl border-slate-100 p-2 shadow-2xl">
                                <SelectItem value="Male" className="rounded-xl font-bold p-3">Male</SelectItem>
                                <SelectItem value="Female" className="rounded-xl font-bold p-3">Female</SelectItem>
                                <SelectItem value="Other" className="rounded-xl font-bold p-3">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2">
                              <Calendar className="h-3 w-3" /> Date of Birth
                            </FormLabel>
                            <FormControl>
                              <Input type="date" className="h-16 rounded-[1.5rem] bg-slate-50 border-0 focus:ring-2 focus:ring-primary font-bold px-6 transition-all" {...field} value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''} onChange={e => field.onChange(new Date(e.target.value))} />
                            </FormControl>
                            <div className="mt-3 flex items-center gap-2 px-1">
                              <Badge className="bg-primary text-white border-0 font-black text-[9px] uppercase px-3 py-1 rounded-full shadow-lg shadow-primary/20">Detected Type: {passengerType}</Badge>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {currentStep === 1 && (
                    <div className="space-y-10">
                      {flightType === "Domestic" && (
                        <FormField
                          control={form.control}
                          name="documentType"
                          render={({ field }) => (
                            <FormItem className="space-y-6">
                              <FormLabel className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-center block">Identity Document Type</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                >
                                  <FormItem>
                                    <FormLabel className="flex items-center justify-between p-8 rounded-[2rem] border-2 border-slate-100 cursor-pointer transition-all hover:bg-slate-50 data-[state=checked]:border-primary data-[state=checked]:bg-primary/[0.03] data-[state=checked]:shadow-2xl data-[state=checked]:shadow-primary/10">
                                      <div className="flex items-center gap-6">
                                        <div className="h-14 w-14 rounded-2xl bg-white shadow-lg flex items-center justify-center text-primary group-data-[state=checked]:bg-primary group-data-[state=checked]:text-white transition-colors">
                                          <FileText className="h-6 w-6" />
                                        </div>
                                        <div>
                                          <p className="font-black text-slate-800 uppercase tracking-tight text-lg">Fayda ID</p>
                                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">National Registry System</p>
                                        </div>
                                      </div>
                                      <RadioGroupItem value="Fayda ID" className="h-6 w-6 border-slate-300 text-primary" />
                                    </FormLabel>
                                  </FormItem>
                                  <FormItem>
                                    <FormLabel className="flex items-center justify-between p-8 rounded-[2rem] border-2 border-slate-100 cursor-pointer transition-all hover:bg-slate-50 data-[state=checked]:border-accent data-[state=checked]:bg-accent/[0.03] data-[state=checked]:shadow-2xl data-[state=checked]:shadow-accent/10">
                                      <div className="flex items-center gap-6">
                                        <div className="h-14 w-14 rounded-2xl bg-white shadow-lg flex items-center justify-center text-accent transition-colors">
                                          <Globe className="h-6 w-6" />
                                        </div>
                                        <div>
                                          <p className="font-black text-slate-800 uppercase tracking-tight text-lg">Passport</p>
                                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">International Standard</p>
                                        </div>
                                      </div>
                                      <RadioGroupItem value="Passport" className="h-6 w-6 border-slate-300 text-accent" />
                                    </FormLabel>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {/* Dynamic Identity Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {watch("documentType") === "Fayda ID" && flightType === "Domestic" ? (
                          <>
                            <FormField
                              control={form.control}
                              name="fanNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">FAN Number (16 Digits)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="0000 0000 0000 0000" className="h-14 rounded-2xl bg-slate-50 border-0 font-bold" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="finNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">FIN Number (12 Digits)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="0000 0000 0000" className="h-14 rounded-2xl bg-slate-50 border-0 font-bold" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </>
                        ) : (
                          <>
                            <FormField
                              control={form.control}
                              name="passportNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Passport Number</FormLabel>
                                  <FormControl>
                                    <Input placeholder="A00000000" className="h-14 rounded-2xl bg-slate-50 border-0 font-bold" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="passportExpiry"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Expiry Date</FormLabel>
                                  <FormControl>
                                    <Input type="date" className="h-14 rounded-2xl bg-slate-50 border-0 font-bold" {...field} value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''} onChange={e => field.onChange(new Date(e.target.value))} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </>
                        )}
                        {flightType === "International" && (
                          <FormField
                            control={form.control}
                            name="nationality"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2">
                                  <Globe className="h-3 w-3" /> Nationality / Citizenship
                                </FormLabel>
                                <FormControl>
                                  <CountrySelector 
                                    value={field.value} 
                                    onChange={field.onChange} 
                                    placeholder="Select Nationality"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                        {flightType === "International" && (
                          <FormField
                            control={form.control}
                            name="passportCountry"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2">
                                  <Globe className="h-3 w-3" /> Passport Issuing Country
                                </FormLabel>
                                <FormControl>
                                  <CountrySelector 
                                    value={field.value} 
                                    onChange={field.onChange} 
                                    placeholder="Select Issuing Country"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2">
                              <Phone className="h-3 w-3" /> Primary Phone
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="+251 ..." className="h-16 rounded-[1.5rem] bg-slate-50 border-0 font-bold px-6 transition-all" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2">
                              <Mail className="h-3 w-3" /> Electronic Mail
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="pax@example.com" className="h-16 rounded-[1.5rem] bg-slate-50 border-0 font-bold px-6 transition-all" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="emergencyContactName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2">
                              <User className="h-3 w-3" /> Emergency Contact
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="Full Name" className="h-16 rounded-[1.5rem] bg-slate-50 border-0 font-bold px-6 transition-all" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="emergencyContactPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2">
                              <Phone className="h-3 w-3" /> Emergency Line
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="+251 ..." className="h-16 rounded-[1.5rem] bg-slate-50 border-0 font-bold px-6 transition-all" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="flex flex-col items-center text-center py-10 space-y-8">
                      <div className="h-24 w-24 rounded-full bg-green-50 flex items-center justify-center text-green-500 mb-4 animate-bounce">
                        <ShieldCheck className="h-12 w-12" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black uppercase tracking-tight text-slate-800">Ready for Verification</h3>
                        <p className="text-slate-400 font-medium mt-2 max-w-md mx-auto">Please review the passenger details. Once submitted, the record will enter the verification pipeline.</p>
                      </div>
                      
                      <div className="w-full max-w-lg bg-slate-50 rounded-[2.5rem] p-8 text-left space-y-4 border border-slate-100">
                        <div className="flex justify-between border-b border-slate-200 pb-4">
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Full Name</span>
                          <span className="font-bold text-slate-800">{watch("firstName")} {watch("lastName")}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200 pb-4">
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Flight Type</span>
                          <span className="font-bold text-primary uppercase text-[10px] tracking-widest">{watch("flightType")}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200 pb-4">
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Identity</span>
                          <span className="font-bold text-slate-800">{watch("documentType") || "Passport"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Type</span>
                          <span className="font-bold text-slate-800">{passengerType}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>

                <div className="bg-slate-50 p-8 flex justify-between items-center px-12 border-t border-slate-100">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={currentStep === 0 ? onCancel : () => setCurrentStep(p => p - 1)}
                    className="rounded-2xl h-14 px-8 font-bold text-slate-500 hover:bg-white"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" /> {currentStep === 0 ? "Cancel" : "Back"}
                  </Button>
                  
                  {currentStep < steps.length - 1 ? (
                    <Button 
                      type="button" 
                      onClick={nextStep}
                      className="bg-primary hover:bg-blue-800 text-white rounded-2xl h-14 px-10 font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-primary/20 transition-all hover:scale-105"
                    >
                      Continue <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button 
                      type="submit"
                      disabled={form.formState.isSubmitting}
                      className="bg-green-600 hover:bg-green-700 text-white rounded-2xl h-14 px-10 font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-green-200 transition-all hover:scale-105 disabled:opacity-50"
                    >
                      {form.formState.isSubmitting ? "Processing..." : "Complete Registration"} <CheckCircle2 className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>
        </form>
      </Form>
    </div>
  );
}
