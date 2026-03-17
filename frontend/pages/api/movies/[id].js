import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = 'surfix';

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db(MONGODB_DB);
    
    let movie;
    
    // Check if id is ObjectId format
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      movie = await db.collection('movies').findOne({ 
        _id: new ObjectId(id) 
      });
    } else {
      // Try tmdbId or imdbId
      movie = await db.collection('movies').findOne({
        $or: [
          { tmdbId: parseInt(id) },
          { imdbId: id }
        ]
      });
    }

    await client.close();

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    // Convert ObjectId to string
    movie._id = movie._id.toString();

    res.status(200).json(movie);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch movie' });
  }
}
