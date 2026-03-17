// Based on real embed patterns from working sources [citation:1][citation:4][citation:6]
const embedProviders = [
  {
    name: 'VidSrc',
    baseUrl: 'https://vidsrc.cc',
    patterns: {
      movie: 'https://vidsrc.cc/v2/embed/movie/{imdb_id}?poster=true&autoPlay=false',
      tv: 'https://vidsrc.cc/v2/embed/tv/{imdb_id}/{season}/{episode}?poster=true&autoPlay=false'
    },
    enabled: true,
    priority: 1
  },
  {
    name: '2Embed',
    baseUrl: 'https://2embed.cc',
    patterns: {
      movie: 'https://2embed.cc/embed/{imdb_id}',
      tv: 'https://2embed.cc/embed/{imdb_id}/{season}/{episode}'
    },
    enabled: true,
    priority: 2
  },
  {
    name: 'VidSrc.to',
    baseUrl: 'https://vidsrc.to',
    patterns: {
      movie: 'https://vidsrc.to/embed/movie/{imdb_id}',
      tv: 'https://vidsrc.to/embed/tv/{imdb_id}/{season}/{episode}'
    },
    enabled: true,
    priority: 3
  },
  {
    name: 'SuperEmbed',
    baseUrl: 'https://multiembed.mov',
    patterns: {
      movie: 'https://multiembed.mov/?video_id={imdb_id}',
      tv: 'https://multiembed.mov/?video_id={imdb_id}&s={season}&e={episode}'
    },
    enabled: true,
    priority: 4
  },
  {
    name: 'Gomo',
    baseUrl: 'https://gomo.to',
    patterns: {
      movie: 'https://gomo.to/movie/{imdb_id}',
      tv: 'https://gomo.to/tv/{imdb_id}/{season}/{episode}'
    },
    enabled: true,
    priority: 5
  },
  {
    name: 'MoviesAPI',
    baseUrl: 'https://moviesapi.club',
    patterns: {
      movie: 'https://moviesapi.club/movie/{imdb_id}',
      tv: 'https://moviesapi.club/tv/{imdb_id}/{season}/{episode}'
    },
    enabled: true,
    priority: 6
  },
  {
    name: 'AutoEmbed',
    baseUrl: 'https://autoembed.cc',
    patterns: {
      movie: 'https://autoembed.cc/embed/movie/{imdb_id}',
      tv: 'https://autoembed.cc/embed/tv/{imdb_id}/{season}/{episode}'
    },
    enabled: true,
    priority: 7
  }
];

// Additional providers from TMDB-Embed-API [citation:4]
const advancedProviders = [
  {
    name: '4KHDHub',
    baseUrl: 'https://4khdhub.me',
    patterns: {
      movie: 'https://4khdhub.me/embed/{imdb_id}',
    },
    enabled: true,
    quality: '4K'
  },
  {
    name: 'MoviesMod',
    baseUrl: 'https://moviesmod.ws',
    patterns: {
      movie: 'https://moviesmod.ws/embed/{imdb_id}',
    },
    enabled: true,
    quality: '1080p'
  },
  {
    name: 'MP4Hydra',
    baseUrl: 'https://mp4hydra.top',
    patterns: {
      movie: 'https://mp4hydra.top/embed/{imdb_id}',
    },
    enabled: true
  },
  {
    name: 'VidZee',
    baseUrl: 'https://vidzee.net',
    patterns: {
      movie: 'https://vidzee.net/embed/{imdb_id}',
    },
    enabled: true
  }
];

module.exports = { embedProviders, advancedProviders };
