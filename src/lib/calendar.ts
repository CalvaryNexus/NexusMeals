import { createEvent, type EventAttributes } from "ics";
import { getChicagoInstant, formatTime12h } from "./schedule";

export interface CalendarEventInput {
  date: string;
  arrivalTime: string;
  endTime: string;
  readyTime: string;
  meal: string;
  address: string;
  entrance: string;
  pleaseBring: string[];
  contactEmail: string;
  contactPhone: string;
}

function toUtcArray(
  date: Date,
): [number, number, number, number, number] {
  return [
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
  ];
}

function buildDescription(params: CalendarEventInput): string {
  const lines = [
    `Meal: ${params.meal}`,
    `Food ready to serve by ${formatTime12h(params.readyTime)}`,
    `Address: ${params.address}`,
    `Entrance: ${params.entrance}`,
  ];
  if (params.pleaseBring.length > 0) {
    lines.push(`Please bring: ${params.pleaseBring.join(", ")}`);
  }
  lines.push(`Team contact: ${params.contactEmail} / ${params.contactPhone}`);
  return lines.join("\n");
}

export function buildIcsEvent(params: CalendarEventInput): string {
  const start = getChicagoInstant(params.date, params.arrivalTime);
  const end = getChicagoInstant(params.date, params.endTime);

  const event: EventAttributes = {
    title: "Nexus Sunday Meal",
    start: toUtcArray(start),
    startInputType: "utc",
    startOutputType: "utc",
    end: toUtcArray(end),
    endInputType: "utc",
    endOutputType: "utc",
    location: `${params.address} (${params.entrance})`,
    description: buildDescription(params),
    alarms: [
      {
        action: "display",
        description: "Nexus meal reminder",
        trigger: { hours: 3, minutes: 0, before: true },
      },
    ],
  };

  const { error, value } = createEvent(event);
  if (error || !value) {
    throw error ?? new Error("Failed to build calendar event");
  }
  return value;
}

export function buildGoogleCalendarUrl(params: CalendarEventInput): string {
  const start = getChicagoInstant(params.date, params.arrivalTime);
  const end = getChicagoInstant(params.date, params.endTime);
  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const url = new URL("https://www.google.com/calendar/render");
  url.searchParams.set("action", "TEMPLATE");
  url.searchParams.set("text", "Nexus Sunday Meal");
  url.searchParams.set("dates", `${fmt(start)}/${fmt(end)}`);
  url.searchParams.set("details", buildDescription(params));
  url.searchParams.set(
    "location",
    `${params.address} (${params.entrance})`,
  );
  return url.toString();
}
