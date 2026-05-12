import { z } from "zod";

export const passengerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  middleName: z.string().optional(),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  gender: z.enum(["Male", "Female", "Other"]),
  dateOfBirth: z.date({
    required_error: "Date of birth is required",
  }),
  flightType: z.enum(["Domestic", "International"]),
  
  // Domestic Fields
  documentType: z.enum(["Fayda ID", "Passport"]).optional(),
  fanNumber: z.string().optional().refine(val => !val || /^\d{16}$/.test(val), "FAN must be exactly 16 digits"),
  finNumber: z.string().optional().refine(val => !val || /^\d{12}$/.test(val), "FIN must be exactly 12 digits"),
  
  // International/Shared Passport Fields
  passportNumber: z.string().min(5, "Passport number is required").optional(),
  passportExpiry: z.date().optional(),
  nationality: z.string().min(2, "Nationality is required").optional(),
  
  // International Specific
  passportCountry: z.string().optional(),
  passportIssueDate: z.date().optional(),
  passportType: z.enum(["Regular", "Diplomatic", "Service"]).optional(),
  residenceCountry: z.string().optional(),
  dualCitizenship: z.boolean().default(false),

  // Contact
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  email: z.string().email("Invalid email address"),
  emergencyContactName: z.string().min(2, "Emergency contact name is required"),
  emergencyContactPhone: z.string().min(10, "Emergency contact phone is required"),
  emergencyRelationship: z.string().optional(),

  // Internal
  status: z.enum(["Pending", "Verified", "Rejected"]).default("Pending"),
  adminNotes: z.string().optional(),
}).refine((data) => {
  if (data.flightType === "Domestic") {
    if (data.documentType === "Fayda ID") {
      return !!data.fanNumber || !!data.finNumber;
    }
    if (data.documentType === "Passport") {
      return !!data.passportNumber && !!data.passportExpiry;
    }
  } else {
    // International requires passport
    return !!data.passportNumber && !!data.passportExpiry && !!data.passportCountry;
  }
  return true;
}, {
  message: "Required identification fields are missing",
  path: ["documentType"],
});
