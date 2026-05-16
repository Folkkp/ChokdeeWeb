-- Supabase Cron fallback for syncing lottery results.
-- Run this in Supabase SQL Editor after replacing <CRON_SECRET>
-- with the same CRON_SECRET value configured in Vercel.
--
-- Schedule: every day at 16:30 Thailand time (09:30 UTC).
-- This calls the production API directly:
-- https://chokdee-webbb.vercel.app/api/sync-lottery

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Remove any older job with the same name so this file can be rerun safely.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'sync-lottery-daily') THEN
    PERFORM cron.unschedule('sync-lottery-daily');
  END IF;
END $$;

SELECT cron.schedule(
  'sync-lottery-daily',
  '30 9 * * *',
  $$
  SELECT net.http_get(
    url := 'https://chokdee-webbb.vercel.app/api/sync-lottery',
    params := jsonb_build_object('secret', 'chokdee_lottery_sync_2026_A9x7K2mQ'),
    timeout_milliseconds := 30000
  ) AS request_id;
  $$
);

-- Optional: run this after the scheduled time to inspect recent executions.
-- SELECT * FROM cron.job_run_details
-- WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'sync-lottery-daily')
-- ORDER BY start_time DESC
-- LIMIT 10;
