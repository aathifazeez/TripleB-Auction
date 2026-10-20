/**
 * Bid increment rules from the client's rulebook.
 *
 * | Current Bid Range        | Minimum Increment |
 * | 5,000  – 10,000   pts   | +1,000  pts       |
 * | 10,001 – 30,000   pts   | +2,000  pts       |
 * | 30,001 – 60,000   pts   | +5,000  pts       |
 * | 60,001 – 200,000  pts   | +10,000 pts       |
 * | Above  200,000    pts   | +20,000 pts       |
 *
 * Used by BOTH the admin UI (to suggest the next bid) and the
 * /api/auction/bid route (to enforce the floor). Keep this file
 * as the single source of truth.
 */

export function getMinIncrement(currentBid: number): number {
  if (currentBid < 5000)    return 0;      // below the base-price floor — no increment yet
  if (currentBid <= 10000)  return 1000;
  if (currentBid <= 30000)  return 2000;
  if (currentBid <= 60000)  return 5000;
  if (currentBid <= 200000) return 10000;
  return 20000;
}

export function getNextMinBid(currentBid: number): number {
  return currentBid + getMinIncrement(currentBid);
}

export function isValidBid(currentBid: number, proposed: number): boolean {
  return Number.isFinite(proposed) && proposed >= getNextMinBid(currentBid);
}
