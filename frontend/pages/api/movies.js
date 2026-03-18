import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if MONGODB_URI exists
  if (!MONGODB_URI) {
    console.error('MONGODB_URI is not defined');
    return res.status(500).json({ error: 'Database connection string not configured' });
  }

  let client;
  try {
    console.log('Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('Connected successfully');
    
    const db = client.db('sample_mflix'); // Your database name from logs
    const moviesCollection = db.collection('movies');
    
    // Get movies with proper error handling
    const movies = await moviesCollection
      .find({})
      .sort({ year: -1 }) // Sort by newest first
      .limit(50)
      .toArray();

    console.log(`Found ${movies.length} movies`);

    // Transform the data to match frontend expectations
    const formattedMovies = movies.map(movie => ({
      _id: movie._id.toString(),
      title: movie.title || 'Untitled',
      year: movie.year?.toString() || 'Unknown',
      rating: movie.imdb?.rating || 0,
      votes: movie.imdb?.votes || '0',
      poster: movie.poster || 'https://via.placeholder.com/300x450?text=No+Poster',
      backdrop: movie.poster?.replace('/w500/', '/original/') || null,
      overview: movie.fullplot || movie.plot || 'No description available',
      imdbId: movie.imdb?.id || '',
      genres: movie.genres || [],
      runtime: movie.runtime || 0,
      released: movie.released || null,
      directors: movie.directors || [],
      cast: movie.cast || [],
      type: movie.type || 'movie'
    }));

    await client.close();
    
    return res.status(200).json({ 
      success: true,
      movies: formattedMovies 
    });

  } catch (error) {
    console.error('Database error:', error);
    
    // Return sample data if database fails (so site doesn't break)
    const sampleMovies = [
      {
        _id: '1',
        title: 'Dune: Part Two',
        year: '2024',
        rating: 8.7,
        votes: '124K',
        poster: 'https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8CY05BE4zF.jpg',
        overview: 'Paul Atreides unites with Chani and the Fremen while seeking revenge.',
        imdbId: 'tt15239678'
      },
      {
        _id: '2',
        title: 'Oppenheimer',
        year: '2023',
        rating: 8.5,
        votes: '98K',
        poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
        overview: 'The story of American scientist J. Robert Oppenheimer.',
        imdbId: 'tt15398776'
      }
    ];
    
    return res.status(200).json({ 
      success: true,
      movies: sampleMovies,
      note: 'Using sample data due to database error'
    });
  }
}
