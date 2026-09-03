import { Types } from "mongoose";
import type { SeedLocation } from "../types";

export const EVENT_NAME_MIN = 4;
export const EVENT_NAME_MAX = 40;

export function clampEventName(name: string): string {
  const collapsed = name.replace(/\s+/g, " ").trim();
  if (collapsed.length >= EVENT_NAME_MIN && collapsed.length <= EVENT_NAME_MAX) {
    return collapsed;
  }
  if (collapsed.length > EVENT_NAME_MAX) {
    return collapsed.slice(0, EVENT_NAME_MAX).trim();
  }
  return `${collapsed} live`.slice(0, EVENT_NAME_MAX);
}

export function assertEventInvariants(event: {
  name: string;
  online: boolean;
  place?: Types.ObjectId | null;
  location?: SeedLocation | null;
}): void {
  const name = event.name.trim();
  if (name.length < EVENT_NAME_MIN || name.length > EVENT_NAME_MAX) {
    throw new Error(
      `Event name must be ${EVENT_NAME_MIN}-${EVENT_NAME_MAX} chars: "${event.name}"`
    );
  }
  if (event.online) {
    if (event.place || event.location) {
      throw new Error("Online events must not have a place or location");
    }
    return;
  }
  if (!event.place && !event.location) {
    throw new Error("Offline events require a place and/or a location");
  }
}
