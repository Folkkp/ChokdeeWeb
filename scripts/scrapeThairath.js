require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const cheerio = require('cheerio');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ ไม่พบ Supabase Config ในไฟล์ .env.local โปรดตั้งค่าก่อนรันสคริปต์นี้');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function scrapeAndSave() {
  try {
    console.log('🌐 กำลังดึงข้อมูลจาก Thairath...');
    const url = 'https://www.thairath.co.th/horoscope/dream';
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const $ = cheerio.load(res.data);
    const keywordsSet = new Set();
    const dreamsData = [];

    // ดึงลิงก์ทั้งหมดที่เกี่ยวกับทำนายฝัน
    const links = $('a').toArray();
    
    for (let el of links) {
      const text = $(el).text().trim();
      const href = $(el).attr('href');
      
      // กรองเอาเฉพาะลิงก์ที่ขึ้นต้นด้วย "ฝัน"
      if (text.startsWith('ฝัน') && text.length < 30 && href) {
        let fullUrl = href;
        if (!fullUrl.startsWith('http')) {
          fullUrl = 'https://www.thairath.co.th' + fullUrl;
        }

        if (!keywordsSet.has(text)) {
          keywordsSet.add(text);
          dreamsData.push({ keyword: text, url: fullUrl });
        }
      }
    }

    console.log(`📌 พบคำทำนายฝันทั้งหมด ${dreamsData.length} คำ เริ่มทำการดึงความหมาย...`);

    let successCount = 0;

    for (let i = 0; i < dreamsData.length; i++) {
      const { keyword, url } = dreamsData[i];
      try {
        console.log(`[${i + 1}/${dreamsData.length}] กำลังดึงข้อมูล: ${keyword}`);
        const articleRes = await axios.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0'
          }
        });
        const article$ = cheerio.load(articleRes.data);
        
        // ดึงความหมายจาก meta description หรือพารากราฟแรก
        let meaning = article$('meta[name="description"]').attr('content') || article$('p').first().text();
        
        // สุ่มเลขเด็ดง่ายๆ (เนื่องจากไทยรัฐไม่ได้เขียนเลขเด็ดในรูปแบบที่ดึงได้ง่ายเสมอไป)
        const luckyNumbers = {
          twoDigit: [
            Math.floor(Math.random() * 100).toString().padStart(2, '0'),
            Math.floor(Math.random() * 100).toString().padStart(2, '0')
          ],
          threeDigit: [
            Math.floor(Math.random() * 1000).toString().padStart(3, '0')
          ]
        };

        if (meaning) {
          // บันทึกลง Supabase (ใช้ upsert เผื่อมีข้อมูลเดิมอยู่แล้ว)
          const { error } = await supabase
            .from('dreams')
            .upsert({
               keyword: keyword,
               meaning: meaning,
               lucky_numbers: luckyNumbers
            }, { onConflict: 'keyword' });

          if (error) throw error;
          successCount++;
        }
        
        // หน่วงเวลาเล็กน้อยเพื่อป้องกันการโดนบล็อก
        await new Promise(r => setTimeout(r, 1000));
        
      } catch (err) {
        console.log(`❌ ดึงข้อมูล ${keyword} ไม่สำเร็จ: ${err.message}`);
      }
    }

    console.log(`🎉 ดึงข้อมูลและบันทึกลง Supabase สำเร็จ ${successCount} รายการ!`);
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
  } finally {
    process.exit(0);
  }
}

scrapeAndSave();
