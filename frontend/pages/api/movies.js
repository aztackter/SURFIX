import { MongoClient } from 'mongodb';

// MongoDB connection URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

// SSL/TLS options to fix handshake errors
const MONGODB_OPTIONS = {
  // SSL/TLS settings
  tls: true,
  tlsAllowInvalidCertificates: true,
  tlsAllowInvalidHostnames: true,
  
  // Timeout settings
  serverSelectionTimeoutMS: 30000,
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  
  // Retry settings
  retryWrites: true,
  retryReads: true,
  
  // Connection pool settings
  maxPoolSize: 10,
  minPoolSize: 2,
  maxIdleTimeMS: 30000,
  
  // Heartbeat settings
  heartbeatFrequencyMS: 10000,
  
  // Use new URL parser
  useNewUrlParser: true,
  useUnifiedTopology: true
};

// Cache the database connection
let cachedClient = null;
let cachedDb = null;

/**
 * Connect to MongoDB with connection pooling
 */
async function connectToDatabase() {
  // If we have a cached connection that's alive, use it
  if (cachedClient && cachedDb) {
    try {
      await cachedClient.db().admin().ping();
      return { client: cachedClient, db: cachedDb };
    } catch (error) {
      // Connection is dead, create new one
      cachedClient = null;
      cachedDb = null;
    }
  }

  // Check if MongoDB URI exists
  if (!MONGODB_URI) {
    throw new Error('MongoDB URI is not defined in environment variables');
  }

  // Validate URI format
  if (!MONGODB_URI.startsWith('mongodb://') && !MONGODB_URI.startsWith('mongodb+srv://')) {
    throw new Error('Invalid MongoDB URI scheme. Must start with mongodb:// or mongodb+srv://');
  }

  // Parse database name from URI or use default
  let dbName = 'sample_mflix';
  try {
    const match = MONGODB_URI.match(/\/([^/?]+)(\?|$)/);
    if (match && match[1]) {
      dbName = match[1];
    }
  } catch (error) {
    // Use default database name
  }

  // Create new connection
  const client = new MongoClient(MONGODB_URI, MONGODB_OPTIONS);
  await client.connect();
  
  // Test the connection
  await client.db().admin().ping();
  
  const db = client.db(dbName);
  
  // Cache the connection
  cachedClient = client;
  cachedDb = db;
  
  return { client, db };
}

/**
 * Get rating color class for UI
 */
function getRatingColorClass(rating) {
  if (!rating && rating !== 0) return 'default';
  if (rating >= 8) return 'excellent';
  if (rating >= 7) return 'good';
  if (rating >= 5) return 'average';
  return 'poor';
}

/**
 * Format votes with K/M suffix
 */
function formatVotes(votes) {
  if (!votes) return '0';
  
  const numVotes = parseInt(votes.toString().replace(/,/g, ''));
  if (isNaN(numVotes)) return '0';
  
  if (numVotes > 1000000) {
    return (numVotes / 1000000).toFixed(1) + 'M';
  } else if (numVotes > 1000) {
    return (numVotes / 1000).toFixed(1) + 'K';
  }
  return numVotes.toString();
}

/**
 * Format movie data consistently
 */
