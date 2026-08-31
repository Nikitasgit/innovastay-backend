import GetCategoriesUseCase from "@src/application/usecases/categories/GetCategories.usecase";
import {
  CATEGORIES_CACHE_KEY,
  CATEGORIES_CACHE_TTL_SECONDS,
} from "@src/application/cache/cacheKeys";
import { ICache } from "@src/domain/interfaces/ICache";
import { ICategoryRepository } from "@src/domain/interfaces/ICategoryRepository";
import { CategoriesResultReadModel } from "@src/domain/read-models/category.read-models";

const payload: CategoriesResultReadModel = {
  categoryTypes: [{ id: "ct1", name: "craft" }],
  userCategories: [{ id: "uc1", name: "weaver" }],
  placeCategories: [{ id: "pc1", name: "atelier" }],
  productCategories: [{ id: "prc1", name: "textile" }],
  eventCategories: [{ id: "ec1", name: "workshop" }],
};

const emptyPayload: CategoriesResultReadModel = {
  categoryTypes: [],
  userCategories: [],
  placeCategories: [],
  productCategories: [],
  eventCategories: [],
};

describe("GetCategoriesUseCase", () => {
  let categoryRepository: jest.Mocked<ICategoryRepository>;
  let cache: jest.Mocked<ICache>;
  let useCase: GetCategoriesUseCase;

  beforeEach(() => {
    categoryRepository = {
      findAll: jest.fn(),
    };
    cache = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };
    useCase = new GetCategoriesUseCase(categoryRepository, cache);
  });

  it("returns cached categories without hitting the repository", async () => {
    cache.get.mockResolvedValue(payload);

    const result = await useCase.execute();

    expect(result).toEqual(payload);
    expect(cache.get).toHaveBeenCalledWith(CATEGORIES_CACHE_KEY);
    expect(categoryRepository.findAll).not.toHaveBeenCalled();
    expect(cache.set).not.toHaveBeenCalled();
  });

  it("loads from the repository and caches on miss", async () => {
    cache.get.mockResolvedValue(null);
    categoryRepository.findAll.mockResolvedValue(payload);

    const result = await useCase.execute();

    expect(result).toEqual(payload);
    expect(categoryRepository.findAll).toHaveBeenCalledTimes(1);
    expect(cache.set).toHaveBeenCalledWith(
      CATEGORIES_CACHE_KEY,
      payload,
      CATEGORIES_CACHE_TTL_SECONDS
    );
  });

  it("returns empty arrays when no categories exist", async () => {
    cache.get.mockResolvedValue(null);
    categoryRepository.findAll.mockResolvedValue(emptyPayload);

    await expect(useCase.execute()).resolves.toEqual(emptyPayload);
    expect(cache.set).toHaveBeenCalledWith(
      CATEGORIES_CACHE_KEY,
      emptyPayload,
      CATEGORIES_CACHE_TTL_SECONDS
    );
  });
});
