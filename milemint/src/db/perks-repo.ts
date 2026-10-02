import type { SQLiteDatabase } from 'expo-sqlite';

import type { PerkClaim } from '@/perks/claims';

import { withWriteLock } from './transaction';

type Row = { code: string; offer_id: string; claimed_at: string; expires_at: string; redeemed_at: string | null };

const fromRow = (row: Row): PerkClaim => ({
  code: row.code,
  offerId: row.offer_id,
  claimedAt: row.claimed_at,
  expiresAt: row.expires_at,
  redeemedAt: row.redeemed_at,
});

/** Every perk claimed on this phone, newest first. */
export async function listPerkClaims(db: SQLiteDatabase): Promise<PerkClaim[]> {
  const rows = await db.getAllAsync<Row>('SELECT * FROM perk_claims ORDER BY claimed_at DESC;');
  return rows.map(fromRow);
}

export async function getPerkClaim(db: SQLiteDatabase, code: string): Promise<PerkClaim | null> {
  const row = await db.getFirstAsync<Row>('SELECT * FROM perk_claims WHERE code = ?;', code);
  return row ? fromRow(row) : null;
}

export async function insertPerkClaim(db: SQLiteDatabase, claim: PerkClaim): Promise<void> {
  await withWriteLock(() =>
    db.runAsync(
      'INSERT INTO perk_claims (code, offer_id, claimed_at, expires_at, redeemed_at) VALUES (?, ?, ?, ?, ?);',
      claim.code,
      claim.offerId,
      claim.claimedAt,
      claim.expiresAt,
      claim.redeemedAt,
    ),
  );
}

/**
 * Marks a code used, once: a second call keeps the first time. A code that
 * has run out can't be used (it's back in the pool).
 */
export async function markPerkRedeemed(db: SQLiteDatabase, code: string, at: Date): Promise<void> {
  const iso = at.toISOString();
  await withWriteLock(() =>
    db.runAsync(
      'UPDATE perk_claims SET redeemed_at = ? WHERE code = ? AND redeemed_at IS NULL AND expires_at > ?;',
      iso,
      code,
      iso,
    ),
  );
}

/** Demo reset: forgets every claim, so the journey can be shown again. */
export async function clearPerkClaims(db: SQLiteDatabase): Promise<void> {
  await withWriteLock(() => db.runAsync('DELETE FROM perk_claims;'));
}
