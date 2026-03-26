import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);

  // Debounce search input by 400 ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchMovies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ page, limit: 20 });
      if (debouncedSearch) params.set('search', debouncedSearch);

      const res = await fetch(`/api/movies?${params}`);
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setMovies(data.data || []);
        setPagination(data.pagination || null);
      }
    } catch {
      setError('Failed to load movies');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => { fetchMovies(); }, [fetchMovies]);

  const getRatingColor = (rating) => {
    if (rating >= 8) return '#4caf50';
    if (rating >= 7) return '#ffc107';
    if (rating >= 5) return '#ff9800';
    return '#f44336';
  };

  return (
    <div style={styles.container}>
      <Head>
        <title>SURFIX — Watch Free Movies Online</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Stream free movies online with SURFIX." />
      </Head>

      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.logo}>SURFIX</h1>
          <nav style={styles.nav}>
            <a href="#" style={styles.navLink}>Movies</a>
            <a href="#" style={styles.navLink}>TV Shows</a>
          </nav>
        </div>
      </header>

      {/* Search bar */}
      <div style={styles.searchWrap}>
        <input
          type="text"
          placeholder="Search movies…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      <div style={styles.statusBar}>
        {pagination
          ? `${pagination.totalCount.toLocaleString()} movies`
          : loading ? 'Loading…' : ''}
        {debouncedSearch && ` matching "${debouncedSearch}"`}
      </div>

      <main style={styles.main}>
        {loading ? (
          <div style={styles.loadingGrid}>
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} style={styles.skeletonCard} />
            ))}
          </div>
        ) : error ? (
          <div style={styles.errorBox}>
            <p>{error}</p>
            <button onClick={fetchMovies} style={styles.retryButton}>Try Again</button>
          </div>
        ) : movies.length === 0 ? (
          <div style={styles.emptyBox}>
            <p>No movies found{debouncedSearch ? ` for "${debouncedSearch}"` : ''}.</p>
          </div>
        ) : (
          <div style={styles.movieGrid}>
            {movies.map((movie) => (
              <Link key={movie._id} href={`/watch/${movie._id}`} style={{ textDecoration: 'none' }}>
                <div style={styles.movieCard} className="movie-card">
                  <div style={styles.posterContainer}>
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      style={styles.poster}
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/300x450/1a1a1a/ffffff?text=No+Poster';
                      }}
                    />
                    {movie.rating > 0 && (
                      <div style={{
                        ...styles.ratingBadge,
                        backgroundColor: getRatingColor(movie.rating)
                      }}>
                        {Number(movie.rating).toFixed(1)}
                      </div>
                    )}
                    <div style={styles.playOverlay}>▶</div>
                  </div>
                  <div style={styles.movieInfo}>
                    <h4 style={styles.movieTitle}>{movie.title}</h4>
                    <p style={styles.movieYear}>{movie.year}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && !loading && (
          <div style={styles.pagination}>
            <button
              onClick={() => setPage(p => p - 1)}
              disabled={!pagination.hasPrevPage}
              style={{
                ...styles.pageBtn,
                ...(pagination.hasPrevPage ? {} : styles.pageBtnDisabled)
              }}
            >
              ← Prev
            </button>
            <span style={styles.pageInfo}>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={!pagination.hasNextPage}
              style={{
                ...styles.pageBtn,
                ...(pagination.hasNextPage ? {} : styles.pageBtnDisabled)
              }}
            >
              Next →
            </button>
          </div>
        )}
      </main>

      <footer style={styles.footer}>
        <p style={styles.copyright}>© {new Date().getFullYear()} SURFIX</p>
      </footer>

      <style>{`
        .movie-card:hover { transform: scale(1.04); transition: transform 0.2s; }
        .movie-card { transition: transform 0.2s; }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#0f0f0f',
    minHeight: '100vh',
    color: '#fff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    background: '#1a1a1a',
    padding: '14px 20px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    borderBottom: '1px solid #2a2a2a',
  },
  headerContent: {
    maxWidth: 1400,
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: 0,
  },
  nav: { display: 'flex', gap: 24 },
  navLink: { color: '#ccc', textDecoration: 'none', fontSize: 15 },
  searchWrap: {
    maxWidth: 1400,
    margin: '20px auto 0',
    padding: '0 20px',
  },
  searchInput: {
    width: '100%',
    maxWidth: 480,
    padding: '10px 16px',
    borderRadius: 8,
    border: '1px solid #333',
    background: '#1a1a1a',
    color: '#fff',
    fontSize: 15,
    outline: 'none',
    boxSizing: 'border-box',
  },
  statusBar: {
    maxWidth: 1400,
    margin: '10px auto 0',
    padding: '0 20px',
    color: '#666',
    fontSize: 13,
  },
  main: {
    maxWidth: 1400,
    margin: '20px auto 48px',
    padding: '0 20px',
  },
  loadingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: 20,
  },
  skeletonCard: {
    background: '#1e1e1e',
    borderRadius: 8,
    aspectRatio: '2/3',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  errorBox: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#aaa',
  },
  emptyBox: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#666',
  },
  retryButton: {
    background: '#6b46c1',
    color: 'white',
    border: 'none',
    padding: '10px 24px',
    borderRadius: 8,
    fontSize: 15,
    cursor: 'pointer',
    marginTop: 12,
  },
  movieGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: 20,
  },
  movieCard: {
    cursor: 'pointer',
    borderRadius: 8,
    overflow: 'hidden',
    background: '#1a1a1a',
    border: '1px solid #2a2a2a',
  },
  posterContainer: {
    position: 'relative',
    aspectRatio: '2/3',
    overflow: 'hidden',
  },
  poster: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 38,
    height: 38,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: 13,
    color: 'white',
    border: '2px solid rgba(255,255,255,0.8)',
    boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
  },
  playOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 36,
    opacity: 0,
    transition: 'opacity 0.2s',
  },
  movieInfo: { padding: '10px 12px 12px' },
  movieTitle: {
    margin: '0 0 4px',
    fontSize: 14,
    fontWeight: 600,
    color: '#fff',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  movieYear: { margin: 0, fontSize: 12, color: '#777' },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginTop: 40,
  },
  pageBtn: {
    background: '#6b46c1',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 14,
  },
  pageBtnDisabled: {
    background: '#2a2a2a',
    color: '#555',
    cursor: 'not-allowed',
  },
  pageInfo: { color: '#888', fontSize: 14 },
  footer: {
    background: '#1a1a1a',
    padding: '20px',
    textAlign: 'center',
    borderTop: '1px solid #2a2a2a',
  },
  copyright: { color: '#555', fontSize: 12, margin: 0 },
};
