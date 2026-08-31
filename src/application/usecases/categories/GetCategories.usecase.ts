import { ICache } from "@src/domain/interfaces/ICache";
import { ICategoryRepository } from "@src/domain/interfaces/ICategoryRepository";
import { CategoriesResultReadModel } from "@src/domain/read-models/category.read-models";
import {
  CATEGORIES_CACHE_KEY,
  CATEGORIES_CACHE_TTL_SECONDS,
} from "@src/application/cache/cacheKeys";

class GetCategoriesUseCase {
  constructor(
    private readonly categoryRepository: ICategoryRepository,
    private readonly cache: ICache
  ) {}

  async execute(): Promise<CategoriesResultReadModel> {
    const cached = await this.cache.get<CategoriesResultReadModel>(
      CATEGORIES_CACHE_KEY
    );
    if (cached) {
      return cached;
    }

    const result = await this.categoryRepository.findAll();
    await this.cache.set(
      CATEGORIES_CACHE_KEY,
      result,
      CATEGORIES_CACHE_TTL_SECONDS
    );
    return result;
  }
}

export default GetCategoriesUseCase;
