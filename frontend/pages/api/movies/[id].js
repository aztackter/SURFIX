import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    try {
      await cachedClient.db().admin().ping();
      return { client: cachedClient, db: cachedDb };
    } catch (error) {
      cachedClient = null;
      cachedDb = null;
    }
  }

  if (!MONGODB_URI) {
    throw new Error('MongoDB URI is not defined');
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  
  let dbName = 'sample_mflix';
  try {
    const match = MONGODB_URI.match(/\/([^/?]+)(\?|$)/);
    if (match && match[1]) {
      dbName = match[1];
    }
  } catch (error) {
    
  }
  
  const db = client.db(dbName);
  
  cachedClient = client;
  cachedDb = db;
  
  return { client, db };
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
    
    if (ObjectId.isValid(id)) {
      try {
        movie = await moviesCollection.findOne({ _id: new ObjectId(id) });
      } catch (e) {
        
      }
    }
    
    if (!movie) {
      movie = await moviesCollection.findOne({ 'imdb.id': id });
    }
    
    if (!movie) {
      movie = await moviesCollection.findOne({ _id: id });
    }
    
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    
    const formattedMovie = {
      _id: movie._id.toString(),
      title: movie.title,
      year: movie.year || 'Unknown',
      rating: movie.imdb?.rating || 0,
      votes: movie.imdb?.votes?.toString() || '0',
      poster: movie.poster || 'https://placehold.co/500x750/1a1a1a/ffffff?text=No+Poster',
      backdrop: movie.backdrop || null,
      overview: movie.fullplot || movie.plot || movie.overview || '',
      imdbId: movie.imdb?.id || '',
      tmdbId: movie.tmdbId || null,
      genres: movie.genres || [],
      runtime: movie.runtime || 0,
      directors: movie.directors || [],
      cast: movie.cast || []
    };
    
    res.status(200).json({
      success: true,
      data: formattedMovie
    });
  } catch (error) {
    console.error('Error fetching movie:', error);
    res.status(500).json({ error: 'Failed to fetch movie', message: error.message });
  }
}
