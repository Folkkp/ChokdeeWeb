require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const dreamDictionary = require('../lib/dreamData.json');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase config in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seedData() {
  try {
    const recordsToInsert = Object.entries(dreamDictionary).map(([keyword, data]) => ({
      keyword,
      meaning: data.meaning,
      lucky_numbers: {
        twoDigit: data.twoDigit,
        threeDigit: data.threeDigit,
      },
    }));

    console.log(`Found ${recordsToInsert.length} dream keywords. Uploading to Supabase...`);

    const { error } = await supabase
      .from('dreams')
      .upsert(recordsToInsert, { onConflict: 'keyword' });

    if (error) {
      throw error;
    }

    console.log('Successfully seeded dreams to Supabase.');
  } catch (error) {
    console.error('Error seeding dreams:', error.message);
    process.exit(1);
  }
}

seedData();
