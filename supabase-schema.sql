-- Create the lottery_results table
CREATE TABLE lottery_results (
    id INT8 PRIMARY KEY,
    date TEXT NOT NULL,
    first_prize TEXT NOT NULL,
    two_digit TEXT NOT NULL,
    three_digit_first JSONB NOT NULL,
    three_digit_last JSONB NOT NULL
);

-- Enable Row Level Security
ALTER TABLE lottery_results ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous read access
CREATE POLICY "Allow public read access" 
ON lottery_results 
FOR SELECT 
TO anon 
USING (true);

CREATE POLICY "Allow public insert access" 
ON lottery_results 
FOR INSERT 
TO anon 
WITH CHECK (true);

CREATE POLICY "Allow public update access" 
ON lottery_results 
FOR UPDATE 
TO anon 
USING (true);

-- NEW: Create search_logs table
CREATE TABLE search_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pattern TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE search_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert to search_logs" 
ON search_logs 
FOR INSERT 
TO anon 
WITH CHECK (true);

CREATE POLICY "Allow public read search_logs" 
ON search_logs 
FOR SELECT 
TO anon 
USING (true);

-- NEW: Create dreams table
CREATE TABLE dreams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    keyword TEXT NOT NULL UNIQUE,
    meaning TEXT NOT NULL,
    lucky_numbers JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE dreams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read dreams" 
ON dreams 
FOR SELECT 
TO anon 
USING (true);

CREATE POLICY "Allow public insert dreams" 
ON dreams 
FOR INSERT 
TO anon 
WITH CHECK (true);

CREATE POLICY "Allow public update dreams" 
ON dreams 
FOR UPDATE 
TO anon 
USING (true);

-- NEW: Create fortunes table for Esiimsi
CREATE TABLE fortunes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    number INTEGER NOT NULL UNIQUE,
    text TEXT NOT NULL,
    lucky_numbers TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE fortunes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read fortunes" 
ON fortunes 
FOR SELECT 
TO anon 
USING (true);

CREATE POLICY "Allow public insert fortunes" 
ON fortunes 
FOR INSERT 
TO anon 
WITH CHECK (true);

CREATE POLICY "Allow public update fortunes" 
ON fortunes 
FOR UPDATE 
TO anon 
USING (true);

-- MIGRATION: Add UNIQUE constraint on lottery_results.date for upsert support
-- Run this once in Supabase SQL Editor:
-- ALTER TABLE lottery_results ADD CONSTRAINT lottery_results_date_unique UNIQUE (date);

-- Allow anon to delete search_logs (for reset on new draw)
CREATE POLICY "Allow public delete search_logs"
ON search_logs FOR DELETE TO anon USING (true);

-- Allow anon to delete lottery_results (for trimming over 100 draws)
CREATE POLICY "Allow public delete lottery_results"
ON lottery_results FOR DELETE TO anon USING (true);

-- Multi-temple fortune stick tables
-- Run this section in Supabase SQL Editor before running npm run seed:temple-fortunes.
CREATE TABLE IF NOT EXISTS fortune_temples (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    sacred_focus TEXT NOT NULL,
    source_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE fortune_temples ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read fortune_temples"
ON fortune_temples
FOR SELECT
TO anon
USING (true);

CREATE POLICY "Allow public insert fortune_temples"
ON fortune_temples
FOR INSERT
TO anon
WITH CHECK (true);

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

CREATE POLICY "Allow public read fortune_sticks"
ON fortune_sticks
FOR SELECT
TO anon
USING (true);

CREATE POLICY "Allow public insert fortune_sticks"
ON fortune_sticks
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Allow public update fortune_sticks"
ON fortune_sticks
FOR UPDATE
TO anon
USING (true);
