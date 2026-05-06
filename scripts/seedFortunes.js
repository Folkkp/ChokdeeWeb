require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase URL or Anon Key in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seedFortunes() {
  try {
    const dataPath = path.join(__dirname, '../lib/fortuneData.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const fortuneData = JSON.parse(rawData);

    console.log(`📌 Found ${fortuneData.length} fortune records. Uploading to Supabase...`);

    // We can't easily upsert by number without an id unless number is a unique constraint,
    // but the schema has number INTEGER NOT NULL UNIQUE.
    // So we can use upsert with onConflict: 'number'
    
    const recordsToInsert = fortuneData.map(f => ({
      number: f.number,
      text: f.text,
      lucky_numbers: f.lucky_numbers
    }));

    const { data, error } = await supabase
      .from('fortunes')
      .upsert(recordsToInsert, { onConflict: 'number' });

    if (error) {
      throw error;
    }

    console.log('✅ Successfully uploaded fortune data to Supabase!');
  } catch (error) {
    console.error('❌ Error seeding fortune data:', error.message);
  }
}

seedFortunes();
