// Run this once to populate your database
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://xzxhub0_db_user:UOiJ89aCBrEiVaoJ@cluster0.rsjwegw.mongodb.net/surfix?retryWrites=true&w=majority&appName=Cluster0";

const movies = [
  // Action Movies
  {
    title: "Dune: Part Two",
    year: "2024",
    imdbId: "tt15239678",
    overview: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
    rating: 8.7,
    votes: "124K",
    poster: "https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8CY05BE4zF.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/wwemzKWzjKYJFfCeiB57q3r4Bcm.png",
    added: new Date()
  },
  {
    title: "Oppenheimer",
    year: "2023",
    imdbId: "tt15398776",
    overview: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
    rating: 8.5,
    votes: "98K",
    poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg",
    added: new Date()
  },
  {
    title: "Poor Things",
    year: "2023",
    imdbId: "tt14230458",
    overview: "The incredible tale about the fantastical evolution of Bella Baxter.",
    rating: 8.4,
    votes: "67K",
    poster: "https://image.tmdb.org/t/p/w500/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/bQS43HSL2z3r8Vqh0Jnkd1LgZIT.jpg",
    added: new Date()
  },
  {
    title: "The Batman",
    year: "2022",
    imdbId: "tt1877830",
    overview: "When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate.",
    rating: 7.8,
    votes: "156K",
    poster: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/yF1eOkaYvwiORauRCPWznV9xVvi.jpg",
    added: new Date()
  },
  {
    title: "Killers of the Flower Moon",
    year: "2023",
    imdbId: "tt5537002",
    overview: "When oil is discovered in 1920s Oklahoma under Osage Nation land, the Osage people are murdered.",
    rating: 8.2,
    votes: "89K",
    poster: "https://image.tmdb.org/t/p/w500/dB6KrkDzeUyQR8ZCbpzLz9eQ3R5.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/qv4f5ZPpTnG2P5BakI1D4c9pSID.jpg",
    added: new Date()
  },
  {
    title: "Godzilla x Kong",
    year: "2024",
    imdbId: "tt14539740",
    overview: "Two ancient titans clash in an epic battle while humanity watches their every move.",
    rating: 7.2,
    votes: "45K",
    poster: "https://image.tmdb.org/t/p/w500/pgqgaUx1cJb5oZQQ5v0tNARCeBp.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/pxJbfnMI5xHr55gyUAYUGi3In5b.jpg",
    added: new Date()
  },
  {
    title: "Civil War",
    year: "2024",
    imdbId: "tt17279496",
    overview: "A journey across a dystopian future America, following a team of military-embedded journalists.",
    rating: 7.6,
    votes: "34K",
    poster: "https://image.tmdb.org/t/p/w500/sh7Rg8Er3tFcN9BpKIPOMvALgZd.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/zkPtFneS3DnOqXHYzwE6jJqKp9x.jpg",
    added: new Date()
  },
  {
    title: "Furiosa",
    year: "2024",
    imdbId: "tt12037194",
    overview: "The origin story of renegade warrior Furiosa before her encounter with Mad Max.",
    rating: 8.1,
    votes: "52K",
    poster: "https://image.tmdb.org/t/p/w500/iADOJ8Zymht2JPMoy3R7xceZprc.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/fGjQ9U4A8RGyITLcvyCAADKdGCy.jpg",
    added: new Date()
  },
  {
    title: "The Fall Guy",
    year: "2024",
    imdbId: "tt1684562",
    overview: "A stuntman fresh off an almost career-ending accident has to track down a missing movie star.",
    rating: 7.3,
    votes: "28K",
    poster: "https://image.tmdb.org/t/p/w500/aBkqu7EddWK7qmY4grL4I6ed0x8.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/6tMPPdBIRo2PTm8ZBhD6dGxgAyx.jpg",
    added: new Date()
  },
  {
    title: "Kingdom of the Planet of the Apes",
    year: "2024",
    imdbId: "tt11389872",
    overview: "Many years after the reign of Caesar, a young ape goes on a journey that will lead him to question everything.",
    rating: 7.5,
    votes: "41K",
    poster: "https://image.tmdb.org/t/p/w500/gKkl37BQuKTanygYQG1pyYgLVgf.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/fQqiZ8r3hUc8LXfHkisN9ZRHEFs.jpg",
    added: new Date()
  }
];

async function seedDatabase() {
  console.log('Connecting to MongoDB...');
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected successfully');
    
    const db = client.db('surfix');
    const collection = db.collection('movies');
    
    // Clear existing movies
    await collection.deleteMany({});
    console.log('Cleared existing movies');
    
    // Insert new movies
    const result = await collection.insertMany(movies);
    console.log(`Successfully added ${result.insertedCount} movies!`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('Database connection closed');
  }
}

seedDatabase();
