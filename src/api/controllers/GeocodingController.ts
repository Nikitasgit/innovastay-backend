import { RequestHandler } from "express";
import { BaseHttpController } from "@src/api/http/BaseHttpController";
import {
  geocodeReverseQuerySchema,
  geocodeSuggestQuerySchema,
} from "@src/api/dto/geocode/geocode.dto";
import { validateOrThrow } from "@src/api/http/controllerFactory";
import type GetLocationSuggestionsUseCase from "@src/application/usecases/geocode/GetLocationSuggestions.usecase";
import type ReverseGeocodeUseCase from "@src/application/usecases/geocode/ReverseGeocode.usecase";

class GeocodingController extends BaseHttpController {
  constructor(
    private readonly getLocationSuggestionsUseCase: GetLocationSuggestionsUseCase,
    private readonly reverseGeocodeUseCase: ReverseGeocodeUseCase
  ) {
    super();
  }

  suggest(): RequestHandler {
    return this.handler({
      execute: (req) => {
        const query = validateOrThrow(geocodeSuggestQuerySchema, req.query);
        return this.getLocationSuggestionsUseCase.execute({ query: query.q });
      },
      successMessage: "Location suggestions fetched successfully",
      signImages: false,
    });
  }

  reverse(): RequestHandler {
    return this.handler({
      execute: (req) => {
        const query = validateOrThrow(geocodeReverseQuerySchema, req.query);
        return this.reverseGeocodeUseCase.execute({
          lng: query.lng,
          lat: query.lat,
        });
      },
      successMessage: "Reverse geocode fetched successfully",
      signImages: false,
    });
  }
}

export default GeocodingController;
