import express, { Router } from "express";
import type { RouteDependencies } from "@src/api/routes/routeDependencies";

const createGeocodeRoutes = ({
  geocodingController,
  rateLimiterMiddleware,
}: Pick<
  RouteDependencies,
  "geocodingController" | "rateLimiterMiddleware"
>): Router => {
  const router: Router = express.Router();

  router.get(
    "/suggest",
    rateLimiterMiddleware.geocode(),
    geocodingController.suggest()
  );
  router.get(
    "/reverse",
    rateLimiterMiddleware.geocode(),
    geocodingController.reverse()
  );

  return router;
};

export default createGeocodeRoutes;
