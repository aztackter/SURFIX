import axios from 'axios';
import { extractDomain } from '../lib/utils.js';

export default {
  name: 'VidSrc',
  
  getMovie: async (tmdbId) => {
    const sources = [];
    const urls = [
      `https://vidsrc.cc/v2/embed/movie/${tmdbId}`,
      `https://vidsrc.to/embed/movie/${tmdbId}`,
      `https://vidsrc.net/embed/movie/${tmdbId}`
    ];
    
    for (const url of urls) {
      try {
        const response = await axios.head(url, {
          timeout: 5000,
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        
        if (response.status === 200) {
          sources.push({
            url: url,
            quality: '1080p',
            provider: 'VidSrc',
            type: 'iframe'
          });
        }
      } catch (error) {
        
      }
    }
    
    return sources;
  },
  
  getTv: async (tmdbId, season, episode) => {
    const sources = [];
    const urls = [
      `https://vidsrc.cc/v2/embed/tv/${tmdbId}/${season}/${episode}`,
      `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}`,
      `https://vidsrc.net/embed/tv/${tmdbId}/${season}/${episode}`
    ];
    
    for (const url of urls) {
      try {
        const response = await axios.head(url, {
          timeout: 5000,
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        
        if (response.status === 200) {
          sources.push({
            url: url,
            quality: '1080p',
            provider: 'VidSrc',
            type: 'iframe'
          });
        }
      } catch (error) {
        
      }
    }
    
    return sources;
  }
};
