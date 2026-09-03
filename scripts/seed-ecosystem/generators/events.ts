import { fakerFR as faker } from "@faker-js/faker";
import { Types } from "mongoose";
import {
  BOOKABLE_RATIO,
  CANCELLED_EVENT_RATIO,
  COMPLETED_EVENT_RATIO,
  CUSTOM_LOCATION_LABELS,
  CUSTOM_LOCATION_RATIO,
  EVENT_NAME_TEMPLATES,
  ONGOING_EVENT_RATIO,
  ONLINE_EVENT_RATIO,
} from "../config";
import { requireCategoryId } from "../categories";
import {
  getEventDateRange,
  getLifecycleStatus,
} from "../../../src/domain/value-objects/EventSchedule.vo";
import type {
  CategoryMaps,
  SeedEventDoc,
  SeedLocation,
  SeedPlaceDoc,
  SeedUserDoc,
} from "../types";
import { creatorUsers } from "./users";
import { locationForUser } from "./places";
import { sampleLandPoint } from "../geo";
import { assertEventInvariants, clampEventName } from "./eventInvariants";

type LifecycleKind = "upcoming" | "ongoing" | "completed";

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function scheduleForLifecycle(kind: LifecycleKind): {
  startDate: Date;
  endDate: Date;
} {
  const today = startOfDay(new Date());
  if (kind === "ongoing") {
    return {
      startDate: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
      endDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
    };
  }
  if (kind === "completed") {
    const end = new Date(
      today.getTime() - faker.number.int({ min: 5, max: 80 }) * 24 * 60 * 60 * 1000
    );
    return {
      startDate: new Date(end.getTime() - faker.number.int({ min: 0, max: 2 }) * 24 * 60 * 60 * 1000),
      endDate: end,
    };
  }
  const start = new Date(
    today.getTime() + faker.number.int({ min: 3, max: 90 }) * 24 * 60 * 60 * 1000
  );
  return {
    startDate: start,
    endDate: new Date(
      start.getTime() + faker.number.int({ min: 0, max: 2 }) * 24 * 60 * 60 * 1000
    ),
  };
}

function pickLifecycle(index: number, total: number): LifecycleKind {
  const ratio = index / Math.max(total, 1);
  if (ratio < COMPLETED_EVENT_RATIO) {
    return "completed";
  }
  if (ratio < COMPLETED_EVENT_RATIO + ONGOING_EVENT_RATIO) {
    return "ongoing";
  }
  return "upcoming";
}

function eventDescription(name: string, owner: SeedUserDoc, online: boolean): string {
  const where = online
    ? "en visio"
    : `à ${owner.city.label}`;
  return `${name} organisé par ${owner.username} ${where}. Accueil, échanges et découverte du travail de saison.`;
}

function customLocation(owner: SeedUserDoc, index: number): SeedLocation {
  const labels = CUSTOM_LOCATION_LABELS[owner.city.slug] ?? [
    `Centre-ville, ${owner.city.label}`,
  ];
  const [lng, lat] = sampleLandPoint(owner.city);
  return {
    type: "Point",
    coordinates: [lng, lat],
    label: faker.helpers.arrayElement(labels),
    id: `seed.${owner.city.slug}.custom.${index}`,
  };
}

export function generateEvents(
  eventCount: number,
  users: SeedUserDoc[],
  places: SeedPlaceDoc[],
  categories: CategoryMaps
): SeedEventDoc[] {
  const creators = creatorUsers(users);
  if (creators.length === 0) {
    throw new Error("Cannot generate events without creators");
  }
  const placesByUserId = new Map(
    places.map((place) => [place.user.toString(), place])
  );
  const venuePlaces = places.length > 0 ? places : [];

  const events: SeedEventDoc[] = [];
  for (let i = 0; i < eventCount; i += 1) {
    const owner = creators[i % creators.length];
    const ownerPlace = placesByUserId.get(owner._id.toString());
    const roll = i / eventCount;
    const online = roll < ONLINE_EVENT_RATIO;
    const customLocationEvent =
      !online && roll < ONLINE_EVENT_RATIO + CUSTOM_LOCATION_RATIO;
    const atPlace = !online && !customLocationEvent;

    let place: Types.ObjectId | null = null;
    let location: SeedLocation | null = null;
    let categoryName: string;

    if (online) {
      categoryName = "online_event";
    } else {
      const fromArchetype = owner.archetype?.eventCategories ?? ["meetup"];
      categoryName = faker.helpers.arrayElement(fromArchetype);
      if (atPlace) {
        const venue =
          ownerPlace ??
          (venuePlaces.length > 0
            ? venuePlaces[i % venuePlaces.length]
            : undefined);
        if (venue) {
          place = venue._id;
          location = venue.location;
        } else {
          location = locationForUser(owner, "event", i + 1);
        }
      } else {
        location = customLocation(owner, i + 1);
      }
    }

    const lifecycle = pickLifecycle(i, eventCount);
    const period = scheduleForLifecycle(lifecycle);
    const isBookable = !online && faker.datatype.boolean({ probability: BOOKABLE_RATIO });
    const capacity = isBookable
      ? faker.number.int({ min: 8, max: 80 })
      : null;
    const cancelled = faker.datatype.boolean({
      probability: CANCELLED_EVENT_RATIO,
    });
    const templates =
      EVENT_NAME_TEMPLATES[categoryName] ?? EVENT_NAME_TEMPLATES.meetup;
    const name = clampEventName(faker.helpers.arrayElement(templates));
    const schedule = [
      {
        startDate: period.startDate,
        endDate: period.endDate,
        timeSlots: [
          {
            title: online ? "Session en ligne" : "Accueil",
            startTime: "10:00",
            endTime: "12:00",
            collaborators: [] as Types.ObjectId[],
          },
        ],
      },
    ];
    const dateRange = getEventDateRange([
      { startDate: period.startDate, endDate: period.endDate },
    ]);
    const lifecycleStatus = getLifecycleStatus(dateRange);

    const event: SeedEventDoc = {
      _id: new Types.ObjectId(),
      name,
      description: eventDescription(name, owner, online),
      schedule,
      eventCategory: requireCategoryId(
        categories.event,
        categoryName,
        "EventCategory"
      ),
      eventCategoryName: categoryName,
      user: owner._id,
      place,
      location,
      online,
      status: cancelled ? "cancelled" : "available",
      lifecycleStatus:
        lifecycleStatus === "unvalid" ? "upcoming" : lifecycleStatus,
      dateRange,
      rating: faker.number.float({ min: 0, max: 4.8, fractionDigits: 1 }),
      isBookable,
      capacity,
      maxSeatsPerBooking: isBookable
        ? faker.number.int({ min: 1, max: 4 })
        : 1,
      deleted: false,
    };

    assertEventInvariants(event);
    events.push(event);
  }

  return events;
}
