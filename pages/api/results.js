import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Fetch 100 most recent draws ordered by id descending (latest first)
      const { data, error } = await supabase
        .from('lottery_results')
        .select('*')
        .order('id', { ascending: false })
        .limit(100);

      if (error) {
        throw error;
      }

      // Map back to the structure the frontend expects
      const formattedData = data.map(draw => ({
        id: draw.id,
        date: draw.date,
        prizes: {
          first: draw.first_prize,
          twoDigit: draw.two_digit,
          threeDigitFirst: draw.three_digit_first,
          threeDigitLast: draw.three_digit_last
        }
      }));

      res.status(200).json({
        latest: formattedData[0] || null,
        historical: formattedData
      });
    } catch (err) {
      console.error('Supabase fetch error:', err);
      res.status(500).json({ error: 'Failed to fetch lottery data' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
