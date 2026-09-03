import { ICache } from "@src/domain/interfaces/ICache";
import { IEventRepository } from "@src/domain/interfaces/IEventRepository";
import { EventListItemReadModel } from "@src/domain/read-models/event.read-models";
import { GetEventsInViewInput } from "@src/application/dtos/events/getEventsInView.dto";
import {
  EVENTS_IN_VIEW_CACHE_TTL_SECONDS,
  eventsInViewCacheKey,
} from "@src/application/cache/cacheKeys";

export const MAX_EVENTS_IN_VIEW = 100;

class GetEventsInViewUseCase {
  constructor(
    private readonly eventRepository: IEventRepository,
    private readonly cache: ICache
  ) {}

  async execute(params: {
    filters: GetEventsInViewInput;
  }): Promise<EventListItemReadModel[]> {
    const limit = Math.min(
      params.filters.limit ?? MAX_EVENTS_IN_VIEW,
      MAX_EVENTS_IN_VIEW
    );

    const query = {
      ne: params.filters.ne,
      sw: params.filters.sw,
      eventCategories: params.filters.eventCategories,
      startDate: params.filters.startDate,
      endDate: params.filters.endDate,
      limit,
    };

    const cacheKey = eventsInViewCacheKey(query);
    const cached = await this.cache.get<EventListItemReadModel[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await this.eventRepository.findInView(query);
    await this.cache.set(cacheKey, result, EVENTS_IN_VIEW_CACHE_TTL_SECONDS);
    return result;
  }
}

export default GetEventsInViewUseCase;
