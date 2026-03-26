import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;

// FIX: Removed unused `API_URL` constant that was defined but never referenced.

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    try {
      await cachedClient.db().admin().ping();
      return { client: cachedClient, db: cachedDb };
    } catch {
      cachedClient = null;
      cachedDb = null;
    }
  }

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();

  let dbName = 'sample_mflix';
  try {
    const match = MONGODB_URI.match(/\/([^/?]+)(\?|$)/);
    if (match?.[1]) dbName = match[1];
  } catch { }

  const db = client.db(dbName);
  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { page = 1, limit = 20, search } = req.query;
  const pageNum = parseInt(page, 10);
  const limitNum = Math.min(parseInt(limit, 10), 50);
  const skip = (pageNum - 1) * limitNum;

  try {
    const { db } = await connectToDatabase();
    const moviesCollection = db.collection('movies');

    const query = {};
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const totalCount = await moviesCollection.countDocuments(query);

    if (totalCount === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        pagination: {
          page: pageNum, limit: limitNum,
          totalCount: 0, totalPages: 0,
          hasNextPage: false, hasPrevPage: false
        }
      });
    }

    const movies = await moviesCollection
      .find(query)
      .sort({ year: -1 })
      .skip(skip)
      .limit(limitNum)
      .toArray();

    const formattedMovies = movies.map(movie => ({
      _id: movie._id.toString(),
      title: movie.title,
      year: movie.year,
      rating: movie.imdb?.rating || 0,
      poster: movie.poster || 'https://placehold.co/300x450/1a1a1a/ffffff?text=No+Poster',
      tmdbId: movie.tmdbId || null,
      overview: movie.fullplot || movie.plot || ''
    }));

    const totalPages = Math.ceil(totalCount / limitNum);

    res.status(200).json({
      success: true,
      data: formattedMovies,
      pagination: {
        page: pageNum, limit: limitNum,
        totalCount, totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch movies', message: error.message });
  }
}
