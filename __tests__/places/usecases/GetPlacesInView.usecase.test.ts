import GetPlacesInViewUseCase from "@src/application/usecases/places/GetPlacesInView.usecase";
import {
  PLACES_IN_VIEW_CACHE_TTL_SECONDS,
  placesInViewCacheKey,
} from "@src/application/cache/cacheKeys";
import { ICache } from "@src/domain/interfaces/ICache";
import { IPlaceRepository } from "@src/domain/interfaces/IPlaceRepository";
import { PlaceListItemReadModel } from "@src/domain/read-models/place.read-models";

const ne = [2.3525, 48.8566];
const sw = [2.348, 48.852];
const payload: PlaceListItemReadModel[] = [
  { id: "place_1", rating: 4 },
];

const createPlaceRepository = (): jest.Mocked<IPlaceRepository> => ({
  save: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  findDetailsById: jest.fn(),
  findList: jest.fn(),
  findInView: jest.fn(),
  findIdsByUserId: jest.fn(),
  findAdminSummariesByUserId: jest.fn(),
  updateRating: jest.fn(),
  deleteOne: jest.fn(),
  softDelete: jest.fn(),
});

const createCache = (): jest.Mocked<ICache> => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
});

describe("GetPlacesInViewUseCase", () => {
  let placeRepository: jest.Mocked<IPlaceRepository>;
  let cache: jest.Mocked<ICache>;
  let useCase: GetPlacesInViewUseCase;

  beforeEach(() => {
    placeRepository = createPlaceRepository();
    cache = createCache();
    useCase = new GetPlacesInViewUseCase(placeRepository, cache);
  });

  it("returns cached places without hitting the repository", async () => {
    cache.get.mockResolvedValue(payload);

    const result = await useCase.execute({
      ne,
      sw,
      clientFilters: JSON.stringify({ placeTypes: [], placeCategories: [] }),
    });

    expect(result).toEqual(payload);
    expect(placeRepository.findInView).not.toHaveBeenCalled();
    expect(cache.set).not.toHaveBeenCalled();
    expect(cache.get).toHaveBeenCalledWith(
      placesInViewCacheKey({
        ne,
        sw,
        filters: {
          placeTypes: [],
          placeCategories: [],
          userCategoryIds: [],
          productCategoryIds: [],
        },
        limit: 20,
      })
    );
  });

  it("loads from the repository and caches on miss", async () => {
    cache.get.mockResolvedValue(null);
    placeRepository.findInView.mockResolvedValue(payload);

    const result = await useCase.execute({
      ne,
      sw,
      clientFilters: JSON.stringify({
        placeCategories: ["cat1"],
        minRating: 3,
      }),
      limit: 20,
    });

    expect(result).toEqual(payload);
    expect(placeRepository.findInView).toHaveBeenCalledTimes(1);
    expect(cache.set).toHaveBeenCalledWith(
      placesInViewCacheKey({
        ne,
        sw,
        filters: {
          placeTypes: [],
          placeCategories: ["cat1"],
          minRating: 3,
          userCategoryIds: [],
          productCategoryIds: [],
        },
        limit: 20,
      }),
      payload,
      PLACES_IN_VIEW_CACHE_TTL_SECONDS
    );
  });

  it("skips cache for the ids (favorites) branch", async () => {
    placeRepository.findInView.mockResolvedValue(payload);

    const result = await useCase.execute({
      ids: ["place_1", "place_2"],
      ne,
      sw,
    });

    expect(result).toEqual(payload);
    expect(cache.get).not.toHaveBeenCalled();
    expect(cache.set).not.toHaveBeenCalled();
    expect(placeRepository.findInView).toHaveBeenCalledWith(
      expect.objectContaining({
        ids: ["place_1", "place_2"],
      })
    );
  });
});
