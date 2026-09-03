import { ICache } from "@src/domain/interfaces/ICache";
import { IGeocoder } from "@src/domain/interfaces/IGeocoder";
import { LocationReadModel } from "@src/domain/read-models/shared.read-models";
import {
  GEOCODE_CACHE_TTL_SECONDS,
  geocodeReverseCacheKey,
} from "@src/application/cache/cacheKeys";

export type ReverseGeocodeInput = {
  lng: number;
  lat: number;
};

class ReverseGeocodeUseCase {
  constructor(
    private readonly geocoder: IGeocoder,
    private readonly cache: ICache
  ) {}

  async execute(input: ReverseGeocodeInput): Promise<LocationReadModel | null> {
    const cacheKey = geocodeReverseCacheKey(input.lng, input.lat);
    const cached = await this.cache.get<{ location: LocationReadModel | null }>(
      cacheKey
    );
    if (cached) {
      return cached.location;
    }

    const result = await this.geocoder.reverse(input.lng, input.lat);
    await this.cache.set(
      cacheKey,
      { location: result },
      GEOCODE_CACHE_TTL_SECONDS
    );
    return result;
  }
}

export default ReverseGeocodeUseCase;
