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

async function seedData() {
  try {
    const dataPath = path.join(__dirname, '../lib/realData.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const lotteryData = JSON.parse(rawData);

    console.log(`📌 Found ${lotteryData.length} records. Uploading to Supabase...`);

    // Transform the data to match our schema
    const recordsToInsert = lotteryData.map(draw => ({
      id: draw.id,
      date: draw.date,
      first_prize: draw.prizes.first,
      two_digit: draw.prizes.twoDigit,
      three_digit_first: draw.prizes.threeDigitFirst,
      three_digit_last: draw.prizes.threeDigitLast
    }));

    // Upsert to handle re-runs gracefully
    const { data, error } = await supabase
      .from('lottery_results')
      .upsert(recordsToInsert, { onConflict: 'id' });

    if (error) {
      throw error;
    }

    console.log('✅ Successfully uploaded data to Supabase!');
  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
  }
}

seedData();
