import express from 'express';
import { scrapeMovie } from '../lib/scraper.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: 'TMDB ID is required' });
  }
  
  try {
    const sources = await scrapeMovie(id);
    res.json({
      success: true,
      tmdbId: id,
      sources: sources,
      count: sources.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sources', message: error.message });
  }
});

export default router;
