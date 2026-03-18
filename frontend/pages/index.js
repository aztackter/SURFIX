import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/movies');
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setMovies(data.movies || []);
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to load movies');
      setLoading(false);
    }
  };

  // Helper function to get rating color
  const getRatingColor = (rating) => {
    if (rating >= 8) return '#4caf50'; // Green
    if (rating >= 7) return '#ffc107'; // Yellow
    if (rating >= 5) return '#ff9800'; // Orange
    return '#f44336'; // Red
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loader}></div>
        <p style={styles.loadingText}>Loading SURFIX...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <h2>Error Loading Movies</h2>
        <p>{error}</p>
        <button onClick={fetchMovies} style={styles.retryButton}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Head>
        <title>SURFIX - Watch Free Movies Online</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.logo}>SURFIX</h1>
          <nav style={styles.nav}>
            <a href="#" style={styles.navLink}>Movies</a>
            <a href="#" style={styles.navLink}>TV Shows</a>
            <a href="#" style={styles.navLink}>Live TV</a>
          </nav>
          <button style={styles.searchButton}>
            🔍
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <h2 style={styles.heroTitle}>Unlimited Movies & TV Shows</h2>
          <p style={styles.heroSubtitle}>Watch anywhere. Cancel anytime.</p>
          <button style={styles.heroButton}>Start Watching</button>
        </div>
      </section>

      {/* Main Content */}
      <main style={styles.main}>
        {/* Premium Movies Section */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>
              Premium Movies <span style={styles.premiumBadge}>PREMIUM</span>
            </h3>
            <a href="#" style={styles.viewAll}>View All →</a>
          </div>
          
          <div style={styles.movieGrid}>
            {movies.slice(0, 10).map((movie, index) => (
              <Link key={index} href={`/watch/${movie._id}`} style={{ textDecoration: 'none' }}>
                <div style={styles.movieCard}>
                  <div style={styles.posterContainer}>
                    <img 
                      src={movie.poster || 'https://via.placeholder.com/300x450'}
                      alt={movie.title}
                      style={styles.poster}
                      loading="lazy"
                    />
                    <div style={styles.ratingBadge} style={{
                      ...styles.ratingBadge,
                      backgroundColor: getRatingColor(movie.rating)
                    }}>
                      {movie.rating}
                    </div>
                    {index < 3 && (
                      <div style={styles.premiumTag}>PREMIUM</div>
                    )}
                  </div>
                  <div style={styles.movieInfo}>
                    <h4 style={styles.movieTitle}>{movie.title}</h4>
                    <p style={styles.movieYear}>{movie.year}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Trending Movies Section */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>🔥 Trending</h3>
            <a href="#" style={styles.viewAll}>View All →</a>
          </div>
          
          <div style={styles.movieGrid}>
            {movies.slice(5, 15).map((movie, index) => (
              <Link key={index} href={`/watch/${movie._id}`} style={{ textDecoration: 'none' }}>
                <div style={styles.movieCard}>
                  <div style={styles.posterContainer}>
                    <img 
                      src={movie.poster || 'https://via.placeholder.com/300x450'}
                      alt={movie.title}
                      style={styles.poster}
                      loading="lazy"
                    />
                    <div style={styles.ratingBadge} style={{
                      ...styles.ratingBadge,
                      backgroundColor: getRatingColor(movie.rating)
                    }}>
                      {movie.rating}
                    </div>
                  </div>
                  <div style={styles.movieInfo}>
                    <h4 style={styles.movieTitle}>{movie.title}</h4>
                    <p style={styles.movieYear}>{movie.year}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Popular Movies Section */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>📈 Popular</h3>
            <a href="#" style={styles.viewAll}>View All →</a>
          </div>
          
          <div style={styles.movieGrid}>
            {movies.slice(10, 20).map((movie, index) => (
              <Link key={index} href={`/watch/${movie._id}`} style={{ textDecoration: 'none' }}>
                <div style={styles.movieCard}>
                  <div style={styles.posterContainer}>
                    <img 
                      src={movie.poster || 'https://via.placeholder.com/300x450'}
                      alt={movie.title}
                      style={styles.poster}
                      loading="lazy"
                    />
                    <div style={styles.ratingBadge} style={{
                      ...styles.ratingBadge,
                      backgroundColor: getRatingColor(movie.rating)
                    }}>
                      {movie.rating}
                    </div>
                  </div>
                  <div style={styles.movieInfo}>
                    <h4 style={styles.movieTitle}>{movie.title}</h4>
                    <p style={styles.movieYear}>{movie.year}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerLinks}>
            <a href="#" style={styles.footerLink}>Home</a>
            <a href="#" style={styles.footerLink}>Movies</a>
            <a href="#" style={styles.footerLink}>TV Shows</a>
            <a href="#" style={styles.footerLink}>Terms</a>
            <a href="#" style={styles.footerLink}>Privacy</a>
            <a href="#" style={styles.footerLink}>Contact</a>
          </div>
          <p style={styles.copyright}>© 2024 SURFIX. All rights reserved.</p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Styles object
const styles = {
  container: {
    backgroundColor: '#0f0f0f',
    minHeight: '100vh',
    color: '#fff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  loadingContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
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
  loadingText: {
    fontSize: '18px',
  },
  errorContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#0f0f0f',
    color: 'white',
  },
  retryButton: {
    background: '#6b46c1',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '20px',
  },
  header: {
    background: 'linear-gradient(90deg, #1a1a1a 0%, #2d1b3a 100%)',
    padding: '15px 20px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  headerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: '24px',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: 0,
  },
  nav: {
    display: 'flex',
    gap: '30px',
    '@media (max-width: 768px)': {
      display: 'none',
    },
  },
  navLink: {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '16px',
    opacity: 0.8,
    transition: 'opacity 0.2s',
  },
  searchButton: {
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '20px',
    cursor: 'pointer',
  },
  hero: {
    background: 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.9)), url(https://image.tmdb.org/t/p/original/wwemzKWzjKYJFfCeiB57q3r4Bcm.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    height: '400px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  heroContent: {
    maxWidth: '600px',
    padding: '0 20px',
  },
  heroTitle: {
    fontSize: '48px',
    marginBottom: '10px',
    '@media (max-width: 768px)': {
      fontSize: '32px',
    },
  },
  heroSubtitle: {
    fontSize: '20px',
    opacity: 0.8,
    marginBottom: '30px',
  },
  heroButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    padding: '15px 40px',
    borderRadius: '30px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  main: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  section: {
    marginBottom: '60px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  premiumBadge: {
    background: 'linear-gradient(135deg, #f5b042 0%, #f5a623 100%)',
    color: '#000',
    fontSize: '12px',
    padding: '4px 8px',
    borderRadius: '4px',
    fontWeight: 'bold',
  },
  viewAll: {
    color: '#6b46c1',
    textDecoration: 'none',
    fontSize: '14px',
  },
  movieGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '15px',
    '@media (min-width: 1024px)': {
      gridTemplateColumns: 'repeat(6, 1fr)',
    },
  },
  movieCard: {
    cursor: 'pointer',
    transition: 'transform 0.2s',
    borderRadius: '8px',
    overflow: 'hidden',
    background: '#1a1a1a',
  },
  posterContainer: {
    position: 'relative',
    aspectRatio: '2/3',
  },
  poster: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  ratingBadge: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '14px',
    color: 'white',
    backgroundColor: '#4caf50',
    border: '2px solid white',
  },
  premiumTag: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'linear-gradient(135deg, #f5b042 0%, #f5a623 100%)',
    color: '#000',
    fontSize: '10px',
    padding: '4px 6px',
    borderRadius: '4px',
    fontWeight: 'bold',
  },
  movieInfo: {
    padding: '10px',
  },
  movieTitle: {
    margin: '0 0 5px 0',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#fff',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  movieYear: {
    margin: 0,
    fontSize: '12px',
    color: '#999',
  },
  footer: {
    background: '#1a1a1a',
    padding: '40px 20px 20px',
    marginTop: '60px',
  },
  footerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
  },
  footerLinks: {
    display: 'flex',
    justifyContent: 'center',
    gap: '30px',
    flexWrap: 'wrap',
    marginBottom: '20px',
  },
  footerLink: {
    color: '#999',
    textDecoration: 'none',
    fontSize: '14px',
  },
  copyright: {
    textAlign: 'center',
    color: '#666',
    fontSize: '12px',
    margin: 0,
  },
};
