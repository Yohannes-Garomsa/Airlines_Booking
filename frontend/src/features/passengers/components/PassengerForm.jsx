import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { passengerSchema } from "../schemas/passengerSchema";
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
  Globe
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const steps = [
  { id: 'personal', title: 'Personal', icon: User },
  { id: 'identity', title: 'Identity', icon: CreditCard },
  { id: 'contact', title: 'Contact', icon: Phone },
  { id: 'review', title: 'Verify', icon: ShieldCheck },
];

export function PassengerForm({ initialData, onSubmit, onCancel }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [flightType, setFlightType] = useState(initialData?.flightType || "Domestic");

  const form = useForm({
    resolver: zodResolver(passengerSchema),
    defaultValues: initialData || {
      firstName: "",
      lastName: "",
      gender: "Male",
      flightType: "Domestic",
      documentType: "Fayda ID",
      dualCitizenship: false,
      status: "Pending",
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
        <Tabs value={flightType} onValueChange={(v) => setValue("flightType", v)} className="w-full max-w-md">
          <TabsList className="grid grid-cols-2 p-1 bg-slate-100 rounded-[2rem] h-16">
            <TabsTrigger value="Domestic" className="rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg">
              Domestic Ops
            </TabsTrigger>
            <TabsTrigger value="International" className="rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg">
              International
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Stepper */}
      <div className="flex justify-between items-center mb-16 px-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = currentStep > index;
          const isActive = currentStep === index;
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center gap-3 relative">
                <div className={`h-14 w-14 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${
                  isCompleted ? 'bg-green-500 border-green-500 shadow-xl shadow-green-200' : 
                  isActive ? 'bg-primary border-primary shadow-xl shadow-primary/20 scale-110' : 
                  'bg-white border-slate-200'
                }`}>
                  {isCompleted ? <CheckCircle2 className="text-white h-6 w-6" /> : <Icon className={`h-6 w-6 ${isActive ? 'text-white' : 'text-slate-400'}`} />}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-primary' : 'text-slate-400'}`}>{step.title}</span>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-[2px] bg-slate-100 mx-4 -mt-8">
                  <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: isCompleted ? "100%" : "0%" }}
                    className="h-full bg-green-500"
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
              <Card className="border-0 shadow-2xl shadow-slate-200/50 rounded-[3rem] overflow-hidden">
                <CardContent className="p-12">
                  {currentStep === 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Abebe" className="h-14 rounded-2xl bg-slate-50 border-0 focus:ring-2 focus:ring-primary font-bold" {...field} />
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
                            <FormLabel className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Bikila" className="h-14 rounded-2xl bg-slate-50 border-0 focus:ring-2 focus:ring-primary font-bold" {...field} />
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
                            <FormLabel className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Gender</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-0 focus:ring-2 focus:ring-primary font-bold">
                                  <SelectValue placeholder="Select Gender" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="rounded-2xl border-slate-100 p-2">
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
                            <FormLabel className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Date of Birth</FormLabel>
                            <FormControl>
                              <Input type="date" className="h-14 rounded-2xl bg-slate-50 border-0 focus:ring-2 focus:ring-primary font-bold" {...field} value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''} onChange={e => field.onChange(new Date(e.target.value))} />
                            </FormControl>
                            <div className="mt-2 flex items-center gap-2">
                              <Badge className="bg-primary/5 text-primary border-0 font-black text-[10px] uppercase">Detected: {passengerType}</Badge>
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
                                    <FormLabel className="flex items-center justify-between p-8 rounded-3xl border-2 cursor-pointer transition-all hover:bg-slate-50 data-[state=checked]:border-primary data-[state=checked]:bg-primary/5">
                                      <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                          <FileText className="h-5 w-5" />
                                        </div>
                                        <div>
                                          <p className="font-black text-slate-800 uppercase tracking-tight">Fayda ID</p>
                                          <p className="text-[10px] font-bold text-slate-400">National ID System</p>
                                        </div>
                                      </div>
                                      <RadioGroupItem value="Fayda ID" className="h-6 w-6 border-slate-300 text-primary" />
                                    </FormLabel>
                                  </FormItem>
                                  <FormItem>
                                    <FormLabel className="flex items-center justify-between p-8 rounded-3xl border-2 cursor-pointer transition-all hover:bg-slate-50 data-[state=checked]:border-primary data-[state=checked]:bg-primary/5">
                                      <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                                          <Globe className="h-5 w-5" />
                                        </div>
                                        <div>
                                          <p className="font-black text-slate-800 uppercase tracking-tight">Passport</p>
                                          <p className="text-[10px] font-bold text-slate-400">Standard Travel Doc</p>
                                        </div>
                                      </div>
                                      <RadioGroupItem value="Passport" className="h-6 w-6 border-slate-300 text-primary" />
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
                                <FormLabel className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Nationality</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g. Ethiopian" className="h-14 rounded-2xl bg-slate-50 border-0 font-bold" {...field} />
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
                            <FormLabel className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="+251 ..." className="h-14 rounded-2xl bg-slate-50 border-0 font-bold" {...field} />
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
                            <FormLabel className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Email Address</FormLabel>
                            <FormControl>
                              <Input placeholder="pax@example.com" className="h-14 rounded-2xl bg-slate-50 border-0 font-bold" {...field} />
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
                            <FormLabel className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Emergency Contact</FormLabel>
                            <FormControl>
                              <Input placeholder="Full Name" className="h-14 rounded-2xl bg-slate-50 border-0 font-bold" {...field} />
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
                            <FormLabel className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Emergency Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="+251 ..." className="h-14 rounded-2xl bg-slate-50 border-0 font-bold" {...field} />
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
