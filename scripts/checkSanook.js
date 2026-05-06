const axios = require('axios');
const cheerio = require('cheerio');

axios.get('https://news.sanook.com/lotto/archive/page/1/').then(r => {
  const $ = cheerio.load(r.data);
  const elements = $('.archive--lotto');
  console.log(`Found ${elements.length} elements with .archive--lotto`);
  
  if (elements.length === 0) {
    // try to find other classes
    console.log("Checking other classes...");
    console.log("div.box-cell:", $('div.box-cell').length);
    console.log("div.archive-lotto:", $('div.archive-lotto').length);
    console.log("article:", $('article').length);
  } else {
    console.log("First element HTML:", $(elements[0]).html());
  }
}).catch(console.error);
