import { MongoClient } from 'mongodb';

export default async function handler(req, res) {
  const result = {
    env: {
      hasMongoUri: !!process.env.MONGODB_URI,
      mongoUriPrefix: process.env.MONGODB_URI?.substring(0, 20) + '...',
      nodeEnv: process.env.NODE_ENV,
    },
    attempts: []
  };

  // Try to connect
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    result.connected = true;
    result.dbs = await client.db().admin().listDatabases();
    await client.close();
  } catch (error) {
    result.connected = false;
    result.error = {
      message: error.message,
      code: error.code,
      name: error.name
    };
  }

  res.status(200).json(result);
}
