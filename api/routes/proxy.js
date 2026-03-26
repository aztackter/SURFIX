import express from 'express';
import { proxyStream, rewriteM3u8 } from '../lib/proxy.js';
import axios from 'axios';

const router = express.Router();

router.get('/', async (req, res) => {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }
  
  const decodedUrl = decodeURIComponent(url);
  
  if (decodedUrl.includes('.m3u8')) {
    try {
      const response = await axios.get(decodedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const proxyBase = `/api/proxy`;
      const rewritten = await rewriteM3u8(response.data, decodedUrl, proxyBase);
      
      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
      res.send(rewritten);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch m3u8' });
    }
  } else {
    await proxyStream(decodedUrl, req, res);
  }
});

export default router;
