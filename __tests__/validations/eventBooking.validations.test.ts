import { createEventBookingSchema } from "@src/api/dto/eventBookings/eventBooking.dto";

describe("eventBooking validations", () => {
  describe("createEventBookingSchema", () => {
    it("accepts a valid seat count", () => {
      const result = createEventBookingSchema.safeParse({ seats: 2 });

      expect(result.success).toBe(true);
    });

    it("rejects zero seats", () => {
      const result = createEventBookingSchema.safeParse({ seats: 0 });

      expect(result.success).toBe(false);
    });

    it("rejects a non-integer seat count", () => {
      const result = createEventBookingSchema.safeParse({ seats: 1.5 });

      expect(result.success).toBe(false);
    });

    it("rejects a missing seat count", () => {
      const result = createEventBookingSchema.safeParse({});

      expect(result.success).toBe(false);
    });

    it("rejects a negative seat count", () => {
      const result = createEventBookingSchema.safeParse({ seats: -1 });

      expect(result.success).toBe(false);
    });

    it("rejects a non-numeric payload that could be used as an injection", () => {
      const result = createEventBookingSchema.safeParse({ seats: "$gt" });

      expect(result.success).toBe(false);
    });
  });
});
