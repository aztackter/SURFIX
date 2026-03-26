export function extractDomain(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return null;
  }
}

export function sortByQuality(sources) {
  const qualityOrder = {
    '4k': 5,
    '2160p': 5,
    '1080p': 4,
    'hd': 3,
    '720p': 2,
    'sd': 1,
    '360p': 0
  };

  return sources.sort((a, b) => {
    const aQuality = (a.quality || '').toLowerCase();
    const bQuality = (b.quality || '').toLowerCase();
    const aScore = qualityOrder[aQuality] || 0;
    const bScore = qualityOrder[bQuality] || 0;
    return bScore - aScore;
  });
}

export function deduplicateSources(sources) {
  const seen = new Map();
  return sources.filter(source => {
    const key = source.url;
    if (seen.has(key)) return false;
    seen.set(key, true);
    return true;
  });
}

export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
