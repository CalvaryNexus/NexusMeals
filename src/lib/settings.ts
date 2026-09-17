import { redis } from "./redis";
import type { Overview, Settings } from "./types";

export const DEFAULT_SETTINGS: Settings = {
  address: "499 West US 61 Bypass, Muscatine, IA 52761",
  entrance: 'FLC doors by the "Coffee Belt"',
  contactEmail: "tanner@calvaryonline.org",
  contactPhone: "(509) 998-6487",
  cutoffDay: 5, // Friday
  cutoffTime: "12:00",
  scheduleWindowWeeks: 16,
  retentionDays: 30,
};

export const DEFAULT_OVERVIEW: Overview = {
  headcount: 100,
  arrivalTime: "17:30",
  readyTime: "18:00",
  endTime: "18:30",
  whatTeensLike:
    "High schoolers love food that's filling and easy to grab. Think tacos, pasta, sandwiches, pizza, or anything they can load up a plate with. Simple usually wins.",
  spiceGuidance:
    "Please avoid overly spicy food, or bring a milder option alongside it for students who can't handle the heat.",
  dietaryNeeds: [],
  mealIdeas: [],
  providedByNexus: [
    { label: "Cups" },
    { label: "Plates" },
    { label: "Silverware" },
    { label: "Water" },
    { label: "Warmers" },
    { label: "Serving spoons" },
    { label: "Cutting knives" },
  ],
  pleaseBring: [
    { label: "The food and containers to store and carry it" },
    { label: "Other drinks (soda etc.) welcome but optional" },
    { label: "Label dishes containing common allergens" },
  ],
  currentNeeds: [],
  teamingUpNote:
    "Feeding 100+ students is a lot for one family. Feel free to team up with friends, family, or your small group. Whoever signs up is our point person for that week.",
};

export async function getSettings(): Promise<Settings> {
  const stored = await redis.get<Settings>("settings");
  return { ...DEFAULT_SETTINGS, ...stored };
}

export async function setSettings(settings: Settings): Promise<void> {
  await redis.set("settings", settings);
}

export async function getOverview(): Promise<Overview> {
  const stored = await redis.get<Overview>("overview");
  return { ...DEFAULT_OVERVIEW, ...stored };
}

export async function setOverview(overview: Overview): Promise<void> {
  await redis.set("overview", overview);
}
