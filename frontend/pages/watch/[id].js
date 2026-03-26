import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Head from 'next/head';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function WatchPage() {
  const router = useRouter();
  const { id } = router.query;
  const [movie, setMovie] = useState(null);
  const [sources, setSources] = useState([]);
  const [selectedSource, setSelectedSource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchMovie();
    }
  }, [id]);

  const fetchMovie = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/movies/${id}`);
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setMovie(data.data);
        await fetchSources(data.data);
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to load movie');
      setLoading(false);
    }
  };

  const fetchSources = async (movieData) => {
    try {
      let tmdbId = movieData.tmdbId;
      
      if (!tmdbId && movieData.imdbId) {
        const imdbRes = await fetch(`https://api.themoviedb.org/3/find/${movieData.imdbId}?api_key=${process.env.NEXT_PUBLIC_TMDB_KEY}&external_source=imdb_id`);
        const imdbData = await imdbRes.json();
        if (imdbData.movie_results && imdbData.movie_results.length > 0) {
          tmdbId = imdbData.movie_results[0].id;
        }
      }
      
      if (!tmdbId) {
        const searchRes = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${process.env.NEXT_PUBLIC_TMDB_KEY}&query=${encodeURIComponent(movieData.title)}&year=${movieData.year}`);
        const searchData = await searchRes.json();
        if (searchData.results && searchData.results.length > 0) {
          tmdbId = searchData.results[0].id;
        }
      }
      
      if (tmdbId) {
        const sourcesRes = await fetch(`${API_URL}/api/movie?id=${tmdbId}`);
        const sourcesData = await sourcesRes.json();
        
        if (sourcesData.success && sourcesData.sources.length > 0) {
          setSources(sourcesData.sources);
          setSelectedSource(sourcesData.sources[0]);
        } else {
          setError('No video sources found for this movie');
        }
      } else {
        setError('Could not find TMDB ID for this movie');
      }
    } catch (err) {
      console.error('Error fetching sources:', err);
      setError('Failed to fetch video sources');
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loader}></div>
        <p>Loading movie...</p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div style={styles.errorContainer}>
        <h2>Error</h2>
        <p>{error || 'Movie not found'}</p>
        <button onClick={() => router.back()} style={styles.backButton}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Head>
        <title>{movie.title} - SURFIX</title>
      </Head>

      <div style={styles.navbar}>
        <button onClick={() => router.back()} style={styles.backBtn}>
          ← Back
        </button>
        <h1 style={styles.navTitle}>{movie.title}</h1>
      </div>

      <div style={styles.playerContainer}>
        {selectedSource ? (
          <iframe
            src={selectedSource.url}
            style={styles.player}
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        ) : (
          <div style={styles.noServer}>
            <p>No video sources available</p>
          </div>
        )}
      </div>

      {sources.length > 1 && (
        <div style={styles.serverBar}>
          <div style={styles.serverList}>
            {sources.map((source, index) => (
              <button
                key={index}
                onClick={() => setSelectedSource(source)}
                style={{
                  ...styles.serverButton,
                  ...(selectedSource === source ? styles.serverButtonActive : {})
                }}
              >
                {source.provider} ({source.quality})
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={styles.infoContainer}>
        <div style={styles.infoContent}>
          <img 
            src={movie.poster}
            alt={movie.title}
            style={styles.infoPoster}
            onError={(e) => {
              e.target.src = 'https://placehold.co/200x300/1a1a1a/ffffff?text=No+Poster';
            }}
          />
          
          <div style={styles.infoDetails}>
            <h1 style={styles.infoTitle}>{movie.title}</h1>
            
            <div style={styles.metaTags}>
              <span style={styles.metaTag}>{movie.year}</span>
              {movie.runtime > 0 && (
                <span style={styles.metaTag}>{movie.runtime} min</span>
              )}
              <span style={styles.metaTag}>⭐ {movie.rating}/10</span>
            </div>

            {movie.genres && movie.genres.length > 0 && (
              <div style={styles.genreTags}>
                {movie.genres.slice(0, 3).map((genre, i) => (
                  <span key={i} style={styles.genreTag}>{genre}</span>
                ))}
              </div>
            )}

            <p style={styles.overview}>{movie.overview}</p>

            {movie.directors && movie.directors.length > 0 && (
              <p style={styles.director}>
                <strong>Director:</strong> {movie.directors.join(', ')}
              </p>
            )}

            {movie.cast && movie.cast.length > 0 && (
              <p style={styles.cast}>
                <strong>Cast:</strong> {movie.cast.slice(0, 5).join(', ')}
                {movie.cast.length > 5 && '...'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#0f0f0f',
    color: '#fff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  loadingContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#0f0f0f',
    color: '#fff',
  },
  loader: {
    border: '4px solid rgba(255,255,255,0.3)',
    borderTop: '4px solid white',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px',
  },
  errorContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#0f0f0f',
    color: '#fff',
    textAlign: 'center',
    padding: '20px',
  },
  backButton: {
    background: '#6b46c1',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '20px',
  },
  navbar: {
    background: '#1a1a1a',
    padding: '15px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  backBtn: {
    background: 'none',
    border: '1px solid #444',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  navTitle: {
    fontSize: '18px',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  playerContainer: {
    position: 'relative',
    width: '100%',
    paddingTop: '56.25%',
    background: '#000',
  },
  player: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    border: 'none',
  },
  noServer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#1a1a1a',
    color: '#999',
  },
  serverBar: {
    background: '#1a1a1a',
    padding: '15px',
    borderBottom: '1px solid #333',
  },
  serverList: {
    display: 'flex',
    gap: '10px',
    overflowX: 'auto',
    padding: '5px 0',
  },
  serverButton: {
    background: '#333',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    fontSize: '14px',
  },
  serverButtonActive: {
    background: '#6b46c1',
  },
  infoContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '30px 20px',
  },
  infoContent: {
    display: 'flex',
    gap: '30px',
    flexWrap: 'wrap',
  },
  infoPoster: {
    width: '200px',
    height: '300px',
    objectFit: 'cover',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  },
  infoDetails: {
    flex: 1,
    minWidth: '300px',
  },
  infoTitle: {
    fontSize: '32px',
    margin: '0 0 15px 0',
  },
  metaTags: {
    display: 'flex',
    gap: '10px',
    marginBottom: '15px',
    flexWrap: 'wrap',
  },
  metaTag: {
    background: '#333',
    padding: '5px 12px',
    borderRadius: '20px',
    fontSize: '14px',
  },
  genreTags: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  genreTag: {
    background: '#6b46c1',
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '12px',
  },
  overview: {
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#ccc',
    marginBottom: '20px',
  },
  director: {
    fontSize: '15px',
    color: '#ddd',
    marginBottom: '10px',
  },
  cast: {
    fontSize: '15px',
    color: '#ddd',
  },
};
