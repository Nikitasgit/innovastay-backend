import GetLocationSuggestionsUseCase from "@src/application/usecases/geocode/GetLocationSuggestions.usecase";
import ReverseGeocodeUseCase from "@src/application/usecases/geocode/ReverseGeocode.usecase";
import {
  GEOCODE_CACHE_TTL_SECONDS,
  geocodeForwardCacheKey,
  geocodeReverseCacheKey,
} from "@src/application/cache/cacheKeys";
import { ICache } from "@src/domain/interfaces/ICache";
import { IGeocoder } from "@src/domain/interfaces/IGeocoder";
import { LocationReadModel } from "@src/domain/read-models/shared.read-models";

const paris: LocationReadModel = {
  type: "Point",
  id: "place.paris",
  label: "Paris, France",
  coordinates: [2.3522, 48.8566],
};

const createCache = (): jest.Mocked<ICache> => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
});

const createGeocoder = (): jest.Mocked<IGeocoder> => ({
  suggest: jest.fn(),
  reverse: jest.fn(),
});

describe("GetLocationSuggestionsUseCase", () => {
  let geocoder: jest.Mocked<IGeocoder>;
  let cache: jest.Mocked<ICache>;
  let useCase: GetLocationSuggestionsUseCase;

  beforeEach(() => {
    geocoder = createGeocoder();
    cache = createCache();
    useCase = new GetLocationSuggestionsUseCase(geocoder, cache);
  });

  it("returns empty without calling Mapbox for a blank query", async () => {
    await expect(useCase.execute({ query: "   " })).resolves.toEqual([]);
    expect(geocoder.suggest).not.toHaveBeenCalled();
    expect(cache.get).not.toHaveBeenCalled();
  });

  it("returns cached suggestions without hitting Mapbox", async () => {
    cache.get.mockResolvedValue([paris]);

    const result = await useCase.execute({ query: "  Paris  " });

    expect(result).toEqual([paris]);
    expect(geocoder.suggest).not.toHaveBeenCalled();
    expect(cache.get).toHaveBeenCalledWith(geocodeForwardCacheKey("paris"));
  });

  it("loads from Mapbox and caches on miss", async () => {
    cache.get.mockResolvedValue(null);
    geocoder.suggest.mockResolvedValue([paris]);

    const result = await useCase.execute({ query: "Paris" });

    expect(result).toEqual([paris]);
    expect(geocoder.suggest).toHaveBeenCalledWith("paris");
    expect(cache.set).toHaveBeenCalledWith(
      geocodeForwardCacheKey("paris"),
      [paris],
      GEOCODE_CACHE_TTL_SECONDS
    );
  });
});

describe("ReverseGeocodeUseCase", () => {
  let geocoder: jest.Mocked<IGeocoder>;
  let cache: jest.Mocked<ICache>;
  let useCase: ReverseGeocodeUseCase;

  beforeEach(() => {
    geocoder = createGeocoder();
    cache = createCache();
    useCase = new ReverseGeocodeUseCase(geocoder, cache);
  });

  it("returns a cached location without hitting Mapbox", async () => {
    cache.get.mockResolvedValue({ location: paris });

    const result = await useCase.execute({ lng: 2.35222, lat: 48.85661 });

    expect(result).toEqual(paris);
    expect(geocoder.reverse).not.toHaveBeenCalled();
    expect(cache.get).toHaveBeenCalledWith(
      geocodeReverseCacheKey(2.35222, 48.85661)
    );
  });

  it("returns a cached null result without hitting Mapbox", async () => {
    cache.get.mockResolvedValue({ location: null });

    await expect(
      useCase.execute({ lng: 0, lat: 0 })
    ).resolves.toBeNull();
    expect(geocoder.reverse).not.toHaveBeenCalled();
  });

  it("loads from Mapbox and caches on miss", async () => {
    cache.get.mockResolvedValue(null);
    geocoder.reverse.mockResolvedValue(paris);

    const result = await useCase.execute({ lng: 2.3522, lat: 48.8566 });

    expect(result).toEqual(paris);
    expect(cache.set).toHaveBeenCalledWith(
      geocodeReverseCacheKey(2.3522, 48.8566),
      { location: paris },
      GEOCODE_CACHE_TTL_SECONDS
    );
  });
});
