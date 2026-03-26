import axios from 'axios';

export async function proxyStream(url, req, res) {
  try {
    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': new URL(url).origin
      }
    });

    res.setHeader('Content-Type', response.headers['content-type'] || 'application/octet-stream');
    res.setHeader('Access-Control-Allow-Origin', '*');

    response.data.pipe(res);
  } catch (error) {
    res.status(500).json({ error: 'Proxy failed', message: error.message });
  }
}

// FIX: Accept req so we can build an absolute proxyBase URL.
// The old code used a relative path (/api/proxy), which browsers resolved
// against the frontend origin (port 3000) instead of the API (port 3001),
// breaking HLS segment fetching entirely.
export async function rewriteM3u8(content, baseUrl, req) {
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const proxyBase = `${protocol}://${host}/api/proxy`;

  const lines = content.split('\n');
  const rewritten = lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return line;

    const absolute = trimmed.startsWith('http')
      ? trimmed
      : new URL(trimmed, baseUrl).href;

    return `${proxyBase}?url=${encodeURIComponent(absolute)}`;
  });

  return rewritten.join('\n');
}
