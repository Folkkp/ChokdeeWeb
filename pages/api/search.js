import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { pattern } = req.query;

    if (!pattern || pattern.length !== 6) {
      return res.status(400).json({ error: 'Please provide a valid 6-digit pattern' });
    }

    try {
      const { data, error } = await supabase
        .from('lottery_results')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        throw error;
      }

      // Log the search asynchronously (we don't need to await it to avoid slowing down response)
      supabase.from('search_logs').insert([{ pattern }]).then(({ error: logError }) => {
         if (logError) console.error('Failed to log search:', logError);
      });

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

      const regex = new RegExp(`^${pattern.replace(/_/g, '.')}$`);

      const isDigits = (str) => /^\d+$/.test(str);
      const isBlankOrZero = (str) => /^[0_]+$/.test(str);

      const last2 = pattern.slice(4);
      const first3 = pattern.slice(0, 3);
      const last3 = pattern.slice(3);

      // Search historical data for this pattern
      const matches = formattedData.filter(draw => {
        // 1. Check Two Digit prize (if pattern is ____XX or 0000XX)
        if (isDigits(last2) && isBlankOrZero(pattern.slice(0, 4))) {
           return draw.prizes.twoDigit === last2;
        }

        // 2. Check Front 3 Digits (if pattern is XXX___ or XXX000)
        if (isDigits(first3) && isBlankOrZero(pattern.slice(3))) {
           return draw.prizes.threeDigitFirst.includes(first3);
        }

        // 3. Check Last 3 Digits (if pattern is ___XXX or 000XXX)
        if (isDigits(last3) && isBlankOrZero(pattern.slice(0, 3))) {
           return draw.prizes.threeDigitLast.includes(last3);
        }

        // 4. If it's a full 6-digit number or a custom wildcard pattern, check the 1st prize
        return regex.test(draw.prizes.first);
      });

      res.status(200).json({
        pattern,
        matchCount: matches.length,
        matches: matches.map(m => ({ date: m.date, prizes: m.prizes }))
      });
    } catch (err) {
      console.error('Supabase fetch error:', err);
      res.status(500).json({ error: 'Failed to search lottery data' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
