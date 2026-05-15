-- Multi-temple fortune stick migration
-- Run this in Supabase SQL Editor, then run:
-- npm run seed:temple-fortunes

CREATE TABLE IF NOT EXISTS fortune_temples (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    sacred_focus TEXT NOT NULL,
    source_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE fortune_temples ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read fortune_temples" ON fortune_temples;
CREATE POLICY "Allow public read fortune_temples"
ON fortune_temples
FOR SELECT
TO anon
USING (true);

DROP POLICY IF EXISTS "Allow public insert fortune_temples" ON fortune_temples;
CREATE POLICY "Allow public insert fortune_temples"
ON fortune_temples
FOR INSERT
TO anon
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update fortune_temples" ON fortune_temples;
CREATE POLICY "Allow public update fortune_temples"
ON fortune_temples
FOR UPDATE
TO anon
USING (true);

CREATE TABLE IF NOT EXISTS fortune_sticks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    temple_id TEXT NOT NULL REFERENCES fortune_temples(id) ON DELETE CASCADE,
    number INTEGER NOT NULL,
    text TEXT NOT NULL,
    lucky_numbers TEXT NOT NULL,
    source_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fortune_sticks_temple_number_unique UNIQUE (temple_id, number)
);

ALTER TABLE fortune_sticks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read fortune_sticks" ON fortune_sticks;
CREATE POLICY "Allow public read fortune_sticks"
ON fortune_sticks
FOR SELECT
TO anon
USING (true);

DROP POLICY IF EXISTS "Allow public insert fortune_sticks" ON fortune_sticks;
CREATE POLICY "Allow public insert fortune_sticks"
ON fortune_sticks
FOR INSERT
TO anon
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update fortune_sticks" ON fortune_sticks;
CREATE POLICY "Allow public update fortune_sticks"
ON fortune_sticks
FOR UPDATE
TO anon
USING (true);
