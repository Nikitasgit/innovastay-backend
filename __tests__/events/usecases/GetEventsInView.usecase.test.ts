import GetEventsInViewUseCase, {
  MAX_EVENTS_IN_VIEW,
} from "@src/application/usecases/events/GetEventsInView.usecase";
import {
  EVENTS_IN_VIEW_CACHE_TTL_SECONDS,
  eventsInViewCacheKey,
} from "@src/application/cache/cacheKeys";
import { ICache } from "@src/domain/interfaces/ICache";
import { IEventRepository } from "@src/domain/interfaces/IEventRepository";
import { EventListItemReadModel } from "@src/domain/read-models/event.read-models";

const ne = [2.3525, 48.8566];
const sw = [2.348, 48.852];
const payload: EventListItemReadModel[] = [{ id: "event_1", name: "Workshop" }];

const createEventRepository = (): jest.Mocked<IEventRepository> =>
  ({
    findInView: jest.fn(),
  } as jest.Mocked<IEventRepository>);

const createCache = (): jest.Mocked<ICache> => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
});

describe("GetEventsInViewUseCase", () => {
  let eventRepository: jest.Mocked<IEventRepository>;
  let cache: jest.Mocked<ICache>;
  let useCase: GetEventsInViewUseCase;

  beforeEach(() => {
    eventRepository = createEventRepository();
    cache = createCache();
    useCase = new GetEventsInViewUseCase(eventRepository, cache);
  });

  it("returns cached events without hitting the repository", async () => {
    cache.get.mockResolvedValue(payload);

    const result = await useCase.execute({
      filters: { ne, sw, limit: 100 },
    });

    expect(result).toEqual(payload);
    expect(eventRepository.findInView).not.toHaveBeenCalled();
    expect(cache.set).not.toHaveBeenCalled();
    expect(cache.get).toHaveBeenCalledWith(
      eventsInViewCacheKey({
        ne,
        sw,
        limit: MAX_EVENTS_IN_VIEW,
      })
    );
  });

  it("loads from the repository and caches on miss", async () => {
    cache.get.mockResolvedValue(null);
    eventRepository.findInView.mockResolvedValue(payload);

    const result = await useCase.execute({
      filters: {
        ne,
        sw,
        eventCategories: ["cat1"],
        startDate: "2026-08-01",
        endDate: "2026-08-31",
        limit: 50,
      },
    });

    expect(result).toEqual(payload);
    expect(eventRepository.findInView).toHaveBeenCalledTimes(1);
    expect(cache.set).toHaveBeenCalledWith(
      eventsInViewCacheKey({
        ne,
        sw,
        eventCategories: ["cat1"],
        startDate: "2026-08-01",
        endDate: "2026-08-31",
        limit: 50,
      }),
      payload,
      EVENTS_IN_VIEW_CACHE_TTL_SECONDS
    );
  });
});
