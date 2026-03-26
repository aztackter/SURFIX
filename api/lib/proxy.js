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
    
    res.setHeader('Content-Type', response.headers['content-type']);
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    response.data.pipe(res);
  } catch (error) {
    res.status(500).json({ error: 'Proxy failed', message: error.message });
  }
}

export async function rewriteM3u8(content, baseUrl, proxyBase) {
  const lines = content.split('\n');
  const rewritten = lines.map(line => {
    if (line.trim() && !line.startsWith('#') && !line.startsWith('http')) {
      const absolute = new URL(line, baseUrl).href;
      return `${proxyBase}?url=${encodeURIComponent(absolute)}`;
    }
    if (line.trim() && line.startsWith('http')) {
      return `${proxyBase}?url=${encodeURIComponent(line)}`;
    }
    return line;
  });
  
  return rewritten.join('\n');
}
