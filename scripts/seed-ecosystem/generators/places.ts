import { fakerFR as faker } from "@faker-js/faker";
import type { ScheduleKind } from "../config";
import { requireCategoryId } from "../categories";
import { sampleLandPoint } from "../geo";
import type { CategoryMaps, SeedLocation, SeedPlaceDoc, SeedUserDoc } from "../types";
import { creatorsWithPlace } from "./users";

function day(
  open: boolean,
  startTime = "09:00",
  endTime = "18:00"
): { open: boolean; timeSlots: Array<{ startTime: string; endTime: string }> } {
  return {
    open,
    timeSlots: open ? [{ startTime, endTime }] : [],
  };
}

export function scheduleForKind(kind: ScheduleKind): SeedPlaceDoc["defaultSchedule"] {
  switch (kind) {
    case "bar":
      return {
        monday: day(false),
        tuesday: day(true, "17:00", "23:30"),
        wednesday: day(true, "17:00", "23:30"),
        thursday: day(true, "17:00", "23:30"),
        friday: day(true, "17:00", "23:30"),
        saturday: day(true, "16:00", "23:30"),
        sunday: day(true, "16:00", "22:00"),
      };
    case "market":
      return {
        monday: day(false),
        tuesday: day(false),
        wednesday: day(true, "07:00", "13:30"),
        thursday: day(false),
        friday: day(false),
        saturday: day(true, "07:00", "14:00"),
        sunday: day(true, "08:00", "13:00"),
      };
    case "gallery":
      return {
        monday: day(false),
        tuesday: day(true, "11:00", "19:00"),
        wednesday: day(true, "11:00", "19:00"),
        thursday: day(true, "11:00", "19:00"),
        friday: day(true, "11:00", "19:00"),
        saturday: day(true, "11:00", "19:00"),
        sunday: day(true, "14:00", "18:00"),
      };
    case "workshop":
      return {
        monday: day(false),
        tuesday: day(true, "10:00", "18:00"),
        wednesday: day(true, "10:00", "18:00"),
        thursday: day(true, "10:00", "18:00"),
        friday: day(true, "10:00", "18:00"),
        saturday: day(true, "10:00", "16:00"),
        sunday: day(false),
      };
    case "farm":
      return {
        monday: day(true, "09:00", "17:00"),
        tuesday: day(true, "09:00", "17:00"),
        wednesday: day(true, "09:00", "17:00"),
        thursday: day(true, "09:00", "17:00"),
        friday: day(true, "09:00", "17:00"),
        saturday: day(true, "09:00", "16:00"),
        sunday: day(false),
      };
    case "venue":
      return {
        monday: day(false),
        tuesday: day(true, "14:00", "22:00"),
        wednesday: day(true, "14:00", "22:00"),
        thursday: day(true, "14:00", "23:00"),
        friday: day(true, "14:00", "23:30"),
        saturday: day(true, "14:00", "23:30"),
        sunday: day(true, "14:00", "20:00"),
      };
    case "restaurant":
    default:
      return {
        monday: day(false),
        tuesday: day(true, "08:00", "18:00"),
        wednesday: day(true, "08:00", "18:00"),
        thursday: day(true, "08:00", "18:00"),
        friday: day(true, "08:00", "19:00"),
        saturday: day(true, "08:00", "19:00"),
        sunday: day(true, "08:00", "13:00"),
      };
  }
}

export function locationForUser(
  user: SeedUserDoc,
  kind: "place" | "event",
  index: number
): SeedLocation {
  const [lng, lat] = sampleLandPoint(user.city);
  const number = user.address.number;
  const street = user.address.street;
  return {
    type: "Point",
    coordinates: [lng, lat],
    label: `${number} ${street}, ${user.address.code} ${user.city.label}, France`,
    id: `seed.${user.city.slug}.${kind}.${index}`,
  };
}

export function generatePlaces(
  users: SeedUserDoc[],
  categories: CategoryMaps
): SeedPlaceDoc[] {
  const owners = creatorsWithPlace(users);
  return owners.map((owner, index) => {
    const placeCategoryName = owner.archetype?.placeCategory;
    if (!placeCategoryName || !owner.place) {
      throw new Error(`Creator ${owner.email} marked with a place but missing category`);
    }
    const kind = owner.archetype?.scheduleKind ?? "restaurant";
    return {
      _id: owner.place,
      user: owner._id,
      location: locationForUser(owner, "place", index + 1),
      placeCategory: requireCategoryId(
        categories.place,
        placeCategoryName,
        "PlaceCategory"
      ),
      defaultSchedule: scheduleForKind(kind),
      customDates: [],
      rating: faker.number.float({ min: 3.2, max: 4.9, fractionDigits: 1 }),
      deleted: false,
    };
  });
}

