import { MongoClient } from 'mongodb';

// MongoDB connection URI from Railway environment variables
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URL;

// Cache the database connection to prevent multiple connections
let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  // If we have cached connection, use it
  if (cachedClient && cachedDb) {
    console.log('Using cached database connection');
    return { client: cachedClient, db: cachedDb };
  }

  // Check if MongoDB URI exists
  if (!MONGODB_URI) {
    throw new Error('MongoDB URI is not defined in environment variables');
  }

  console.log('Creating new database connection...');
  
  // Connection options for better performance and reliability
  const options = {
    maxPoolSize: 10, // Maximum number of connections in the pool
    minPoolSize: 2,  // Minimum number of connections to maintain
    maxIdleTimeMS: 30000, // Close idle connections after 30 seconds
    connectTimeoutMS: 10000, // Timeout after 10 seconds if can't connect
    socketTimeoutMS: 45000, // Socket timeout after 45 seconds
    retryWrites: true,
    retryReads: true,
  };

  // Create new connection
  const client = new MongoClient(MONGODB_URI, options);
  await client.connect();
  
  // Extract database name from URI or use default
  const dbName = extractDatabaseName(MONGODB_URI) || 'railway';
  const db = client.db(dbName);
  
  // Cache the connection
  cachedClient = client;
  cachedDb = db;
  
  console.log(`Connected to database: ${dbName}`);
  return { client, db };
}

// Helper function to extract database name from MongoDB URI
function extractDatabaseName(uri) {
  try {
    // MongoDB URIs look like: mongodb+srv://user:pass@host/dbname?options
    const match = uri.match(/\/([^/?]+)(\?|$)/);
    return match ? match[1] : null;
  } catch (error) {
    console.warn('Could not extract database name from URI');
    return null;
  }
}

// Helper function to get rating color class
function getRatingColorClass(rating) {
  if (!rating && rating !== 0) return 'default';
  if (rating >= 8) return 'excellent';
  if (rating >= 7) return 'good';
  if (rating >= 5) return 'average';
  return 'poor';
}

// Helper function to format movie data consistently
function formatMovieData(movie) {
  // Handle both MongoDB _id and string id
  const id = movie._id ? movie._id.toString() : movie.id || movie._id;
  
  // Get rating from various possible locations in document
  let rating = 0;
  if (movie.imdb?.rating) rating = movie.imdb.rating;
  else if (movie.vote_average) rating = movie.vote_average;
  else if (movie.rating) rating = movie.rating;
  
  // Get votes
  let votes = '0';
  if (movie.imdb?.votes) votes = movie.imdb.votes.toString();
  else if (movie.vote_count) votes = movie.vote_count.toString();
  else if (movie.votes) votes = movie.votes.toString();
  
  // Format votes with K/M suffix
  if (parseInt(votes) > 1000000) {
    votes = (parseInt(votes) / 1000000).toFixed(1) + 'M';
  } else if (parseInt(votes) > 1000) {
    votes = (parseInt(votes) / 1000).toFixed(1) + 'K';
  }
  
  // Get poster URL with fallback
  let poster = movie.poster || null;
  if (poster && !poster.startsWith('http')) {
    // Handle TMDB relative paths
    if (poster.startsWith('/')) {
      poster = `https://image.tmdb.org/t/p/w500${poster}`;
    } else {
      poster = null;
    }
  }
  
  // Get backdrop URL
  let backdrop = movie.backdrop || movie.backdrop_path || null;
  if (backdrop && !backdrop.startsWith('http')) {
    if (backdrop.startsWith('/')) {
      backdrop = `https://image.tmdb.org/t/p/original${backdrop}`;
    } else {
      backdrop = null;
    }
  }
  
  // Get overview/plot
  const overview = movie.fullplot || movie.plot || movie.overview || '';
  
  // Get year from various possible fields
  let year = 'Unknown';
  if (movie.year) year = movie.year.toString();
  else if (movie.released) year = new Date(movie.released).getFullYear().toString();
  else if (movie.release_date) year = new Date(movie.release_date).getFullYear().toString();
  
  return {
    _id: id,
    id: id, // Add id as alias for _id
    title: movie.title || 'Untitled',
    year: year,
    rating: parseFloat(rating) || 0,
    ratingColor: getRatingColorClass(parseFloat(rating) || 0),
    votes: votes,
    poster: poster || 'https://placehold.co/300x450/1a1a1a/666666?text=No+Poster',
    posterFallback: 'https://placehold.co/300x450/1a1a1a/666666?text=No+Poster',
    backdrop: backdrop,
    overview: overview,
    imdbId: movie.imdb?.id || movie.imdbId || '',
    genres: movie.genres || [],
    runtime: movie.runtime || 0,
    released: movie.released || null,
    directors: movie.directors || [],
    writers: movie.writers || [],
    cast: movie.cast || [],
    countries: movie.countries || [],
    languages: movie.languages || [],
    awards: movie.awards || null,
    type: movie.type || 'movie',
    tomatoes: movie.tomatoes || null,
    lastUpdated: new Date().toISOString()
  };
}

