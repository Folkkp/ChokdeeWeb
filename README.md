# ChokDee

Next.js web app for lottery result lookup, dream interpretation, fortune sticks, and number analytics.

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production

The app is deployed on Vercel. Required environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=<supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
CRON_SECRET=<shared-secret-for-sync-lottery>
```

## Supabase Setup

Main schema:

```bash
supabase-schema.sql
```

Fortune temple migration:

```bash
supabase-fortune-temples-migration.sql
```

Seed commands:

```bash
npm run seed:dreams
npm run seed:temple-fortunes
```

## Lottery Sync

Lottery sync is scheduled by Supabase Cron, not Vercel Cron.

Run `supabase-sync-lottery-cron.sql` in Supabase SQL Editor after replacing `<CRON_SECRET>` with the same `CRON_SECRET` configured in Vercel.

Schedule:

```text
30 9 * * *
```

This runs every day at `16:30` Thailand time and calls:

```text
https://chokdee-webbb.vercel.app/api/sync-lottery
```

Manual production sync:

```text
https://chokdee-webbb.vercel.app/api/sync-lottery?secret=<CRON_SECRET>
```

Dry run, no database writes:

```text
https://chokdee-webbb.vercel.app/api/sync-lottery?dryRun=true&secret=<CRON_SECRET>
```

Check Supabase Cron runs:

```sql
SELECT *
FROM cron.job_run_details
WHERE jobid = (
  SELECT jobid FROM cron.job WHERE jobname = 'sync-lottery-daily'
)
ORDER BY start_time DESC
LIMIT 10;
```
