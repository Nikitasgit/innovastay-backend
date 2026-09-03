import type { S3Client } from "@aws-sdk/client-s3";
import User from "../../src/infrastructure/persistence/schemas/User.schema";
import Place from "../../src/infrastructure/persistence/schemas/Place.schema";
import Event from "../../src/infrastructure/persistence/schemas/Event.schema";
import EventInvitation from "../../src/infrastructure/persistence/schemas/EventInvitation.schema";
import EventBooking from "../../src/infrastructure/persistence/schemas/EventBooking.schema";
import Follow from "../../src/infrastructure/persistence/schemas/Follow.schema";
import Favorite from "../../src/infrastructure/persistence/schemas/Favorite.schema";
import Partnership from "../../src/infrastructure/persistence/schemas/Partnership.schema";
import Image from "../../src/infrastructure/persistence/schemas/Image.schema";
import { SEED_EMAIL_DOMAIN } from "./config";
import { deleteSeedImagesFromS3 } from "./images/uploadPool";

const seedEmailFilter = { email: { $regex: `@${SEED_EMAIL_DOMAIN}$` } };

export async function purgeSeedMongo(): Promise<{ users: number }> {
  const users = await User.find(seedEmailFilter).select("_id").lean();
  const userIds = users.map((user) => user._id);

  if (userIds.length === 0) {
    await Image.deleteMany({
      $or: [
        { originalName: { $regex: /^seed-/ } },
        { "urls.original": { $regex: /images\/seed\// } },
      ],
    });
    return { users: 0 };
  }

  const events = await Event.find({ user: { $in: userIds } }).select("_id").lean();
  const eventIds = events.map((event) => event._id);
  const places = await Place.find({ user: { $in: userIds } }).select("_id").lean();
  const placeIds = places.map((place) => place._id);

  await EventInvitation.deleteMany({
    $or: [
      { initiator: { $in: userIds } },
      { collaborator: { $in: userIds } },
      { event: { $in: eventIds } },
    ],
  });
  await EventBooking.deleteMany({
    $or: [{ user: { $in: userIds } }, { event: { $in: eventIds } }],
  });
  await Follow.deleteMany({
    $or: [{ follower: { $in: userIds } }, { following: { $in: userIds } }],
  });
  await Favorite.deleteMany({
    $or: [{ user: { $in: userIds } }, { reference: { $in: placeIds } }],
  });
  await Partnership.deleteMany({
    $or: [{ initiator: { $in: userIds } }, { collaborator: { $in: userIds } }],
  });
  await Event.deleteMany({ _id: { $in: eventIds } });
  await Place.deleteMany({ _id: { $in: placeIds } });
  await Image.deleteMany({
    $or: [
      { user: { $in: userIds } },
      { reference: { $in: [...userIds, ...eventIds] } },
      { originalName: { $regex: /^seed-/ } },
      { "urls.original": { $regex: /images\/seed\// } },
    ],
  });
  await User.deleteMany({ _id: { $in: userIds } });

  return { users: userIds.length };
}

export async function countExistingSeedUsers(): Promise<number> {
  return User.countDocuments(seedEmailFilter);
}

export async function purgeSeedS3(s3: S3Client): Promise<number> {
  return deleteSeedImagesFromS3(s3);
}