export default async function handler(req, res) {
  // Set CORS headers for better compatibility
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate'); // Cache for 60 seconds

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only GET requests are supported'
    });
  }

  // Get query parameters for pagination and filtering
  const { 
    page = 1, 
    limit = 20, 
    genre, 
    year, 
    sort = 'latest',
    search 
  } = req.query;

  // Validate pagination parameters
  const pageNum = parseInt(page);
  const limitNum = Math.min(parseInt(limit), 50); // Max 50 per page
  
  if (isNaN(pageNum) || pageNum < 1) {
    return res.status(400).json({ error: 'Invalid page parameter' });
  }
  
  if (isNaN(limitNum) || limitNum < 1) {
    return res.status(400).json({ error: 'Invalid limit parameter' });
  }

  const skip = (pageNum - 1) * limitNum;

  let client;
  try {
    // Connect to database
    const { db } = await connectToDatabase();
    
    // Get the movies collection
    const moviesCollection = db.collection('movies');
    
    // Build query filters
    const query = {};
    
    // Add type filter (only movies by default)
    query.type = 'movie';
    
    // Add genre filter if provided
    if (genre) {
      query.genres = { $in: [genre] };
    }
    
    // Add year filter if provided
    if (year) {
      query.year = parseInt(year);
    }
    
    // Add search filter if provided
    if (search) {
      query.$text = { $search: search };
    }
    
    // Determine sort order
    let sortOption = {};
    switch (sort) {
      case 'latest':
        sortOption = { year: -1, released: -1 };
        break;
      case 'oldest':
        sortOption = { year: 1 };
        break;
      case 'rating':
        sortOption = { 'imdb.rating': -1 };
        break;
      case 'title':
        sortOption = { title: 1 };
        break;
      default:
        sortOption = { year: -1 };
    }
    
    console.log('Executing query:', JSON.stringify({ query, sort: sortOption, skip, limit: limitNum }));
    
    // Execute query with pagination
    let movies = await moviesCollection
      .find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .toArray();
    
    console.log(`Found ${movies.length} movies`);
    
    // If no movies found with filters, try without type filter
    if (movies.length === 0 && query.type) {
      console.log('No movies found with type filter, trying without...');
      delete query.type;
      movies = await moviesCollection
        .find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .toArray();
    }
    
    // Get total count for pagination
    const totalCount = await moviesCollection.countDocuments(query);
    
    // Format each movie
    const formattedMovies = movies.map(formatMovieData);
    
    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;
    
    // Return successful response with pagination metadata
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
    console.error('Database error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Return appropriate error response
    const statusCode = error.name === 'MongoNetworkError' ? 503 : 500;
    
    return res.status(statusCode).json({
      success: false,
      error: 'Failed to fetch movies',
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  } finally {
    // Don't close the connection - let the pool manage it
    // This prevents connection churning
    if (client && client !== cachedClient) {
      await client.close();
    }
  }
}

// Optional: Add a health check endpoint
export async function healthCheck() {
  try {
    const { db } = await connectToDatabase();
    await db.command({ ping: 1 });
    return { status: 'healthy', database: 'connected' };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
}
