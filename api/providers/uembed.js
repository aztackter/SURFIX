import axios from 'axios';

export default {
  name: 'Uembed',
  
  getMovie: async (tmdbId) => {
    const sources = [];
    const url = `https://uembed.net/embed/movie/${tmdbId}`;
    
    try {
      const response = await axios.head(url, {
        timeout: 5000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      
      if (response.status === 200) {
        sources.push({
          url: url,
          quality: 'HD',
          provider: 'Uembed',
          type: 'iframe'
        });
      }
    } catch (error) {
      
    }
    
    return sources;
  },
  
  getTv: async (tmdbId, season, episode) => {
    const sources = [];
    const url = `https://uembed.net/embed/tv/${tmdbId}/${season}/${episode}`;
    
    try {
      const response = await axios.head(url, {
        timeout: 5000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      
      if (response.status === 200) {
        sources.push({
          url: url,
          quality: 'HD',
          provider: 'Uembed',
          type: 'iframe'
        });
      }
    } catch (error) {
      
    }
    
    return sources;
  }
};
