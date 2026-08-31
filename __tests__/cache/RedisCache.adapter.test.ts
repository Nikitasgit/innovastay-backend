import RedisCacheAdapter, {
  RedisCacheCommands,
} from "@src/infrastructure/adapters/RedisCache.adapter";

jest.mock("@src/shared/logger", () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

const createMockClient = (): jest.Mocked<RedisCacheCommands> => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
});

describe("RedisCacheAdapter", () => {
  it("returns parsed JSON on cache hit", async () => {
    const client = createMockClient();
    client.get.mockResolvedValue(JSON.stringify({ id: "ct1" }));
    const adapter = new RedisCacheAdapter(() => client);

    await expect(adapter.get<{ id: string }>("categories:all")).resolves.toEqual(
      { id: "ct1" }
    );
  });

  it("returns null on miss, missing client, Redis error, or invalid JSON", async () => {
    const client = createMockClient();
    const adapter = new RedisCacheAdapter(() => client);

    client.get.mockResolvedValue(null);
    await expect(adapter.get("k")).resolves.toBeNull();

    const noClientAdapter = new RedisCacheAdapter(() => null);
    await expect(noClientAdapter.get("k")).resolves.toBeNull();

    client.get.mockRejectedValue(new Error("connection refused"));
    await expect(adapter.get("k")).resolves.toBeNull();

    client.get.mockResolvedValue("{not-json");
    await expect(adapter.get("k")).resolves.toBeNull();
  });

  it("sets JSON with TTL and no-ops when Redis is unavailable", async () => {
    const client = createMockClient();
    client.set.mockResolvedValue("OK");
    const adapter = new RedisCacheAdapter(() => client);

    await adapter.set("categories:all", { ok: true }, 3600);
    expect(client.set).toHaveBeenCalledWith(
      "categories:all",
      JSON.stringify({ ok: true }),
      { EX: 3600 }
    );

    client.set.mockRejectedValue(new Error("timeout"));
    await expect(adapter.set("k", { ok: true }, 10)).resolves.toBeUndefined();

    const noClientAdapter = new RedisCacheAdapter(() => null);
    await expect(
      noClientAdapter.set("k", { ok: true }, 10)
    ).resolves.toBeUndefined();
  });

  it("deletes a key and no-ops when Redis is unavailable", async () => {
    const client = createMockClient();
    client.del.mockResolvedValue(1);
    const adapter = new RedisCacheAdapter(() => client);

    await adapter.del("categories:all");
    expect(client.del).toHaveBeenCalledWith("categories:all");

    client.del.mockRejectedValue(new Error("timeout"));
    await expect(adapter.del("k")).resolves.toBeUndefined();

    const noClientAdapter = new RedisCacheAdapter(() => null);
    await expect(noClientAdapter.del("k")).resolves.toBeUndefined();
  });
});
