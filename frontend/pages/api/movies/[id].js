import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URL;

// Cache connection (same as above)
let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  if (!MONGODB_URI) {
    throw new Error('MongoDB URI is not defined');
  }

  const options = {
    maxPoolSize: 10,
    minPoolSize: 2,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  };

  const client = new MongoClient(MONGODB_URI, options);
  await client.connect();
  
  const dbName = extractDatabaseName(MONGODB_URI) || 'railway';
  const db = client.db(dbName);
  
  cachedClient = client;
  cachedDb = db;
  
  return { client, db };
}

function extractDatabaseName(uri) {
  try {
    const match = uri.match(/\/([^/?]+)(\?|$)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

// Helper to format single movie (includes more details)
function formatMovieDetails(movie) {
  const base = {
    _id: movie._id.toString(),
    title: movie.title || 'Untitled',
    year: movie.year?.toString() || 'Unknown',
    rating: movie.imdb?.rating || 0,
    votes: movie.imdb?.votes?.toString() || '0',
    poster: movie.poster || null,
    backdrop: movie.backdrop || movie.poster?.replace('/w500/', '/original/') || null,
    overview: movie.fullplot || movie.plot || movie.overview || '',
    imdbId: movie.imdb?.id || '',
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

  // Format poster URL if it's a TMDB path
  if (base.poster && !base.poster.startsWith('http')) {
    base.poster = `https://image.tmdb.org/t/p/w500${base.poster}`;
  }
  if (base.backdrop && !base.backdrop.startsWith('http') && base.backdrop.startsWith('/')) {
    base.backdrop = `https://image.tmdb.org/t/p/original${base.backdrop}`;
  }

  return base;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Movie ID is required' });
  }

  try {
    const { db } = await connectToDatabase();
    const moviesCollection = db.collection('movies');
    
    let movie = null;
    
    // Try different ways to find the movie
    // 1. Try as ObjectId
    if (ObjectId.isValid(id)) {
      try {
        movie = await moviesCollection.findOne({ _id: new ObjectId(id) });
      } catch (e) {
        // Ignore ObjectId error
      }
    }
    
    // 2. Try as IMDb ID
    if (!movie) {
      movie = await moviesCollection.findOne({ 'imdb.id': id });
    }
    
    // 3. Try as string ID in _id field
    if (!movie) {
      movie = await moviesCollection.findOne({ _id: id });
    }
    
    // 4. Try as numeric ID
    if (!movie && !isNaN(parseInt(id))) {
      movie = await moviesCollection.findOne({ id: parseInt(id) });
    }
    
    // 5. Try by title search (case insensitive)
    if (!movie) {
      movie = await moviesCollection.findOne({ 
        title: { $regex: new RegExp('^' + id.replace(/-/g, ' '), 'i') }
      });
    }

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    const formattedMovie = formatMovieDetails(movie);

    return res.status(200).json({
      success: true,
      data: formattedMovie
    });

  } catch (error) {
    console.error('Error fetching movie:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch movie',
      message: error.message 
    });
  }
}
