import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Head from 'next/head';

// FIX: API_URL is only used server-side via Next.js API routes now.
// The public-facing variable is still needed to call the scraper API from the browser.
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function WatchPage() {
  const router = useRouter();
  const { id } = router.query;
  const [movie, setMovie] = useState(null);
  const [sources, setSources] = useState([]);
  // FIX: Track selected source by index, not object reference.
  // Reference equality (selectedSource === source) silently breaks if the
  // sources array is ever regenerated (e.g. retry). An index is stable.
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sourcesLoading, setSourcesLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) fetchMovie();
  }, [id]);

  const fetchMovie = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/movies/${id}`);
      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }

      setMovie(data.data);
      setLoading(false);
      await fetchSources(data.data);
    } catch (err) {
      setError('Failed to load movie');
      setLoading(false);
    }
  };

  const fetchSources = async (movieData) => {
    try {
      setSourcesLoading(true);

      // FIX: TMDB lookup now goes through our server-side API route
      // so the API key is never sent to or visible in the browser.
      let tmdbId = movieData.tmdbId;

      if (!tmdbId) {
        const params = new URLSearchParams();
        if (movieData.imdbId) {
          params.set('imdbId', movieData.imdbId);
        } else {
          params.set('title', movieData.title);
          if (movieData.year) params.set('year', movieData.year);
        }

        const tmdbRes = await fetch(`/api/tmdb?${params}`);
        const tmdbData = await tmdbRes.json();
        if (tmdbData.success) {
          tmdbId = tmdbData.tmdbId;
        }
      }

      if (!tmdbId) {
        setError('Could not find this movie in the streaming database');
        setSourcesLoading(false);
        return;
      }

      const sourcesRes = await fetch(`${API_URL}/api/movie?id=${tmdbId}`);
      const sourcesData = await sourcesRes.json();

      if (sourcesData.success && sourcesData.sources.length > 0) {
        setSources(sourcesData.sources);
        setSelectedIndex(0);
      } else {
        setError('No video sources found for this movie');
      }
    } catch (err) {
      console.error('Error fetching sources:', err);
      setError('Failed to fetch video sources');
    } finally {
      setSourcesLoading(false);
    }
  };

  const selectedSource = sources[selectedIndex] || null;

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinnerWrap}>
          <div style={styles.spinner} />
        </div>
        <p style={styles.loadingText}>Loading movie…</p>
        <style>{spinKeyframe}</style>
      </div>
    );
  }

  if (error && !movie) {
    return (
      <div style={styles.errorContainer}>
        <h2 style={styles.errorTitle}>Something went wrong</h2>
        <p style={styles.errorMsg}>{error}</p>
        <button onClick={() => router.back()} style={styles.backButton}>
          ← Go Back
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Head>
        <title>{movie?.title ? `${movie.title} — SURFIX` : 'SURFIX'}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      {/* Navbar */}
      <nav style={styles.navbar}>
        <button onClick={() => router.back()} style={styles.backBtn}>← Back</button>
        <h1 style={styles.navTitle}>{movie?.title}</h1>
      </nav>

      {/* Player */}
      <div style={styles.playerContainer}>
        {sourcesLoading ? (
          <div style={styles.playerOverlay}>
            <div style={styles.spinner} />
            <p style={{ color: '#aaa', marginTop: 16 }}>Finding sources…</p>
            <style>{spinKeyframe}</style>
          </div>
        ) : selectedSource ? (
          <iframe
            key={selectedSource.url}
            src={selectedSource.url}
            style={styles.player}
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        ) : (
          <div style={styles.playerOverlay}>
            <p style={{ color: '#aaa' }}>{error || 'No video sources available'}</p>
            <button onClick={fetchMovie} style={{ ...styles.backButton, marginTop: 16 }}>
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Source selector */}
      {sources.length > 1 && (
        <div style={styles.serverBar}>
          <span style={styles.serverLabel}>Sources:</span>
          <div style={styles.serverList}>
            {sources.map((source, index) => (
              <button
                key={source.url}
                onClick={() => setSelectedIndex(index)}
                style={{
                  ...styles.serverButton,
                  // FIX: compare by index, not object reference
                  ...(index === selectedIndex ? styles.serverButtonActive : {})
                }}
              >
                {source.provider}
                <span style={styles.qualityBadge}>{source.quality}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Movie info */}
      {movie && (
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
                {movie.year && <span style={styles.metaTag}>{movie.year}</span>}
                {movie.runtime > 0 && <span style={styles.metaTag}>{movie.runtime} min</span>}
                {movie.rating > 0 && (
                  <span style={{ ...styles.metaTag, color: '#ffd700' }}>
                    ⭐ {Number(movie.rating).toFixed(1)}/10
                  </span>
                )}
              </div>

              {movie.genres?.length > 0 && (
                <div style={styles.genreTags}>
                  {movie.genres.slice(0, 4).map((genre, i) => (
                    <span key={i} style={styles.genreTag}>{genre}</span>
                  ))}
                </div>
              )}

              {movie.overview && (
                <p style={styles.overview}>{movie.overview}</p>
              )}

              {movie.directors?.length > 0 && (
                <p style={styles.metaLine}>
                  <strong>Director:</strong> {movie.directors.join(', ')}
                </p>
              )}

              {movie.cast?.length > 0 && (
                <p style={styles.metaLine}>
                  <strong>Cast:</strong> {movie.cast.slice(0, 5).join(', ')}
                  {movie.cast.length > 5 && ' …'}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{spinKeyframe}</style>
    </div>
  );
}

const spinKeyframe = `
  @keyframes spin {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

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
    gap: 8,
  },
  spinnerWrap: { marginBottom: 8 },
  spinner: {
    border: '4px solid rgba(255,255,255,0.15)',
    borderTop: '4px solid #6b46c1',
    borderRadius: '50%',
    width: 48,
    height: 48,
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: { color: '#aaa', fontSize: 15, margin: 0 },
  errorContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#0f0f0f',
    color: '#fff',
    textAlign: 'center',
    padding: 20,
    gap: 12,
  },
  errorTitle: { margin: 0, fontSize: 22 },
  errorMsg: { color: '#aaa', margin: 0 },
  backButton: {
    background: '#6b46c1',
    color: 'white',
    border: 'none',
    padding: '10px 24px',
    borderRadius: 8,
    fontSize: 15,
    cursor: 'pointer',
  },
  navbar: {
    background: '#1a1a1a',
    padding: '14px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: 20,
    position: 'sticky',
    top: 0,
    zIndex: 100,
    borderBottom: '1px solid #2a2a2a',
  },
  backBtn: {
    background: 'none',
    border: '1px solid #444',
    color: 'white',
    padding: '7px 14px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 14,
    whiteSpace: 'nowrap',
  },
  navTitle: {
    fontSize: 17,
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
    inset: 0,
    width: '100%',
    height: '100%',
    border: 'none',
  },
  playerOverlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#111',
  },
  serverBar: {
    background: '#1a1a1a',
    padding: '12px 20px',
    borderBottom: '1px solid #2a2a2a',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  serverLabel: { color: '#888', fontSize: 13, whiteSpace: 'nowrap' },
  serverList: {
    display: 'flex',
    gap: 8,
    overflowX: 'auto',
    paddingBottom: 2,
  },
  serverButton: {
    background: '#2a2a2a',
    color: '#ccc',
    border: '1px solid #3a3a3a',
    padding: '8px 16px',
    borderRadius: 6,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    fontSize: 13,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  serverButtonActive: {
    background: '#6b46c1',
    color: '#fff',
    border: '1px solid #7c5cbf',
  },
  qualityBadge: {
    background: 'rgba(255,255,255,0.15)',
    borderRadius: 4,
    padding: '2px 6px',
    fontSize: 11,
  },
  infoContainer: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '32px 20px 48px',
  },
  infoContent: {
    display: 'flex',
    gap: 32,
    flexWrap: 'wrap',
  },
  infoPoster: {
    width: 200,
    height: 300,
    objectFit: 'cover',
    borderRadius: 10,
    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
    flexShrink: 0,
  },
  infoDetails: { flex: 1, minWidth: 280 },
  infoTitle: { fontSize: 30, margin: '0 0 14px', lineHeight: 1.2 },
  metaTags: { display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' },
  metaTag: {
    background: '#2a2a2a',
    padding: '4px 12px',
    borderRadius: 20,
    fontSize: 13,
  },
  genreTags: { display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' },
  genreTag: {
    background: '#6b46c1',
    padding: '4px 10px',
    borderRadius: 4,
    fontSize: 12,
  },
  overview: {
    fontSize: 15,
    lineHeight: 1.7,
    color: '#bbb',
    marginBottom: 18,
    margin: '0 0 18px',
  },
  metaLine: { fontSize: 14, color: '#ccc', margin: '0 0 8px' },
};
