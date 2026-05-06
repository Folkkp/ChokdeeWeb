const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

async function scrapeSanookLotto() {
  const allResults = [];
  let id = 100;
  
  try {
    // 5 pages * ~20 results per page = 100 results
    for (let page = 1; page <= 5; page++) {
      console.log(`Scraping page ${page}...`);
      const { data } = await axios.get(`https://news.sanook.com/lotto/archive/page/${page}/`);
      const $ = cheerio.load(data);
      
      $('.archive--lotto').each((i, el) => {
        if (allResults.length >= 100) return;
        
        const dateRaw = $(el).find('.archive--lotto__head-lot').text().trim();
        if (!dateRaw) return; // skip header or empty ones

        const date = dateRaw.replace('ตรวจสลากกินแบ่งรัฐบาล', '').replace('ตรวจหวย', '').trim();
        
        const listItems = $(el).find('.archive--lotto__result-list li');
        
        if (listItems.length >= 4) {
          const first = $(listItems[0]).find('.archive--lotto__result-number').text().trim();
          
          const threeDigitFirst = [];
          $(listItems[1]).find('span').each((j, span) => threeDigitFirst.push($(span).text().trim()));
          
          const threeDigitLast = [];
          $(listItems[2]).find('span').each((j, span) => threeDigitLast.push($(span).text().trim()));
          
          const twoDigit = $(listItems[3]).find('.archive--lotto__result-number').text().trim();

          // Only push if it's not empty "xxxxxx" which means not yet drawn
          if (first && first !== 'xxxxxx' && !first.includes('x')) {
            allResults.push({
              id: id--,
              date: date,
              prizes: {
                first: first,
                twoDigit: twoDigit,
                threeDigitFirst: threeDigitFirst.length ? threeDigitFirst : ['---', '---'],
                threeDigitLast: threeDigitLast.length ? threeDigitLast : ['---', '---']
              }
            });
          }
        }
      });
    }
    
    fs.writeFileSync(path.join(__dirname, '../lib/realData.json'), JSON.stringify(allResults, null, 2));
    console.log(`Successfully scraped ${allResults.length} real historical results.`);
  } catch (error) {
    console.error("Error scraping data", error.message);
  }
}

scrapeSanookLotto();
