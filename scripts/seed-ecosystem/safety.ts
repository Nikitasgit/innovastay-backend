import type { SeedTarget } from "./types";

export function extractMongoHost(uri: string): string {
  const withoutProtocol = uri.replace(/^mongodb(\+srv)?:\/\//i, "");
  const afterCredentials = withoutProtocol.includes("@")
    ? withoutProtocol.slice(withoutProtocol.lastIndexOf("@") + 1)
    : withoutProtocol;
  return afterCredentials.split("/")[0].split("?")[0].toLowerCase();
}

export function isLocalMongoHost(host: string): boolean {
  const hostname = host.split(":")[0];
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "mongo"
  );
}

export function isStagingMongoHost(host: string): boolean {
  return host.includes("staging");
}

export function isProductionMongoHost(host: string): boolean {
  return host.includes("production") || host.includes("prod.");
}

export function assertAllowedTarget(
  mongoUri: string,
  target: SeedTarget,
  options: { confirmStaging: boolean; nodeEnv?: string }
): void {
  const nodeEnv = options.nodeEnv ?? process.env.NODE_ENV;
  if (nodeEnv === "production") {
    throw new Error(
      "Refusing to seed while NODE_ENV=production. This script never targets prod."
    );
  }

  const host = extractMongoHost(mongoUri);

  if (isProductionMongoHost(host)) {
    throw new Error(
      `Refusing to seed production MongoDB host "${host}". This script never targets prod.`
    );
  }

  if (target === "local") {
    if (!isLocalMongoHost(host)) {
      throw new Error(
        `Target "local" requires a local Mongo URI (localhost, 127.0.0.1 or mongo). Got host "${host}".`
      );
    }
    return;
  }

  if (!options.confirmStaging) {
    throw new Error("Target staging requires `--confirm staging`.");
  }

  if (isLocalMongoHost(host)) {
    throw new Error(
      `Target "staging" points at a local Mongo host "${host}". Use --target local instead.`
    );
  }

  if (!isStagingMongoHost(host)) {
    throw new Error(
      `Target "staging" requires a Mongo host containing "staging". Got host "${host}".`
    );
  }
}
