import { ICache } from "@src/domain/interfaces/ICache";
import {
  IPlaceRepository,
  PlacesInViewClientFilters,
} from "@src/domain/interfaces/IPlaceRepository";
import { PlaceListItemReadModel } from "@src/domain/read-models/place.read-models";
import {
  GetPlacesInViewInput,
  MAX_PLACE_IDS,
  MAX_PLACES_IN_VIEW_LIMIT,
} from "@src/application/dtos/places/getPlacesInView.dto";
import { parseJson } from "@src/shared/jsonHandlers";
import {
  PLACES_IN_VIEW_CACHE_TTL_SECONDS,
  placesInViewCacheKey,
} from "@src/application/cache/cacheKeys";

const CLIENT_FILTERS_DEFAULTS: PlacesInViewClientFilters = {
  placeTypes: [],
  placeCategories: [],
};

class GetPlacesInViewUseCase {
  constructor(
    private readonly placeRepository: IPlaceRepository,
    private readonly cache: ICache
  ) {}

  async execute(
    params: GetPlacesInViewInput
  ): Promise<PlaceListItemReadModel[]> {
    const clientFilters = parseJson<PlacesInViewClientFilters>(
      params.clientFilters,
      CLIENT_FILTERS_DEFAULTS
    );

    const normalizedFilters: PlacesInViewClientFilters = {
      placeTypes: clientFilters.placeTypes ?? [],
      placeCategories: clientFilters.placeCategories ?? [],
      minRating: clientFilters.minRating,
      userCategoryIds: clientFilters.userCategoryIds ?? [],
      productCategoryIds: clientFilters.productCategoryIds ?? [],
    };

    const limit = params.ids?.length
      ? Math.min(params.limit ?? params.ids.length, MAX_PLACE_IDS)
      : Math.min(params.limit ?? 20, MAX_PLACES_IN_VIEW_LIMIT);

    const query = {
      ne: params.ne,
      sw: params.sw,
      ids: params.ids,
      clientFilters: normalizedFilters,
      limit,
    };

    if (params.ids?.length || !params.ne || !params.sw) {
      return this.placeRepository.findInView(query);
    }

    const cacheKey = placesInViewCacheKey({
      ne: params.ne,
      sw: params.sw,
      filters: normalizedFilters,
      limit,
    });
    const cached = await this.cache.get<PlaceListItemReadModel[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await this.placeRepository.findInView(query);
    await this.cache.set(cacheKey, result, PLACES_IN_VIEW_CACHE_TTL_SECONDS);
    return result;
  }
}

export default GetPlacesInViewUseCase;
