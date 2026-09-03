import { fakerFR as faker } from "@faker-js/faker";
import type { CityCluster, GeoBounds } from "./config";

export function isInsideBounds(
  lng: number,
  lat: number,
  bounds: GeoBounds
): boolean {
  return (
    lng >= bounds.minLng &&
    lng <= bounds.maxLng &&
    lat >= bounds.minLat &&
    lat <= bounds.maxLat
  );
}

export function isInWaterExclusion(
  lng: number,
  lat: number,
  city: CityCluster
): boolean {
  return (city.waterExclusions ?? []).some((zone) =>
    isInsideBounds(lng, lat, zone)
  );
}

export function isOnLand(lng: number, lat: number, city: CityCluster): boolean {
  return isInsideBounds(lng, lat, city.landBounds) && !isInWaterExclusion(lng, lat, city);
}

export function sampleLandPoint(city: CityCluster): [number, number] {
  const { landBounds } = city;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const lng = faker.number.float({
      min: landBounds.minLng,
      max: landBounds.maxLng,
    });
    const lat = faker.number.float({
      min: landBounds.minLat,
      max: landBounds.maxLat,
    });
    if (!isInWaterExclusion(lng, lat, city)) {
      return [lng, lat];
    }
  }

  return [
    (landBounds.minLng + landBounds.maxLng) / 2,
    (landBounds.minLat + landBounds.maxLat) / 2,
  ];
}
