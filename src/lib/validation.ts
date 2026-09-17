import { z } from "zod";

function normalizeUsPhoneDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function isValidUsPhone(phone: string): boolean {
  const digits = normalizeUsPhoneDigits(phone);
  if (digits.length === 10) return true;
  if (digits.length === 11 && digits.startsWith("1")) return true;
  return false;
}

export const usPhoneSchema = z
  .string()
  .trim()
  .min(1, "Phone number is required")
  .refine(isValidUsPhone, "Enter a valid US phone number");

export const signupSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  name: z.string().trim().min(1, "Full name is required").max(120),
  email: z.string().trim().email("Enter a valid email").max(200),
  phone: usPhoneSchema,
  meal: z
    .string()
    .trim()
    .min(1, "Meal description is required")
    .max(280, "Keep it under 280 characters"),
  turnstileToken: z.string().optional(),
  website: z.string().optional(), // honeypot; must stay empty
});

export const listItemSchema = z.object({
  label: z.string().trim().min(1).max(200),
  count: z.number().int().min(0).max(9999).optional(),
});

export const overviewSchema = z.object({
  headcount: z.number().int().min(0).max(100000),
  arrivalTime: z.string().regex(/^\d{2}:\d{2}$/),
  readyTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  whatTeensLike: z.string().max(5000),
  spiceGuidance: z.string().max(1000),
  dietaryNeeds: z.array(listItemSchema).max(50),
  mealIdeas: z.array(listItemSchema).max(50),
  providedByNexus: z.array(listItemSchema).max(50),
  pleaseBring: z.array(listItemSchema).max(50),
  currentNeeds: z.array(listItemSchema).max(50),
  teamingUpNote: z.string().max(5000),
});

export const settingsSchema = z.object({
  address: z.string().trim().min(1).max(300),
  entrance: z.string().trim().min(1).max(300),
  contactEmail: z.string().trim().email().max(200),
  contactPhone: usPhoneSchema,
  cutoffDay: z.number().int().min(0).max(6),
  cutoffTime: z.string().regex(/^\d{2}:\d{2}$/),
  scheduleWindowWeeks: z.number().int().min(1).max(52),
  retentionDays: z.number().int().min(1).max(3650),
});

export const manualSignupSchema = signupSchema
  .omit({ turnstileToken: true, website: true })
  .extend({
    name: z.string().trim().min(1).max(120),
    email: z.string().trim().email().max(200),
    phone: usPhoneSchema,
  });

export const createAccountSchema = z.object({
  email: z.string().trim().email().max(200),
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
  role: z.enum(["owner", "viewer"]),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});
