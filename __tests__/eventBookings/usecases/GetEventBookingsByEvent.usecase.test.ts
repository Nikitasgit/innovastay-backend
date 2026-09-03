import { Types } from "mongoose";
import GetEventBookingsByEventUseCase from "@src/application/usecases/eventBookings/GetEventBookingsByEvent.usecase";
import { Event } from "@src/domain/entities/Event.entity";
import { IEventBookingRepository } from "@src/domain/interfaces/IEventBookingRepository";
import { IEventRepository } from "@src/domain/interfaces/IEventRepository";
import {
  EventCategoryId,
  EventId,
  PlaceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { ERROR_CODES } from "@src/shared/errors";

const mockObjectId = (): string => new Types.ObjectId().toString();

const createEvent = (ownerId: string): Event => {
  const start = new Date("2027-01-01");
  return Event.reconstitute({
    id: EventId.from(mockObjectId()),
    name: "Bookable event",
    description: "Test",
    ownerId: UserId.from(ownerId),
    categoryId: EventCategoryId.from(mockObjectId()),
    schedule: [{ startDate: start, endDate: start }],
    dateRange: { firstDate: start, latestDate: start },
    status: "available",
    lifecycleStatus: "upcoming",
    placeId: PlaceId.from(mockObjectId()),
    location: null,
    online: false,
    rating: 0,
    isBookable: true,
    capacity: 10,
    maxSeatsPerBooking: 2,
    deleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
};

describe("GetEventBookingsByEventUseCase", () => {
  let eventBookingRepository: jest.Mocked<IEventBookingRepository>;
  let eventRepository: jest.Mocked<Pick<IEventRepository, "findById">>;
  let useCase: GetEventBookingsByEventUseCase;

  beforeEach(() => {
    eventBookingRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      deleteManyByEventIds: jest.fn(),
      deleteManyByUserId: jest.fn(),
      findConfirmedByEventAndUser: jest.fn(),
      sumConfirmedSeats: jest.fn(),
      findConfirmedByEvent: jest.fn(),
      findConfirmedByUser: jest.fn(),
    };
    eventRepository = { findById: jest.fn() };
    useCase = new GetEventBookingsByEventUseCase(
      eventBookingRepository,
      eventRepository as unknown as IEventRepository
    );
  });

  it("returns confirmed bookings for the event owner", async () => {
    const ownerId = mockObjectId();
    const event = createEvent(ownerId);
    const bookings = [
      {
        id: mockObjectId(),
        seats: 2,
        status: "confirmed" as const,
      },
    ];
    eventRepository.findById.mockResolvedValue(event);
    eventBookingRepository.findConfirmedByEvent.mockResolvedValue(bookings);

    const result = await useCase.execute({
      eventId: event.id!.toString(),
      actorId: ownerId,
    });

    expect(result).toEqual(bookings);
    expect(eventBookingRepository.findConfirmedByEvent).toHaveBeenCalledWith(
      event.id
    );
  });

  it("rejects a requester who does not own the event", async () => {
    const event = createEvent(mockObjectId());
    eventRepository.findById.mockResolvedValue(event);

    await expect(
      useCase.execute({
        eventId: event.id!.toString(),
        actorId: mockObjectId(),
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.FORBIDDEN,
    });
    expect(eventBookingRepository.findConfirmedByEvent).not.toHaveBeenCalled();
  });
});
