import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db('surfix');
    
    const movies = await db.collection('movies')
      .find({})
      .sort({ added: -1 })
      .limit(50)
      .toArray();

    await client.close();

    res.status(200).json({ movies });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
}