function formatMovieData(movie) {
  try {
    // Handle both MongoDB _id and string id
    const id = movie._id ? movie._id.toString() : movie.id || movie._id;
    
    // Get rating from various possible locations
    let rating = 0;
    if (movie.imdb?.rating) rating = parseFloat(movie.imdb.rating);
    else if (movie.vote_average) rating = parseFloat(movie.vote_average);
    else if (movie.rating) rating = parseFloat(movie.rating);
    
    // Get votes
    let votes = '0';
    if (movie.imdb?.votes) {
      votes = movie.imdb.votes.toString();
    } else if (movie.vote_count) {
      votes = movie.vote_count.toString();
    } else if (movie.votes) {
      votes = movie.votes.toString();
    }
    
    // Format poster URL
    let poster = movie.poster || null;
    if (poster && typeof poster === 'string') {
      if (poster.startsWith('/')) {
        poster = `https://image.tmdb.org/t/p/w500${poster}`;
      } else if (!poster.startsWith('http')) {
        poster = null;
      }
    }
    
    // Format backdrop URL
    let backdrop = movie.backdrop || movie.backdrop_path || null;
    if (backdrop && typeof backdrop === 'string') {
      if (backdrop.startsWith('/')) {
        backdrop = `https://image.tmdb.org/t/p/original${backdrop}`;
      } else if (!backdrop.startsWith('http')) {
        backdrop = null;
      }
    }
    
    // Get overview
    const overview = movie.fullplot || movie.plot || movie.overview || 'No description available';
    
    // Get year
    let year = 'Unknown';
    if (movie.year) {
      year = movie.year.toString();
    } else if (movie.released) {
      try {
        year = new Date(movie.released).getFullYear().toString();
      } catch (e) {
        // Ignore date parsing errors
      }
    } else if (movie.release_date) {
      try {
        year = new Date(movie.release_date).getFullYear().toString();
      } catch (e) {
        // Ignore date parsing errors
      }
    }
    
    // Get genres (limit to first 3)
    const genres = Array.isArray(movie.genres) ? movie.genres.slice(0, 3) : [];
    
    // Get directors (limit to first 3)
    const directors = Array.isArray(movie.directors) ? movie.directors.slice(0, 3) : [];
    
    // Get cast (limit to first 5)
    const cast = Array.isArray(movie.cast) ? movie.cast.slice(0, 5) : [];
    
    return {
      _id: id,
      id: id,
      title: movie.title || 'Untitled',
      year: year,
      rating: rating || 0,
      ratingColor: getRatingColorClass(rating || 0),
      votes: formatVotes(votes),
      poster: poster || 'https://placehold.co/300x450/1a1a1a/ffffff?text=No+Poster',
      posterFallback: 'https://placehold.co/300x450/1a1a1a/ffffff?text=No+Poster',
      backdrop: backdrop,
      overview: overview,
      imdbId: movie.imdb?.id || movie.imdbId || '',
      genres: genres,
      runtime: movie.runtime || 0,
      released: movie.released || null,
      directors: directors,
      cast: cast,
      type: movie.type || 'movie',
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error formatting movie:', error);
    return null;
  }
}

/**
 * Build MongoDB query from filters
 */
function buildQuery(filters) {
  const query = {};
  
  // Default to movies only
  query.type = 'movie';
  
  // Add genre filter
  if (filters.genre) {
    query.genres = { $in: [filters.genre] };
  }
  
  // Add year filter
  if (filters.year) {
    const yearNum = parseInt(filters.year);
    if (!isNaN(yearNum)) {
      query.year = yearNum;
    }
  }
  
  // Add search filter
  if (filters.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: 'i' } },
      { plot: { $regex: filters.search, $options: 'i' } },
      { fullplot: { $regex: filters.search, $options: 'i' } }
    ];
  }
  
  return query;
}

/**
 * Build sort options from sort parameter
 */
function buildSort(sort) {
  switch (sort) {
    case 'latest':
      return { year: -1, released: -1 };
    case 'oldest':
      return { year: 1 };
    case 'rating':
      return { 'imdb.rating': -1 };
    case 'title':
      return { title: 1 };
    default:
      return { year: -1 };
  }
}

/**
 * Main API handler
 */
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed'
    });
  }

  // Get query parameters
  const { 
    page = 1, 
    limit = 20, 
    genre, 
    year, 
    sort = 'latest',
    search 
  } = req.query;

  // Validate pagination
  const pageNum = parseInt(page);
  const limitNum = Math.min(parseInt(limit), 50);
  
  if (isNaN(pageNum) || pageNum < 1) {
    return res.status(400).json({ 
      success: false,
      error: 'Invalid page parameter' 
    });
  }
  
  if (isNaN(limitNum) || limitNum < 1) {
    return res.status(400).json({ 
      success: false,
      error: 'Invalid limit parameter' 
    });
  }

  const skip = (pageNum - 1) * limitNum;

  try {
    // Connect to database
    const { db } = await connectToDatabase();
    
    // Get the movies collection
    const moviesCollection = db.collection('movies');
    
    // Build query and sort
    const query = buildQuery({ genre, year, search });
    const sortOption = buildSort(sort);
    
    // Get total count for pagination
    const totalCount = await moviesCollection.countDocuments(query);
    
    // If no movies, return empty array
    if (totalCount === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalCount: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false
        }
      });
    }
    
    // Execute query
    const movies = await moviesCollection
      .find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .toArray();
    
    // Format movies
    const formattedMovies = movies
      .map(formatMovieData)
      .filter(movie => movie !== null);
    
    // Calculate pagination
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;
    
    // Return successful response
    return res.status(200).json({
      success: true,
      data: formattedMovies,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage
      },
      filters: {
        genre: genre || null,
        year: year || null,
        sort,
        search: search || null
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Database error:', error);
    
    // Return appropriate error response
    const statusCode = error.name === 'MongoNetworkError' ? 503 : 500;
    
    return res.status(statusCode).json({
      success: false,
      error: 'Failed to fetch movies',
      message: error.message
    });
  }
}
