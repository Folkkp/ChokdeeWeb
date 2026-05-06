import { supabase } from '../../lib/supabase';
import { scrapeLatestDraw, scrapeAllDraws, normalizeDate } from '../../lib/scraper';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // ── Step 1: Scrape latest draw from Sanook ──────────────────────────────
    let latestExternal = null;
    let scrapeError = null;
    try {
      latestExternal = await scrapeLatestDraw();
    } catch (err) {
      scrapeError = err.message;
      console.error('[sync-lottery] Scrape failed:', err.message);
    }

    if (!latestExternal) {
      return res.status(200).json({
        status: 'scrape_failed',
        message: 'Could not reach Sanook. No changes made.',
        error: scrapeError,
      });
    }

    // ── Step 2: Get latest draw stored in Supabase ──────────────────────────
    const { data: dbRows, error: dbErr } = await supabase
      .from('lottery_results')
      .select('id, date')
      .order('id', { ascending: false })
      .limit(1);

    if (dbErr) throw dbErr;

    const latestInDB = dbRows && dbRows.length > 0 ? dbRows[0] : null;

    // ── Step 3: Compare dates (normalized) ─────────────────────────────────
    const externalDate = normalizeDate(latestExternal.date);
    const dbDate = latestInDB ? normalizeDate(latestInDB.date) : null;

    const isNewDraw = externalDate !== dbDate;

    console.log(`[sync-lottery] External: "${externalDate}" | DB: "${dbDate}" | New draw: ${isNewDraw}`);

    if (!isNewDraw) {
      // ── Same draw: just refresh all 100 records (upsert by id) ──────────────
      const allDraws = await scrapeAllDraws(5);

      // Fetch existing ID map (date -> id) so we can reuse existing IDs
      const { data: existingRows } = await supabase
        .from('lottery_results')
        .select('id, date');
      const dateToId = {};
      if (existingRows) existingRows.forEach((r) => { dateToId[r.date] = r.id; });

      const maxExistingId = existingRows && existingRows.length > 0
        ? Math.max(...existingRows.map((r) => r.id))
        : 100;

      const recordsToUpsert = buildRecords(allDraws, dateToId, maxExistingId);

      const { error: upsertErr } = await supabase
        .from('lottery_results')
        .upsert(recordsToUpsert, { onConflict: 'id' });

      if (upsertErr) throw upsertErr;

      return res.status(200).json({
        status: 'same_draw',
        message: `No new draw detected. Refreshed ${recordsToUpsert.length} records.`,
        latestDate: externalDate,
      });
    }

    // ── New draw detected ────────────────────────────────────────────────────

    // Step 4a: Scrape all 100 draws, fetch existing ID map, then upsert
    const allDraws = await scrapeAllDraws(5);

    // Build ID map from existing records
    const { data: existingRows } = await supabase
      .from('lottery_results')
      .select('id, date');
    const dateToId = {};
    if (existingRows) existingRows.forEach((r) => { dateToId[r.date] = r.id; });
    const maxExistingId = existingRows && existingRows.length > 0
      ? Math.max(...existingRows.map((r) => r.id))
      : 0;

    const recordsToUpsert = buildRecords(allDraws, dateToId, maxExistingId);

    const { error: upsertErr } = await supabase
      .from('lottery_results')
      .upsert(recordsToUpsert, { onConflict: 'id' });

    if (upsertErr) throw upsertErr;

    // Step 4b: Delete ALL search_logs (reset for new draw period)
    const { error: deleteLogsErr } = await supabase
      .from('search_logs')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // delete all rows

    if (deleteLogsErr) {
      console.error('[sync-lottery] Failed to delete search_logs:', deleteLogsErr.message);
      // Non-fatal: continue
    }

    // Step 4c: Trim lottery_results to keep only 100 most recent rows
    const { data: allIds, error: fetchIdsErr } = await supabase
      .from('lottery_results')
      .select('id')
      .order('id', { ascending: false });

    if (!fetchIdsErr && allIds && allIds.length > 100) {
      const idsToDelete = allIds.slice(100).map((r) => r.id);
      const { error: trimErr } = await supabase
        .from('lottery_results')
        .delete()
        .in('id', idsToDelete);

      if (trimErr) {
        console.error('[sync-lottery] Failed to trim old records:', trimErr.message);
      } else {
        console.log(`[sync-lottery] Trimmed ${idsToDelete.length} old records.`);
      }
    }

    return res.status(200).json({
      status: 'new_draw',
      message: `New draw detected! Synced ${recordsToUpsert.length} records. search_logs reset.`,
      previousDate: dbDate,
      newDate: externalDate,
      resetLogs: true,
    });
  } catch (err) {
    console.error('[sync-lottery] Unexpected error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

/**
 * Build Supabase rows: reuse existing IDs for known dates,
 * assign new auto-incremented IDs for genuinely new draws.
 */
function buildRecords(draws, dateToId, maxExistingId) {
  let nextId = maxExistingId + 1;
  // Walk newest-first (draws[0] is the latest)
  const records = draws.map((draw) => {
    const existingId = dateToId[draw.date];
    const id = existingId !== undefined ? existingId : nextId++;
    return {
      id,
      date: draw.date,
      first_prize: draw.prizes.first,
      two_digit: draw.prizes.twoDigit,
      three_digit_first: draw.prizes.threeDigitFirst,
      three_digit_last: draw.prizes.threeDigitLast,
    };
  });
  return records;
}
