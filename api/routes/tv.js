import express from 'express';
import { scrapeTv } from '../lib/scraper.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { id, season, episode } = req.query;
  
  if (!id || !season || !episode) {
    return res.status(400).json({ error: 'TMDB ID, season, and episode are required' });
  }
  
  try {
    const sources = await scrapeTv(id, season, episode);
    res.json({
      success: true,
      tmdbId: id,
      season: season,
      episode: episode,
      sources: sources,
      count: sources.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sources', message: error.message });
  }
});

export default router;
