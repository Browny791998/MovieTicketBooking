import Redis from "ioredis";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

function createRedis() {
  const client = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    retryStrategy: (times) => Math.min(times * 200, 2000),
  });
  // Prevent unhandled error event from crashing the process
  client.on("error", (err: Error) => {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[redis] connection error:", err.message);
    }
  });
  return client;
}

export const redis = globalForRedis.redis ?? createRedis();

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;

export const SEAT_LOCK_TTL = 600; // 10 minutes in seconds

// Key helpers
export function seatLockKey(showtimeId: string, seatId: string): string {
  return `seat_lock:${showtimeId}:${seatId}`;
}

/** Set index of all currently locked seatIds for a showtime */
export function showtimeLockIndexKey(showtimeId: string): string {
  return `seat_locks:${showtimeId}`;
}

// Lua script: atomically check ownership and delete
// KEYS[1] = lock key, ARGV[1] = userId
// Returns 1 if deleted, 0 if not owned / not found
const unlockScript = `
local owner = redis.call('GET', KEYS[1])
if owner == ARGV[1] then
  redis.call('DEL', KEYS[1])
  return 1
end
return 0
`;

/**
 * Lock a seat. Uses pipeline: SET NX EX + SADD to index (+ EXPIRE index to keep TTL in sync).
 * Returns true if lock was acquired.
 */
export async function lockSeat(
  showtimeId: string,
  seatId: string,
  userId: string
): Promise<boolean> {
  const key = seatLockKey(showtimeId, seatId);
  const indexKey = showtimeLockIndexKey(showtimeId);

  const result = await redis.set(key, userId, "EX", SEAT_LOCK_TTL, "NX");
  if (result !== "OK") return false;

  // Add seatId to the showtime index; keep index TTL slightly longer than lock TTL
  const pipeline = redis.pipeline();
  pipeline.sadd(indexKey, seatId);
  pipeline.expire(indexKey, SEAT_LOCK_TTL + 60);
  await pipeline.exec();

  return true;
}

/**
 * Refresh TTL for an existing lock owned by userId.
 * Returns true if key existed and was owned.
 */
export async function refreshSeatLock(
  showtimeId: string,
  seatId: string,
  userId: string
): Promise<boolean> {
  const key = seatLockKey(showtimeId, seatId);
  const indexKey = showtimeLockIndexKey(showtimeId);

  const owner = await redis.get(key);
  if (owner !== userId) return false;

  const pipeline = redis.pipeline();
  pipeline.expire(key, SEAT_LOCK_TTL);
  pipeline.expire(indexKey, SEAT_LOCK_TTL + 60);
  await pipeline.exec();

  return true;
}

/**
 * Atomically check ownership and unlock a single seat.
 * Also removes seatId from the showtime index.
 * Returns true if the lock was released.
 */
export async function unlockSeat(
  showtimeId: string,
  seatId: string,
  userId: string
): Promise<boolean> {
  const key = seatLockKey(showtimeId, seatId);
  const indexKey = showtimeLockIndexKey(showtimeId);

  const deleted = await redis.eval(unlockScript, 1, key, userId) as number;
  if (deleted === 1) {
    await redis.srem(indexKey, seatId);
    return true;
  }
  return false;
}

/**
 * Unlock all seats for a showtime (used after booking confirmed or on bulk release).
 * Uses pipeline for atomic bulk delete.
 */
export async function unlockAllSeats(
  showtimeId: string,
  seatIds: string[]
): Promise<void> {
  if (seatIds.length === 0) return;
  const keys = seatIds.map((id) => seatLockKey(showtimeId, id));
  const indexKey = showtimeLockIndexKey(showtimeId);

  const pipeline = redis.pipeline();
  keys.forEach((key) => pipeline.del(key));
  pipeline.srem(indexKey, ...seatIds);
  await pipeline.exec();
}

/**
 * Get a map of seatId → userId for all currently locked seats in a showtime.
 * Uses SMEMBERS on index (no full-keyspace KEYS scan) + MGET.
 */
export async function getShowtimeLockMap(
  showtimeId: string
): Promise<Record<string, string>> {
  const indexKey = showtimeLockIndexKey(showtimeId);
  const seatIds = await redis.smembers(indexKey);

  if (seatIds.length === 0) return {};

  const keys = seatIds.map((id) => seatLockKey(showtimeId, id));
  const values = await redis.mget(...keys);

  const map: Record<string, string> = {};
  seatIds.forEach((id, i) => {
    if (values[i]) {
      map[id] = values[i]!;
    } else {
      // Key expired but index not yet cleaned — stale entry, ignore
    }
  });
  return map;
}

/**
 * Get all seats locked by a specific user for a showtime, with TTLs.
 * Uses SMEMBERS + MGET + pipelined TTL — no KEYS scan.
 */
export async function getUserLocksForShowtime(
  showtimeId: string,
  userId: string
): Promise<{ seatId: string; ttl: number }[]> {
  const indexKey = showtimeLockIndexKey(showtimeId);
  const seatIds = await redis.smembers(indexKey);

  if (seatIds.length === 0) return [];

  const keys = seatIds.map((id) => seatLockKey(showtimeId, id));
  const values = await redis.mget(...keys);

  // Filter to keys owned by this user
  const ownedKeys: string[] = [];
  const ownedSeatIds: string[] = [];
  seatIds.forEach((id, i) => {
    if (values[i] === userId) {
      ownedKeys.push(keys[i]);
      ownedSeatIds.push(id);
    }
  });

  if (ownedKeys.length === 0) return [];

  // Pipeline all TTL calls
  const pipeline = redis.pipeline();
  ownedKeys.forEach((key) => pipeline.ttl(key));
  const ttlResults = await pipeline.exec();

  return ownedSeatIds.map((id, i) => ({
    seatId: id,
    ttl: (ttlResults?.[i]?.[1] as number) ?? -1,
  }));
}

/**
 * Get lock owners for a specific set of seatIds using MGET (no scan).
 */
export async function getSeatLocks(
  showtimeId: string,
  seatIds: string[]
): Promise<Record<string, string | null>> {
  const keys = seatIds.map((id) => seatLockKey(showtimeId, id));
  if (keys.length === 0) return {};
  const values = await redis.mget(...keys);
  const result: Record<string, string | null> = {};
  seatIds.forEach((id, i) => {
    result[id] = values[i];
  });
  return result;
}
