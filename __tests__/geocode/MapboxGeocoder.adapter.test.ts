import MapboxGeocoderAdapter from "@src/infrastructure/adapters/MapboxGeocoder.adapter";

jest.mock("@src/shared/logger", () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

const parisFeature = {
  id: "place.paris",
  place_name_fr: "Paris, France",
  place_name: "Paris, France",
  center: [2.3522, 48.8566] as [number, number],
};

const jsonResponse = (body: unknown, ok = true, status = 200): Response =>
  ({
    ok,
    status,
    json: async () => body,
  }) as Response;

describe("MapboxGeocoderAdapter", () => {
  it("returns empty results when the token is missing", async () => {
    const httpFetch = jest.fn();
    const adapter = new MapboxGeocoderAdapter({
      getToken: () => undefined,
      httpFetch,
    });

    await expect(adapter.suggest("paris")).resolves.toEqual([]);
    await expect(adapter.reverse(2.35, 48.85)).resolves.toBeNull();
    expect(httpFetch).not.toHaveBeenCalled();
  });

  it("maps forward geocode features", async () => {
    const httpFetch = jest.fn().mockResolvedValue(
      jsonResponse({ features: [parisFeature] })
    );
    const adapter = new MapboxGeocoderAdapter({
      getToken: () => "pk.test",
      httpFetch,
    });

    await expect(adapter.suggest("paris")).resolves.toEqual([
      {
        type: "Point",
        id: "place.paris",
        label: "Paris, France",
        coordinates: [2.3522, 48.8566],
      },
    ]);
    expect(httpFetch).toHaveBeenCalled();
  });

  it("keeps the requested coordinates on reverse geocode", async () => {
    const httpFetch = jest.fn().mockResolvedValue(
      jsonResponse({ features: [parisFeature] })
    );
    const adapter = new MapboxGeocoderAdapter({
      getToken: () => "pk.test",
      httpFetch,
    });

    await expect(adapter.reverse(2.3, 48.8)).resolves.toEqual({
      type: "Point",
      id: "place.paris",
      label: "Paris, France",
      coordinates: [2.3, 48.8],
    });
  });

  it("fails open when Mapbox is down", async () => {
    const httpFetch = jest.fn().mockRejectedValue(new Error("timeout"));
    const adapter = new MapboxGeocoderAdapter({
      getToken: () => "pk.test",
      httpFetch,
    });

    await expect(adapter.suggest("paris")).resolves.toEqual([]);
    await expect(adapter.reverse(2.3, 48.8)).resolves.toBeNull();
  });

  it("fails open on a non-OK Mapbox response", async () => {
    const httpFetch = jest.fn().mockResolvedValue(jsonResponse({}, false, 429));
    const adapter = new MapboxGeocoderAdapter({
      getToken: () => "pk.test",
      httpFetch,
    });

    await expect(adapter.suggest("paris")).resolves.toEqual([]);
  });
});
