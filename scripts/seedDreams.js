require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase Config in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seedData() {
  try {
    // Read the dreamDictionary file dynamically and parse it, or just use require if we modify the export
    // Since lib/dreamDictionary.js uses `export const`, it's an ES module. We can't easily require it in standard Node script without babel/esm.
    // Let's just define it here or read it via fs and regex for a quick script.
    
    // Instead of complex parsing, I'll just copy the dictionary here for the seed script
    const dreamDictionary = {
      "งู": {
        meaning: "จะได้พบเนื้อคู่ คนโสดจะได้พบรัก คนมีคู่แล้วอาจมีผู้มารอคอย หรือจะมีโชคลาภจากการเสี่ยงโชค",
        twoDigit: ["56", "66", "59"],
        threeDigit: ["559", "566", "568"]
      },
      "บ้าน": {
        meaning: "จะได้รับโชคลาภจากการงาน หรือผู้ใหญ่ให้ความเมตตา อาจมีการเปลี่ยนแปลงที่อยู่อาศัยหรือหน้าที่การงานไปในทางที่ดีขึ้น",
        twoDigit: ["76", "78", "79"],
        threeDigit: ["276", "786", "789"]
      },
      "เงิน": {
        meaning: "จะได้รับความเดือดร้อนเรื่องหนี้สิน หรือมีคนมาหยิบยืมเงิน แต่ในทางกลับกันอาจจะได้โชคลาภแบบฟลุคๆ",
        twoDigit: ["66", "69", "36"],
        threeDigit: ["369", "669", "664"]
      },
      "ทอง": {
        meaning: "จะสมหวังในสิ่งที่คิดไว้ จะมีโชคลาภก้อนโต หรือได้เลื่อนขั้นเลื่อนตำแหน่ง",
        twoDigit: ["12", "24", "36"],
        threeDigit: ["124", "362", "164"]
      },
      "ปลา": {
        meaning: "จะได้ลาภทางผลงาน หรือโชคลาภจากการเสี่ยงทาย จะมีคนนำของมาให้",
        twoDigit: ["88", "78", "28"],
        threeDigit: ["288", "878", "808"]
      },
      "รถ": {
        meaning: "จะต้องเดินทางไกล หรือมีการโยกย้าย เปลี่ยนแปลงหน้าที่การงาน",
        twoDigit: ["40", "44", "47"],
        threeDigit: ["440", "447", "407"]
      },
      "เด็ก": {
        meaning: "จะได้ลาภลอย หรือมีคนนำโชคลาภมาให้ จะมีข่าวดีจากคนในครอบครัว",
        twoDigit: ["17", "13", "33"],
        threeDigit: ["317", "313", "337"]
      },
      "ช้าง": {
        meaning: "จะได้รับโชคลาภจากผู้ใหญ่ หรือได้รับการอุปถัมภ์ค้ำชูจากผู้มีอำนาจ",
        twoDigit: ["19", "39", "11"],
        threeDigit: ["119", "139", "309"]
      },
      "ผี": {
        meaning: "จะหมดเคราะห์และจะได้โชคลาภ หรือมีผู้ใหญ่ให้ความช่วยเหลือ",
        twoDigit: ["66", "69", "60"],
        threeDigit: ["606", "669", "667"]
      },
      "แหวน": {
        meaning: "คนโสดจะได้พบเนื้อคู่ คนมีคู่จะได้บุตร หรือได้รับโชคลาภทางการเงิน",
        twoDigit: ["09", "19", "10"],
        threeDigit: ["109", "106", "119"]
      },
      "ไฟ": {
        meaning: "จะได้รับความเดือดร้อน หรือมีเรื่องร้อนใจ ต้องระมัดระวังคำพูด",
        twoDigit: ["04", "44", "40"],
        threeDigit: ["404", "441", "440"]
      },
      "น้ำ": {
        meaning: "จะได้รับความร่มเย็นเป็นสุข มีความเจริญก้าวหน้าในหน้าที่การงาน",
        twoDigit: ["22", "23", "29"],
        threeDigit: ["223", "229", "239"]
      }
    };

    const recordsToInsert = Object.entries(dreamDictionary).map(([keyword, data]) => ({
      keyword: keyword,
      meaning: data.meaning,
      lucky_numbers: {
        twoDigit: data.twoDigit,
        threeDigit: data.threeDigit
      }
    }));

    console.log(`📌 Found ${recordsToInsert.length} dreams. Uploading to Supabase...`);

    const { data, error } = await supabase
      .from('dreams')
      .upsert(recordsToInsert, { onConflict: 'keyword' });

    if (error) {
      throw error;
    }

    console.log('✅ Successfully seeded dreams to Supabase!');
  } catch (error) {
    console.error('❌ Error seeding dreams:', error.message);
  }
}

seedData();
