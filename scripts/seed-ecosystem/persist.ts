import User from "../../src/infrastructure/persistence/schemas/User.schema";
import Place from "../../src/infrastructure/persistence/schemas/Place.schema";
import Event from "../../src/infrastructure/persistence/schemas/Event.schema";
import EventInvitation from "../../src/infrastructure/persistence/schemas/EventInvitation.schema";
import EventBooking from "../../src/infrastructure/persistence/schemas/EventBooking.schema";
import Follow from "../../src/infrastructure/persistence/schemas/Follow.schema";
import Favorite from "../../src/infrastructure/persistence/schemas/Favorite.schema";
import Partnership from "../../src/infrastructure/persistence/schemas/Partnership.schema";
import Image from "../../src/infrastructure/persistence/schemas/Image.schema";
import { getRedisClient } from "../../src/infrastructure/persistence/redis";
import { BATCH_SIZE } from "./config";
import type { SeedContext, SeedEventDoc, SeedUserDoc } from "./types";

function omitUserRuntimeFields(user: SeedUserDoc) {
  const { city: _city, archetype: _archetype, ...doc } = user;
  return doc;
}

function omitEventRuntimeFields(event: SeedEventDoc) {
  const { eventCategoryName: _name, ...doc } = event;
  return doc;
}

async function insertInBatches<T>(
  label: string,
  docs: T[],
  insert: (batch: T[]) => Promise<unknown>
): Promise<void> {
  if (docs.length === 0) {
    console.log(`  ${label}: 0`);
    return;
  }
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = docs.slice(i, i + BATCH_SIZE);
    await insert(batch);
  }
  console.log(`  ${label}: ${docs.length}`);
}

export async function persistSeedContext(ctx: SeedContext): Promise<void> {
  await insertInBatches("users", ctx.users.map(omitUserRuntimeFields), (batch) =>
    User.insertMany(batch, { ordered: false })
  );
  await insertInBatches("places", ctx.places, (batch) =>
    Place.insertMany(batch, { ordered: false })
  );
  await insertInBatches("images", ctx.images.map(({ theme: _theme, ...doc }) => doc), (batch) =>
    Image.insertMany(batch, { ordered: false })
  );
  await insertInBatches(
    "events",
    ctx.events.map(omitEventRuntimeFields),
    (batch) => Event.insertMany(batch, { ordered: false })
  );
  await insertInBatches("invitations", ctx.invitations, (batch) =>
    EventInvitation.insertMany(batch, { ordered: false })
  );
  await insertInBatches("bookings", ctx.bookings, (batch) =>
    EventBooking.insertMany(batch, { ordered: false })
  );
  await insertInBatches("follows", ctx.follows, (batch) =>
    Follow.insertMany(batch, { ordered: false })
  );
  await insertInBatches("favorites", ctx.favorites, (batch) =>
    Favorite.insertMany(batch, { ordered: false })
  );
  await insertInBatches("partnerships", ctx.partnerships, (batch) =>
    Partnership.insertMany(batch, { ordered: false })
  );
}

export async function invalidateMapCache(): Promise<void> {
  const client = getRedisClient();
  if (!client) {
    console.log("  Redis cache skipped (not connected)");
    return;
  }

  try {
    const keys: string[] = [];
    for (const pattern of ["places:in-view:*", "events:in-view:*"]) {
      for await (const raw of client.scanIterator({
        MATCH: pattern,
        COUNT: 200,
      })) {
        const key = typeof raw === "string" ? raw : String(raw);
        if (key.length > 0 && key !== "undefined") {
          keys.push(key);
        }
      }
    }
    if (keys.length === 0) {
      console.log("  Redis map keys deleted: 0");
      return;
    }
    await client.del(keys);
    console.log(`  Redis map keys deleted: ${keys.length}`);
  } catch (error) {
    console.warn(
      `Redis invalidation failed: ${(error as Error).message}. Cache TTL will expire shortly.`
    );
  }
}
