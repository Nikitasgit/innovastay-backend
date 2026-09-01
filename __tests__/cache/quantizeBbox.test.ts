import {
  bboxDecimalPrecision,
  quantizeBbox,
  roundCoord,
} from "@src/application/cache/quantizeBbox";
import {
  eventsInViewCacheKey,
  placesInViewCacheKey,
} from "@src/application/cache/cacheKeys";

describe("quantizeBbox", () => {
  it("uses 2 decimals for spans larger than 1 degree", () => {
    expect(bboxDecimalPrecision(1.5)).toBe(2);

    const box = quantizeBbox([2.456, 49.123], [1.111, 48.001]);
    expect(box.ne).toEqual([2.46, 49.12]);
    expect(box.sw).toEqual([1.11, 48]);
  });

  it("uses 3 decimals for spans between 0.1 and 1 degree", () => {
    expect(bboxDecimalPrecision(0.25)).toBe(3);

    const box = quantizeBbox([2.3525, 48.8567], [2.2501, 48.8012]);
    expect(box.ne).toEqual([2.353, 48.857]);
    expect(box.sw).toEqual([2.25, 48.801]);
  });

  it("uses 4 decimals for tight viewports", () => {
    expect(bboxDecimalPrecision(0.05)).toBe(4);

    const box = quantizeBbox([2.35255, 48.85661], [2.35211, 48.8562]);
    expect(box.ne).toEqual([2.3525, 48.8566]);
    expect(box.sw).toEqual([2.3521, 48.8562]);
  });

  it("produces a stable key for nearby pans at the same precision", () => {
    const filters = { placeTypes: [], placeCategories: [] };
    const keyA = placesInViewCacheKey({
      ne: [2.35251, 48.85661],
      sw: [2.34801, 48.85211],
      filters,
      limit: 20,
    });
    const keyB = placesInViewCacheKey({
      ne: [2.35255, 48.85664],
      sw: [2.34804, 48.85214],
      filters,
      limit: 20,
    });

    expect(keyA).toBe(keyB);
  });

  it("canonicalizes filter array order in cache keys", () => {
    const ne = [2.4, 48.9];
    const sw = [2.3, 48.8];
    const keyA = placesInViewCacheKey({
      ne,
      sw,
      filters: {
        placeTypes: ["b", "a"],
        placeCategories: ["y", "x"],
        userCategoryIds: ["2", "1"],
        productCategoryIds: [],
      },
      limit: 20,
    });
    const keyB = placesInViewCacheKey({
      ne,
      sw,
      filters: {
        placeTypes: ["a", "b"],
        placeCategories: ["x", "y"],
        userCategoryIds: ["1", "2"],
        productCategoryIds: [],
      },
      limit: 20,
    });

    expect(keyA).toBe(keyB);
  });

  it("includes event date window and categories in the events key", () => {
    const keyA = eventsInViewCacheKey({
      ne: [2.4, 48.9],
      sw: [2.3, 48.8],
      eventCategories: ["b", "a"],
      startDate: "2026-08-01",
      endDate: "2026-08-31",
      limit: 100,
    });
    const keyB = eventsInViewCacheKey({
      ne: [2.4, 48.9],
      sw: [2.3, 48.8],
      eventCategories: ["a", "b"],
      startDate: "2026-08-01",
      endDate: "2026-08-31",
      limit: 100,
    });

    expect(keyA).toBe(keyB);
    expect(keyA).toContain("2026-08-01");
    expect(roundCoord(2.35255, 4)).toBe(2.3525);
  });
});
