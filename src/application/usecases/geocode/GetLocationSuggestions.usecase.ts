import { ICache } from "@src/domain/interfaces/ICache";
import { IGeocoder } from "@src/domain/interfaces/IGeocoder";
import { LocationReadModel } from "@src/domain/read-models/shared.read-models";
import {
  GEOCODE_CACHE_TTL_SECONDS,
  geocodeForwardCacheKey,
  normalizeGeocodeQuery,
} from "@src/application/cache/cacheKeys";

export type GetLocationSuggestionsInput = {
  query: string;
};

class GetLocationSuggestionsUseCase {
  constructor(
    private readonly geocoder: IGeocoder,
    private readonly cache: ICache
  ) {}

  async execute(
    input: GetLocationSuggestionsInput
  ): Promise<LocationReadModel[]> {
    const query = normalizeGeocodeQuery(input.query);
    if (!query) {
      return [];
    }

    const cacheKey = geocodeForwardCacheKey(query);
    const cached = await this.cache.get<LocationReadModel[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await this.geocoder.suggest(query);
    await this.cache.set(cacheKey, result, GEOCODE_CACHE_TTL_SECONDS);
    return result;
  }
}

export default GetLocationSuggestionsUseCase;
