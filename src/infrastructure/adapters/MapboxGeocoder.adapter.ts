import { IGeocoder } from "@src/domain/interfaces/IGeocoder";
import { LocationReadModel } from "@src/domain/read-models/shared.read-models";
import logger from "@src/shared/logger";

type MapboxFeature = {
  id?: string;
  place_name?: string;
  place_name_fr?: string;
  center?: [number, number];
};

type MapboxGeocodeResponse = {
  features?: MapboxFeature[];
};

export type MapboxGeocoderDeps = {
  getToken?: () => string | undefined;
  httpFetch?: typeof fetch;
};

class MapboxGeocoderAdapter implements IGeocoder {
  private warnedMissingToken = false;
  private readonly getToken: () => string | undefined;
  private readonly httpFetch: typeof fetch;

  constructor(deps: MapboxGeocoderDeps = {}) {
    this.getToken = deps.getToken ?? (() => process.env.MAPBOX_ACCESS_TOKEN);
    this.httpFetch = deps.httpFetch ?? fetch;
  }

  async suggest(query: string): Promise<LocationReadModel[]> {
    const token = this.readToken();
    if (!token) {
      return [];
    }

    const url = new URL(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`
    );
    url.searchParams.set("access_token", token);
    url.searchParams.set("country", "fr");
    url.searchParams.set("language", "fr");
    url.searchParams.set("limit", "5");

    const data = await this.fetchJson(url);
    if (!data?.features?.length) {
      return [];
    }

    return data.features.flatMap((feature) => {
      const location = this.toLocation(feature);
      return location ? [location] : [];
    });
  }

  async reverse(lng: number, lat: number): Promise<LocationReadModel | null> {
    const token = this.readToken();
    if (!token) {
      return null;
    }

    const url = new URL(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json`
    );
    url.searchParams.set("access_token", token);

    const data = await this.fetchJson(url);
    const feature = data?.features?.[0];
    if (!feature) {
      return null;
    }

    const location = this.toLocation(feature, [lng, lat]);
    return location;
  }

  private readToken(): string | undefined {
    const token = this.getToken();
    if (!token) {
      if (!this.warnedMissingToken) {
        this.warnedMissingToken = true;
        logger.warn("MAPBOX_ACCESS_TOKEN is not defined — geocoding disabled");
      }
      return undefined;
    }
    return token;
  }

  private async fetchJson(
    url: URL
  ): Promise<MapboxGeocodeResponse | null> {
    try {
      const response = await this.httpFetch(url);
      if (!response.ok) {
        logger.error(`Mapbox geocoding failed: ${response.status}`);
        return null;
      }
      return (await response.json()) as MapboxGeocodeResponse;
    } catch (err) {
      logger.error(`Mapbox geocoding error: ${(err as Error).message}`);
      return null;
    }
  }

  private toLocation(
    feature: MapboxFeature,
    coordinates?: [number, number]
  ): LocationReadModel | null {
    const id = feature.id;
    const label = feature.place_name_fr || feature.place_name;
    const coords = coordinates ?? feature.center;
    if (!id || !label || !coords) {
      return null;
    }

    return {
      type: "Point",
      id,
      label,
      coordinates: coords,
    };
  }
}

export default MapboxGeocoderAdapter;
