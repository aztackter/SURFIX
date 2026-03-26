import express from 'express';
import { proxyStream, rewriteM3u8 } from '../lib/proxy.js';
import axios from 'axios';

const router = express.Router();

// FIX: Allowlist of domains the proxy is permitted to fetch.
// Without this, the endpoint acts as an open proxy for any URL.
const ALLOWED_DOMAINS = [
  'vidsrc.cc',
  'vidsrc.to',
  'vidsrc.net',
  'vixsrc.net',
  'vidrock.pm',
  'uembed.net',
  'rgshows.me',
  'vidzee.net',
  '2embed.cc',
  '02moviedownloader.com'
];

function isDomainAllowed(url) {
  try {
    const { hostname } = new URL(url);
    // Allow exact match or any subdomain
    return ALLOWED_DOMAINS.some(
      domain => hostname === domain || hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}

router.get('/', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  const decodedUrl = decodeURIComponent(url);

  // FIX: Reject requests for disallowed domains
  if (!isDomainAllowed(decodedUrl)) {
    return res.status(403).json({ error: 'Domain not allowed' });
  }

  if (decodedUrl.includes('.m3u8')) {
    try {
      const response = await axios.get(decodedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      // FIX: Pass req so rewriteM3u8 can build an absolute proxy URL
      const rewritten = await rewriteM3u8(response.data, decodedUrl, req);

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
