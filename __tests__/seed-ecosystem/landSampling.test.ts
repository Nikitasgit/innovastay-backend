import { fakerFR as faker } from "@faker-js/faker";
import { CITIES } from "../../scripts/seed-ecosystem/config";
import {
  isInWaterExclusion,
  isOnLand,
  sampleLandPoint,
} from "../../scripts/seed-ecosystem/geo";

describe("seed-ecosystem land sampling", () => {
  const marseille = CITIES.find((city) => city.slug === "marseille");

  it("defines land bounds for every city", () => {
    for (const city of CITIES) {
      expect(city.landBounds.maxLng).toBeGreaterThan(city.landBounds.minLng);
      expect(city.landBounds.maxLat).toBeGreaterThan(city.landBounds.minLat);
    }
  });

  it("keeps sampled points inside each city's land box", () => {
    faker.seed(42);
    for (const city of CITIES) {
      for (let i = 0; i < 80; i += 1) {
        const [lng, lat] = sampleLandPoint(city);
        expect(isOnLand(lng, lat, city)).toBe(true);
      }
    }
  });

  it("never places Marseille samples in the Mediterranean", () => {
    expect(marseille).toBeDefined();
    faker.seed(99);
    for (let i = 0; i < 200; i += 1) {
      const [, lat] = sampleLandPoint(marseille!);
      expect(lat).toBeGreaterThanOrEqual(43.3);
    }
  });

  it("rejects known sea coordinates off Marseille", () => {
    expect(marseille).toBeDefined();
    expect(isInWaterExclusion(5.37, 43.23, marseille!)).toBe(true);
    expect(isOnLand(5.37, 43.23, marseille!)).toBe(false);
    expect(isOnLand(5.41, 43.33, marseille!)).toBe(true);
  });

  it("includes smaller agglomerations beyond the six metro cities", () => {
    const slugs = CITIES.map((city) => city.slug);
    expect(slugs).toEqual(
      expect.arrayContaining([
        "beaune",
        "uzes",
        "arles",
        "colmar",
        "annecy",
        "aix-en-provence",
        "rodez",
        "dijon",
      ])
    );
    expect(CITIES.length).toBeGreaterThan(20);
  });

  it("keeps Annecy samples off the lake", () => {
    const annecy = CITIES.find((city) => city.slug === "annecy");
    expect(annecy).toBeDefined();
    faker.seed(7);
    for (let i = 0; i < 80; i += 1) {
      const [lng] = sampleLandPoint(annecy!);
      expect(lng).toBeLessThanOrEqual(6.128);
    }
    expect(isInWaterExclusion(6.15, 45.88, annecy!)).toBe(true);
  });
});
