import { Types } from "mongoose";
import type { ImageTheme } from "../config";
import type { ImagePool, SeedContext, SeedImageDoc } from "../types";
import { EVENT_THEME_BY_CATEGORY } from "./catalog";

function pickUrls(pool: ImagePool, theme: ImageTheme, index: number) {
  const variants = pool[theme];
  if (!variants || variants.length === 0) {
    throw new Error(`Image pool missing theme "${theme}"`);
  }
  return variants[index % variants.length];
}

function userTheme(user: SeedContext["users"][number]): ImageTheme {
  if (user.userType === "guest") {
    return "portrait";
  }
  return user.archetype?.imageTheme ?? "portrait";
}

export function attachImages(ctx: SeedContext, pool: ImagePool): void {
  const images: SeedImageDoc[] = [];
  const usersById = new Map(
    ctx.users.map((user) => [user._id.toString(), user])
  );

  ctx.users.forEach((user, index) => {
    const theme = userTheme(user);
    const urls = pickUrls(pool, theme, index);
    const imageId = new Types.ObjectId();
    user.image = imageId;
    images.push({
      _id: imageId,
      urls,
      user: user._id,
      reference: user._id,
      referenceType: "User",
      type: "profile",
      originalName: `seed-user-${theme}-${index + 1}.jpg`,
      size: 120_000,
      mimetype: "image/jpeg",
      deleted: false,
      theme,
    });
  });

  ctx.events.forEach((event, index) => {
    const theme =
      EVENT_THEME_BY_CATEGORY[event.eventCategoryName] ?? "workshop";
    const owner = usersById.get(event.user.toString());
    const urls = pickUrls(pool, theme, index);
    const imageId = new Types.ObjectId();
    event.image = imageId;
    images.push({
      _id: imageId,
      urls,
      user: owner?._id ?? event.user,
      reference: event._id,
      referenceType: "Event",
      type: "profile",
      originalName: `seed-event-${theme}-${index + 1}.jpg`,
      size: 180_000,
      mimetype: "image/jpeg",
      deleted: false,
      theme,
    });
  });

  ctx.images = images;
}
