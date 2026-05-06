import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const url = 'https://www.sanook.com/news/tag/%E0%B8%82%E0%B9%88%E0%B8%B2%E0%B8%A7%E0%B8%AB%E0%B8%A7%E0%B8%A2/';
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      });

      const $ = cheerio.load(response.data);
      const newsItems = [];

      // Find news articles on Sanook tag page
      // Normally they use articles or list items with specific classes.
      // We'll target typical elements. This might need adjustment based on Sanook's actual DOM.
      $('.PostListings_entry__iXaq_').each((i, el) => {
        if (newsItems.length >= 3) return; // Only 3 items
        
        const linkEl = $(el).find('a').first();
        const url = linkEl.attr('href');
        const title = $(el).find('.PostListings_title__dYjR4, h3, h4').text().trim();
        const img = $(el).find('img').attr('src');

        if (title && url && !url.includes('tag')) {
          newsItems.push({
            title,
            url: url.startsWith('http') ? url : `https://www.sanook.com${url}`,
            image: img || 'https://images.unsplash.com/photo-1533052402123-1d0bc8e56064?q=80&w=600'
          });
        }
      });

      // Fallback selector if the above didn't find anything
      if (newsItems.length === 0) {
         $('.PostList_wrapper__N_v_N article, .EntryList_wrapper__iXaq_ article, article').each((i, el) => {
            if (newsItems.length >= 3) return;
            const linkEl = $(el).find('a').first();
            const url = linkEl.attr('href');
            let title = linkEl.attr('title') || $(el).find('h3, h2').text().trim() || linkEl.text().trim();
            const img = $(el).find('img').attr('src') || $(el).find('img').attr('data-src');

            if (title && url && !url.includes('tag') && title.length > 10) {
              newsItems.push({
                title,
                url: url.startsWith('http') ? url : `https://www.sanook.com${url}`,
                image: img || 'https://images.unsplash.com/photo-1533052402123-1d0bc8e56064?q=80&w=600'
              });
            }
         });
      }

      // Final fallback if absolutely nothing was found
      if (newsItems.length === 0) {
        newsItems.push(
          { title: "ตรวจสลากกินแบ่งรัฐบาล ตรวจหวย งวดล่าสุด", url: "https://news.sanook.com/lotto/", image: "https://images.unsplash.com/photo-1533052402123-1d0bc8e56064?q=80&w=600" },
          { title: "รวมสถิติหวยออกวันศุกร์ ย้อนหลัง", url: "https://news.sanook.com/lotto/", image: "https://images.unsplash.com/photo-1543333995-a78aea2efa50?q=80&w=300" },
          { title: "ทำนายฝันแม่นๆ ตีเลขเด็ด", url: "https://news.sanook.com/lotto/", image: "https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?q=80&w=300" }
        );
      }

      res.status(200).json(newsItems.slice(0, 3));
    } catch (error) {

      console.error('Failed to fetch news:', error.message);
      res.status(500).json({ error: 'Failed to fetch news' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
