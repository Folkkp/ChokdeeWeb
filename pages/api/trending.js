import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Fetch recent searches
      const { data, error } = await supabase
        .from('search_logs')
        .select('pattern')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) {
        throw error;
      }

      // Group by frequency in memory
      const freq = {};
      data.forEach((row) => {
        const num = row.pattern.replace(/_/g, ''); // Remove underscores
        if (num) { // Skip if it's completely empty
           freq[num] = (freq[num] || 0) + 1;
        }
      });

      const sorted = Object.entries(freq)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      res.status(200).json(sorted);
    } catch (err) {
      console.error('Supabase fetch error for trending:', err);
      res.status(200).json([]);
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
