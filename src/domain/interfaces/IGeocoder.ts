import { LocationReadModel } from "@src/domain/read-models/shared.read-models";

export interface IGeocoder {
  suggest(query: string): Promise<LocationReadModel[]>;
  reverse(lng: number, lat: number): Promise<LocationReadModel | null>;
}
