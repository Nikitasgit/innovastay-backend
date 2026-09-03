import UserCategory from "../../src/infrastructure/persistence/schemas/UserCategory.schema";
import PlaceCategory from "../../src/infrastructure/persistence/schemas/PlaceCategory.schema";
import EventCategory from "../../src/infrastructure/persistence/schemas/EventCategory.schema";
import type { CategoryMaps } from "./types";
import { Types } from "mongoose";

export async function loadCategoryMaps(): Promise<CategoryMaps> {
  const [userDocs, placeDocs, eventDocs] = await Promise.all([
    UserCategory.find().lean(),
    PlaceCategory.find().lean(),
    EventCategory.find().lean(),
  ]);

  if (userDocs.length === 0 || placeDocs.length === 0 || eventDocs.length === 0) {
    throw new Error(
      "Categories missing. Run `npm run seed:categories` before seeding the ecosystem."
    );
  }

  return {
    user: new Map(userDocs.map((doc) => [doc.name, doc._id])),
    place: new Map(placeDocs.map((doc) => [doc.name, doc._id])),
    event: new Map(eventDocs.map((doc) => [doc.name, doc._id])),
  };
}

export function requireCategoryId(
  map: Map<string, Types.ObjectId>,
  name: string,
  kind: string
): Types.ObjectId {
  const id = map.get(name);
  if (!id) {
    throw new Error(
      `${kind} "${name}" introuvable. Lancez \`npm run seed:categories\`.`
    );
  }
  return id;
}
