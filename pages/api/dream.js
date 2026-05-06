import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { dreamText } = req.body;

    if (!dreamText) {
      return res.status(400).json({ error: 'Please provide dream text' });
    }

    try {
      // Find matching dreams using ilike for partial matching
      const { data, error } = await supabase
        .from('dreams')
        .select('*');

      if (error) {
        throw error;
      }

      const keywords = [];
      let meaningText = "";
      let twoDigit = new Set();
      let threeDigit = new Set();

      // Check against data from Supabase
      if (data) {
        for (const dream of data) {
          if (dreamText.includes(dream.keyword)) {
            keywords.push(dream.keyword);
            meaningText += `ฝันเห็น${dream.keyword}: ${dream.meaning} `;
            if (dream.lucky_numbers && dream.lucky_numbers.twoDigit) {
               dream.lucky_numbers.twoDigit.forEach(num => twoDigit.add(num));
            }
            if (dream.lucky_numbers && dream.lucky_numbers.threeDigit) {
               dream.lucky_numbers.threeDigit.forEach(num => threeDigit.add(num));
            }
          }
        }
      }

      // Fallback if no keywords found
      if (keywords.length === 0) {
        keywords.push('สิ่งลี้ลับ');
        meaningText = `ความฝันของคุณอาจบ่งบอกถึงลางสังหรณ์หรือการเปลี่ยนแปลงที่กำลังจะเกิดขึ้น`;
        
        // Random generation for fallback
        twoDigit.add(Math.floor(10 + Math.random() * 90).toString());
        twoDigit.add(Math.floor(10 + Math.random() * 90).toString());
        threeDigit.add(Math.floor(100 + Math.random() * 900).toString());
      }

      const luckyNumbers = {
        twoDigit: Array.from(twoDigit).slice(0, 4), // Limit to max 4 numbers
        threeDigit: Array.from(threeDigit).slice(0, 3) // Limit to max 3 numbers
      };

      res.status(200).json({
        keywords,
        luckyNumbers,
        meaning: meaningText.trim()
      });
    } catch (err) {
      console.error('Supabase fetch error for dreams:', err);
      res.status(500).json({ error: 'Failed to analyze dream' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

