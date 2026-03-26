import express from 'express';
import cors from 'cors';
import movieRoutes from './routes/movie.js';
import tvRoutes from './routes/tv.js';
import proxyRoutes from './routes/proxy.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/movie', movieRoutes);
app.use('/api/tv', tvRoutes);
app.use('/api/proxy', proxyRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`SURFIX API running on port ${PORT}`);
});
