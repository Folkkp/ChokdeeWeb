import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Normalize a Thai date string to remove extra whitespace and special chars
 * e.g. " 16 เมษายน 2569 " -> "16 เมษายน 2569"
 */
export function normalizeDate(dateStr) {
  if (!dateStr) return '';
  return dateStr
    .replace(/ตรวจสลากกินแบ่งรัฐบาล/g, '')
    .replace(/ตรวจหวย/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Scrape a single page from Sanook lotto archive.
 * Returns an array of draw objects.
 */
async function scrapePage(page) {
  const url = `https://news.sanook.com/lotto/archive/page/${page}/`;
  const { data } = await axios.get(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
    timeout: 15000,
  });

  const $ = cheerio.load(data);
  const results = [];

  $('.archive--lotto').each((i, el) => {
    const dateRaw = $(el).find('.archive--lotto__head-lot').text().trim();
    if (!dateRaw) return;

    const date = normalizeDate(dateRaw);
    const listItems = $(el).find('.archive--lotto__result-list li');

    if (listItems.length >= 4) {
      const first = $(listItems[0]).find('.archive--lotto__result-number').text().trim();

      const threeDigitFirst = [];
      $(listItems[1]).find('span').each((j, span) => threeDigitFirst.push($(span).text().trim()));

      const threeDigitLast = [];
      $(listItems[2]).find('span').each((j, span) => threeDigitLast.push($(span).text().trim()));

      const twoDigit = $(listItems[3]).find('.archive--lotto__result-number').text().trim();

      // Skip draws that haven't happened yet
      if (first && first !== 'xxxxxx' && !first.includes('x')) {
        results.push({
          date,
          prizes: {
            first,
            twoDigit,
            threeDigitFirst: threeDigitFirst.length ? threeDigitFirst : ['---', '---'],
            threeDigitLast: threeDigitLast.length ? threeDigitLast : ['---', '---'],
          },
        });
      }
    }
  });

  return results;
}

/**
 * Scrape only the latest draw (page 1, first result).
 * Returns a single draw object or null.
 */
export async function scrapeLatestDraw() {
  const page1 = await scrapePage(1);
  return page1.length > 0 ? page1[0] : null;
}

/**
 * Scrape all draws across N pages (default 5 = ~100 draws).
 * Returns array of draw objects newest first.
 */
export async function scrapeAllDraws(pages = 5) {
  const allResults = [];
  for (let page = 1; page <= pages; page++) {
    try {
      const pageResults = await scrapePage(page);
      allResults.push(...pageResults);
      if (allResults.length >= 100) break;
    } catch (err) {
      console.error(`[scraper] Failed to scrape page ${page}:`, err.message);
    }
  }
  return allResults.slice(0, 100);
}
