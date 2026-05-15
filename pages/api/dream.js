import { supabase } from '../../lib/supabase';

const thaiWordSegmenter =
  typeof Intl !== 'undefined' && Intl.Segmenter
    ? new Intl.Segmenter('th', { granularity: 'word' })
    : null;

function normalizeText(text) {
  return String(text || '')
    .normalize('NFC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function getWordSegments(text) {
  const normalizedText = normalizeText(text);

  if (!thaiWordSegmenter) {
    return normalizedText
      .split(/\s+/)
      .filter(Boolean)
      .map((segment, index) => ({
        segment,
        index,
        end: index + segment.length,
      }));
  }

  return [...thaiWordSegmenter.segment(normalizedText)]
    .filter((part) => part.isWordLike && part.segment.trim())
    .map((part) => ({
      segment: part.segment,
      index: part.index,
      end: part.index + part.segment.length,
    }));
}

function getKeywordSegments(keyword) {
  return getWordSegments(keyword).map((part) => part.segment);
}

function createDreamMatches(dreamText, dreams) {
  const normalizedDreamText = normalizeText(dreamText);
  const dreamSegments = getWordSegments(normalizedDreamText);

  const candidates = [];

  for (const dream of dreams || []) {
    const keyword = normalizeText(dream.keyword);
    const keywordSegments = getKeywordSegments(keyword);

    if (!keyword || keywordSegments.length === 0) {
      continue;
    }

    for (let i = 0; i <= dreamSegments.length - keywordSegments.length; i += 1) {
      const isMatch = keywordSegments.every(
        (segment, offset) => dreamSegments[i + offset].segment === segment
      );

      if (!isMatch) {
        continue;
      }

      const start = dreamSegments[i].index;
      const end = dreamSegments[i + keywordSegments.length - 1].end;

      candidates.push({
        dream,
        keyword,
        start,
        end,
        score: end - start,
      });
    }
  }

  candidates.sort((a, b) => a.start - b.start || b.score - a.score);

  const selectedMatches = [];
  const usedRanges = [];

  for (const candidate of candidates) {
    const overlaps = usedRanges.some(
      (range) => candidate.start < range.end && candidate.end > range.start
    );

    if (overlaps) {
      continue;
    }

    selectedMatches.push(candidate);
    usedRanges.push({ start: candidate.start, end: candidate.end });
  }

  return selectedMatches.sort((a, b) => a.start - b.start);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { dreamText } = req.body;

  if (!dreamText || !normalizeText(dreamText)) {
    return res.status(400).json({ error: 'Please provide dream text' });
  }

  try {
    const { data, error } = await supabase.from('dreams').select('*');
    const normalizedDreamText = normalizeText(dreamText);

    if (error) {
      throw error;
    }

    const matches = createDreamMatches(normalizedDreamText, data);
    const keywords = [];
    const interpretations = [];
    const twoDigit = new Set();
    const threeDigit = new Set();
    let meaningText = '';

    for (const match of matches) {
      const dream = match.dream;

      keywords.push(dream.keyword);
      interpretations.push({
        keyword: dream.keyword,
        meaning: dream.meaning,
      });
      meaningText += `ฝันเห็น${dream.keyword}: ${dream.meaning} `;

      if (dream.lucky_numbers?.twoDigit) {
        dream.lucky_numbers.twoDigit.forEach((num) => twoDigit.add(num));
      }

      if (dream.lucky_numbers?.threeDigit) {
        dream.lucky_numbers.threeDigit.forEach((num) => threeDigit.add(num));
      }
    }

    if (keywords.length === 0) {
      keywords.push('สิ่งลี้ลับ');
      meaningText =
        'ความฝันของคุณอาจบ่งบอกถึงลางสังหรณ์หรือการเปลี่ยนแปลงที่กำลังจะเกิดขึ้น';
      interpretations.push({
        keyword: 'สิ่งลี้ลับ',
        meaning: meaningText,
      });

      twoDigit.add(Math.floor(10 + Math.random() * 90).toString());
      twoDigit.add(Math.floor(10 + Math.random() * 90).toString());
      threeDigit.add(Math.floor(100 + Math.random() * 900).toString());
    }

    return res.status(200).json({
      keywords,
      dreamText: normalizedDreamText,
      interpretations,
      luckyNumbers: {
        twoDigit: Array.from(twoDigit).slice(0, 4),
        threeDigit: Array.from(threeDigit).slice(0, 3),
      },
      meaning: meaningText.trim(),
    });
  } catch (err) {
    console.error('Supabase fetch error for dreams:', err);
    return res.status(500).json({ error: 'Failed to analyze dream' });
  }
}
