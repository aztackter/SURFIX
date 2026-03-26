import providers from '../providers/index.js';
import { sortByQuality, deduplicateSources } from './utils.js';

export async function scrapeMovie(tmdbId) {
  const results = [];

  const promises = providers.map(async (provider) => {
    try {
      const sources = await provider.getMovie(tmdbId);
      if (sources && sources.length > 0) {
        results.push(...sources);
      }
    } catch (error) {
      console.error(`Provider ${provider.name} failed:`, error.message);
    }
  });

  await Promise.allSettled(promises);

  const unique = deduplicateSources(results);
  return sortByQuality(unique);
}

export async function scrapeTv(tmdbId, season, episode) {
  const results = [];

  const promises = providers.map(async (provider) => {
    try {
      const sources = await provider.getTv(tmdbId, season, episode);
      if (sources && sources.length > 0) {
        results.push(...sources);
      }
    } catch (error) {
      console.error(`Provider ${provider.name} failed:`, error.message);
    }
  });

  await Promise.allSettled(promises);

  const unique = deduplicateSources(results);
  return sortByQuality(unique);
}
