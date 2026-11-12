import { z } from "zod";
import { isValidUsPhone } from "./phone";

export { isValidUsPhone };

export const usPhoneSchema = z
  .string()
  .trim()
  .min(1, "Phone number is required")
  .max(32, "Enter a valid US phone number")
  .regex(/^[0-9()+.\-\s]+$/, "Enter a valid US phone number")
  .refine(isValidUsPhone, "Enter a valid US phone number");

function isRealCalendarDate(value: string): boolean {
  const [y, m, d] = value.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
}

export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date")
  .refine(isRealCalendarDate, "Invalid date");

export const signupSchema = z.object({
  date: dateSchema,
  name: z.string().trim().min(1, "Full name is required").max(120),
  email: z.string().trim().email("Enter a valid email").max(200),
  phone: usPhoneSchema,
  meal: z
    .string()
    .trim()
    .min(1, "Meal description is required")
    .max(280, "Keep it under 280 characters"),
  turnstileToken: z.string().max(2048).optional(),
  website: z.string().max(200).optional(), // honeypot; must stay empty
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
  email: z.string().trim().email().max(200),
  password: z.string().min(1).max(200),
});
