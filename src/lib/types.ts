export type AdminRole = "owner" | "viewer";

export interface ListItem {
  label: string;
  count?: number;
}

export interface Settings {
  address: string;
  entrance: string;
  contactEmail: string;
  contactPhone: string;
  cutoffDay: number; // 0=Sun .. 6=Sat, day before which signups close
  cutoffTime: string; // "HH:mm" 24h, America/Chicago
  scheduleWindowWeeks: number;
  retentionDays: number;
}

export interface Overview {
  headcount: number;
  arrivalTime: string; // "HH:mm"
  readyTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  whatTeensLike: string; // rich text (sanitized HTML)
  spiceGuidance: string;
  dietaryNeeds: ListItem[];
  mealIdeas: ListItem[];
  providedByNexus: ListItem[];
  pleaseBring: ListItem[];
  currentNeeds: ListItem[];
  teamingUpNote: string; // rich text (sanitized HTML)
}

export type WeekStatus = "no_nexus";

export interface WeekOverride {
  status?: WeekStatus;
  label?: string;
  arrivalOverride?: string; // "HH:mm"
}

export interface Signup {
  id: string;
  date: string; // YYYY-MM-DD (the Sunday)
  name: string | null;
  email: string | null;
  phone: string | null;
  meal: string;
  createdAt: string;
  createdBy: string; // "public" or admin id
  updatedBy?: string;
  updatedAt?: string;
  reminderSent: boolean;
  purged: boolean;
}

export interface Admin {
  id: string;
  email: string;
  passwordHash: string;
  role: AdminRole;
  disabled: boolean;
  createdAt: string;
}

export type WeekComputedState =
  | "open"
  | "urgent"
  | "covered"
  | "no_nexus"
  | "closed";

export type WeekColor = "default" | "need" | "warn" | "ok" | "ink-soft";

export interface WeekView {
  date: string;
  state: WeekComputedState;
  color: WeekColor;
  label?: string;
  meal?: string;
  arrivalTime: string;
  signupId?: string;
}
