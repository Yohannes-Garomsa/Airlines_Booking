const PASSENGERS_KEY = "skybound_passengers_v1";

const initialData = [
  {
    id: "PAX-001",
    firstName: "Abebe",
    lastName: "Bikila",
    gender: "Male",
    dateOfBirth: new Date("1990-01-01"),
    flightType: "Domestic",
    documentType: "Fayda ID",
    fanNumber: "1234567890123456",
    finNumber: "123456789012",
    nationality: "Ethiopian",
    phoneNumber: "+251911223344",
    email: "abebe@example.com",
    status: "Verified",
    registrationDate: new Date("2024-05-01"),
  },
  {
    id: "PAX-002",
    firstName: "Sara",
    lastName: "Connor",
    gender: "Female",
    dateOfBirth: new Date("1985-05-15"),
    flightType: "International",
    passportNumber: "N12345678",
    passportExpiry: new Date("2028-10-20"),
    nationality: "American",
    phoneNumber: "+12025550123",
    email: "sara@skybound.com",
    status: "Pending",
    registrationDate: new Date("2024-05-10"),
  }
];

export const passengerService = {
  getAll: () => {
    const data = localStorage.getItem(PASSENGERS_KEY);
    if (!data) {
      localStorage.setItem(PASSENGERS_KEY, JSON.stringify(initialData));
      return initialData;
    }
    return JSON.parse(data).map(p => ({
      ...p,
      dateOfBirth: new Date(p.dateOfBirth),
      passportExpiry: p.passportExpiry ? new Date(p.passportExpiry) : null,
      registrationDate: new Date(p.registrationDate),
    }));
  },

  create: (passenger) => {
    const passengers = passengerService.getAll();
    const newPassenger = {
      ...passenger,
      id: `PAX-${String(passengers.length + 1).padStart(3, '0')}`,
      registrationDate: new Date(),
    };
    localStorage.setItem(PASSENGERS_KEY, JSON.stringify([...passengers, newPassenger]));
    return newPassenger;
  },

  update: (id, updates) => {
    const passengers = passengerService.getAll();
    const updated = passengers.map(p => p.id === id ? { ...p, ...updates } : p);
    localStorage.setItem(PASSENGERS_KEY, JSON.stringify(updated));
    return updated.find(p => p.id === id);
  },

  delete: (id) => {
    const passengers = passengerService.getAll();
    const filtered = passengers.filter(p => p.id !== id);
    localStorage.setItem(PASSENGERS_KEY, JSON.stringify(filtered));
  }
};
