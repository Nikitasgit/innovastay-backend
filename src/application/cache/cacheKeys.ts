import { PlacesInViewClientFilters } from "@src/domain/interfaces/IPlaceRepository";
import {
  quantizeBbox,
  roundCoord,
} from "@src/application/cache/quantizeBbox";

export const CATEGORIES_CACHE_KEY = "categories:all";
export const CATEGORIES_CACHE_TTL_SECONDS = 60 * 60 * 24;

export const PLACES_IN_VIEW_CACHE_TTL_SECONDS = 30;
export const EVENTS_IN_VIEW_CACHE_TTL_SECONDS = 20;

export const GEOCODE_CACHE_TTL_SECONDS = 60 * 60;
export const GEOCODE_REVERSE_DECIMALS = 4;

const sortedIds = (values?: string[]): string[] =>
  [...new Set((values ?? []).filter(Boolean))].sort();

const bboxKey = (ne: number[], sw: number[]): string => {
  const box = quantizeBbox(ne, sw);
  return `${box.ne[0]},${box.ne[1]},${box.sw[0]},${box.sw[1]}`;
};

export const placesInViewCacheKey = (params: {
  ne: number[];
  sw: number[];
  filters: PlacesInViewClientFilters;
  limit: number;
}): string => {
  const filters = {
    types: sortedIds(params.filters.placeTypes),
    cats: sortedIds(params.filters.placeCategories),
    rating: params.filters.minRating ?? null,
    users: sortedIds(params.filters.userCategoryIds),
    products: sortedIds(params.filters.productCategoryIds),
  };

  return `places:in-view:${bboxKey(params.ne, params.sw)}:${JSON.stringify(filters)}:${params.limit}`;
};

export const eventsInViewCacheKey = (params: {
  ne: number[];
  sw: number[];
  eventCategories?: string[];
  startDate?: string | null;
  endDate?: string | null;
  limit: number;
}): string => {
  const categories = sortedIds(params.eventCategories).join(",");
  const start = params.startDate ?? "";
  const end = params.endDate ?? "";

  return `events:in-view:${bboxKey(params.ne, params.sw)}:${categories}:${start}:${end}:${params.limit}`;
};

export const normalizeGeocodeQuery = (query: string): string =>
  query.trim().toLowerCase().replace(/\s+/g, " ");

export const geocodeForwardCacheKey = (query: string): string =>
  `geocode:fwd:fr:${normalizeGeocodeQuery(query)}`;

export const geocodeReverseCacheKey = (lng: number, lat: number): string =>
  `geocode:rev:${roundCoord(lng, GEOCODE_REVERSE_DECIMALS)}:${roundCoord(lat, GEOCODE_REVERSE_DECIMALS)}`;
