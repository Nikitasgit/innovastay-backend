import { fakerFR as faker } from "@faker-js/faker";
import { Types } from "mongoose";
import type {
  SeedBookingDoc,
  SeedEventDoc,
  SeedFavoriteDoc,
  SeedFollowDoc,
  SeedInvitationDoc,
  SeedPartnershipDoc,
  SeedPlaceDoc,
  SeedUserDoc,
} from "../types";
import { creatorUsers, guestUsers } from "./users";

function pairKey(a: Types.ObjectId, b: Types.ObjectId): string {
  return `${a.toString()}::${b.toString()}`;
}

export function generateInvitations(
  events: SeedEventDoc[],
  users: SeedUserDoc[]
): SeedInvitationDoc[] {
  const creators = creatorUsers(users);
  if (creators.length < 2) {
    return [];
  }

  const invitations: SeedInvitationDoc[] = [];
  const seen = new Set<string>();
  const target = Math.round(events.length * 0.15);

  for (let i = 0; i < target; i += 1) {
    const event = events[i % events.length];
    const ownerId = event.user.toString();
    const collaborator = faker.helpers.arrayElement(
      creators.filter((creator) => creator._id.toString() !== ownerId)
    );
    const key = `${event._id.toString()}::${collaborator._id.toString()}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);

    const status = faker.helpers.weightedArrayElement([
      { value: "accepted" as const, weight: 45 },
      { value: "pending" as const, weight: 30 },
      { value: "refused" as const, weight: 15 },
      { value: "cancelled" as const, weight: 10 },
    ]);

    invitations.push({
      event: event._id,
      initiator: event.user,
      collaborator: collaborator._id,
      status,
      deleted: status === "cancelled",
    });

    if (status === "accepted") {
      const slot = event.schedule[0]?.timeSlots?.[0];
      if (slot && !slot.collaborators.some((id) => id.equals(collaborator._id))) {
        slot.collaborators.push(collaborator._id);
      }
    }
  }

  return invitations;
}

export function generateBookings(
  events: SeedEventDoc[],
  users: SeedUserDoc[]
): SeedBookingDoc[] {
  const guests = guestUsers(users);
  if (guests.length === 0) {
    return [];
  }

  const bookings: SeedBookingDoc[] = [];
  const seen = new Set<string>();

  for (const event of events) {
    if (!event.isBookable || !event.capacity || event.status === "cancelled") {
      continue;
    }

    let confirmedSeats = 0;
    const attendeeCount = faker.number.int({
      min: 2,
      max: Math.min(18, guests.length),
    });

    for (let i = 0; i < attendeeCount; i += 1) {
      const guest = guests[(event._id.toString().charCodeAt(i % 8) + i) % guests.length];
      const key = pairKey(event._id, guest._id);
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);

      const remaining = event.capacity - confirmedSeats;
      const cancelled =
        remaining <= 0 || faker.datatype.boolean({ probability: 0.12 });
      const seats = Math.min(
        event.maxSeatsPerBooking,
        cancelled ? faker.number.int({ min: 1, max: event.maxSeatsPerBooking }) : Math.max(1, remaining)
      );

      if (!cancelled) {
        confirmedSeats += seats;
      }

      bookings.push({
        event: event._id,
        user: guest._id,
        seats,
        status: cancelled ? "cancelled" : "confirmed",
        cancelledAt: cancelled ? faker.date.recent({ days: 20 }) : null,
      });

      if (confirmedSeats >= event.capacity) {
        break;
      }
    }

    if (confirmedSeats >= event.capacity) {
      event.status = "full";
    }
  }

  return bookings;
}

export function generateFollows(users: SeedUserDoc[]): SeedFollowDoc[] {
  const creators = creatorUsers(users);
  const guests = guestUsers(users);
  const follows: SeedFollowDoc[] = [];
  const seen = new Set<string>();

  const addFollow = (follower: Types.ObjectId, following: Types.ObjectId) => {
    if (follower.equals(following)) {
      return;
    }
    const key = pairKey(follower, following);
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    follows.push({ follower, following });
  };

  for (const guest of guests) {
    const count = faker.number.int({
      min: 4,
      max: Math.min(15, creators.length),
    });
    const targets = faker.helpers.arrayElements(creators, count);
    for (const creator of targets) {
      addFollow(guest._id, creator._id);
    }
  }

  for (const creator of creators) {
    const count = faker.number.int({
      min: 1,
      max: Math.min(5, Math.max(1, creators.length - 1)),
    });
    const targets = faker.helpers.arrayElements(
      creators.filter((other) => !other._id.equals(creator._id)),
      count
    );
    for (const other of targets) {
      addFollow(creator._id, other._id);
    }
  }

  const followerCounts = new Map<string, number>();
  for (const follow of follows) {
    const key = follow.following.toString();
    followerCounts.set(key, (followerCounts.get(key) ?? 0) + 1);
  }
  for (const user of users) {
    user.followers = followerCounts.get(user._id.toString()) ?? 0;
  }

  return follows;
}

export function generateFavorites(
  users: SeedUserDoc[],
  places: SeedPlaceDoc[]
): SeedFavoriteDoc[] {
  const guests = guestUsers(users);
  if (places.length === 0 || guests.length === 0) {
    return [];
  }

  const favorites: SeedFavoriteDoc[] = [];
  const seen = new Set<string>();

  for (const guest of guests) {
    const count = faker.number.int({
      min: 2,
      max: Math.min(8, places.length),
    });
    const picks = faker.helpers.arrayElements(places, count);
    for (const place of picks) {
      const key = pairKey(guest._id, place._id);
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      favorites.push({
        user: guest._id,
        reference: place._id,
        referenceType: "Place",
      });
    }
  }

  return favorites;
}

export function generatePartnerships(users: SeedUserDoc[]): SeedPartnershipDoc[] {
  const owners = users.filter((user) => user.place);
  if (owners.length < 2) {
    return [];
  }

  const partnerships: SeedPartnershipDoc[] = [];
  const seen = new Set<string>();
  const target = Math.round(owners.length * 0.4);

  for (let i = 0; i < target; i += 1) {
    const initiator = owners[i % owners.length];
    const collaborator = faker.helpers.arrayElement(
      owners.filter((owner) => !owner._id.equals(initiator._id))
    );
    const unordered = [initiator._id.toString(), collaborator._id.toString()].sort().join("::");
    if (seen.has(unordered)) {
      continue;
    }
    seen.add(unordered);
    partnerships.push({
      initiator: initiator._id,
      collaborator: collaborator._id,
      status: faker.helpers.weightedArrayElement([
        { value: "accepted" as const, weight: 55 },
        { value: "pending" as const, weight: 30 },
        { value: "refused" as const, weight: 15 },
      ]),
      deleted: false,
    });
  }

  return partnerships;
}
