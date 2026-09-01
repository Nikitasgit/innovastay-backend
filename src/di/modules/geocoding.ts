import { asClass, asFunction, AwilixContainer } from "awilix";
import GeocodingController from "@src/api/controllers/GeocodingController";
import GetLocationSuggestionsUseCase from "@src/application/usecases/geocode/GetLocationSuggestions.usecase";
import ReverseGeocodeUseCase from "@src/application/usecases/geocode/ReverseGeocode.usecase";
import MapboxGeocoderAdapter from "@src/infrastructure/adapters/MapboxGeocoder.adapter";
import type { Cradle } from "@src/di/cradle";

export const registerGeocodingModule = (
  container: AwilixContainer<Cradle>
): void => {
  container.register({
    geocoder: asFunction(() => new MapboxGeocoderAdapter()).singleton(),
    getLocationSuggestionsUseCase: asClass(
      GetLocationSuggestionsUseCase
    ).singleton(),
    reverseGeocodeUseCase: asClass(ReverseGeocodeUseCase).singleton(),
    geocodingController: asClass(GeocodingController).singleton(),
  });
};
