// Tipos básicos do sistema
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'professional' | 'receptionist';
  clinicId: string;
}

export interface Clinic {
  id: string;
  name: string;
  logo?: string;
  address?: string;
  themeColor?: string;
  workingHours: WorkingHour[];
}

export interface WorkingHour {
  day: number; // 0 = domingo, 6 = sábado
  start: string; // HH:MM
  end: string; // HH:MM
}

export interface Client {
  id: string;
  name: string;
  cpf?: string;
  phone: string;
  email?: string;
  birthDate?: string;
  address?: string;
  clinicId: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number; // minutos
  price: number;
  clinicId: string;
}

export interface Package {
  id: string;
  name: string;
  services: Service[];
  sessionCount: number;
  totalPrice: number;
  clinicId: string;
}

export interface ClientPackage {
  id: string;
  clientId: string;
  packageId: string;
  remainingSessions: number;
  totalSessions: number;
  purchaseDate: string;
  expirationDate?: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  professionalId?: string;
  services: AppointmentService[];
  start: string; // ISO string
  end: string; // ISO string
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  clinicId: string;
  notes?: string;
}

export interface AppointmentService {
  id: string;
  serviceId: string;
  name: string;
  duration: number;
  price: number;
}

export interface FinancialEntry {
  id: string;
  appointmentId: string;
  clientId: string;
  totalAmount: number;
  paymentMethod: 'cash' | 'card' | 'pix' | 'transfer';
  status: 'paid' | 'pending' | 'installment';
  date: string;
  clinicId: string;
}

export interface Anamnese {
  id: string;
  clientId: string;
  appointmentId?: string;
  questions: AnamneseQuestion[];
  answers: AnamneseAnswer[];
  signature?: string; // base64
  signedAt?: string;
  signedBy?: string;
  ipAddress?: string;
  clinicId: string;
}

export interface AnamneseQuestion {
  id: string;
  text: string;
  type: 'text' | 'checkbox' | 'select';
  options?: string[];
}

export interface AnamneseAnswer {
  questionId: string;
  value: string | string[];
}

export interface BeforeAfterPhoto {
  id: string;
  appointmentId: string;
  type: 'before' | 'after';
  url: string;
  date: string;
  clinicId: string;
}
