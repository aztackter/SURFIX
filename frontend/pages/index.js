import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const res = await fetch('/api/movies');
      const data = await res.json();
      
      // Split into sections (simulating different categories)
      setMovies(data.movies || []);
      setTrending(data.movies?.slice(0, 8) || []);
      setPopular(data.movies?.slice(8, 16) || []);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  // Star rating component
  const Rating = ({ value }) => {
    const percentage = (value / 10) * 100;
    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: 'rgba(0,0,0,0.6)',
        padding: '2px 6px',
        borderRadius: '4px',
        fontSize: '12px',
        color: '#FFD700'
      }}>
        <span style={{ marginRight: '2px' }}>★</span>
        {value.toFixed(1)}
      </div>
    );
  };

  // Premium badge
  const PremiumBadge = () => (
    <span style={{
      background: '#E50914',
      color: 'white',
      fontSize: '10px',
      padding: '2px 6px',
      borderRadius: '4px',
      fontWeight: 'bold',
      textTransform: 'uppercase'
    }}>
      Premium
    </span>
  );

  // Movie Card Component (mappl.tv style)
  const MovieCard = ({ movie, index }) => {
    const posterUrl = movie.posterPath 
      ? `https://image.tmdb.org/t/p/w300${movie.posterPath}`
      : `https://via.placeholder.com/300x450/1A1E24/FFFFFF?text=${movie.title.charAt(0)}`;

    return (
      <Link href={`/watch/${movie._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{
          position: 'relative',
          borderRadius: '8px',
          overflow: 'hidden',
          background: '#1A1E24',
          transition: 'transform 0.2s',
          cursor: 'pointer',
          height: '100%'
        }}>
          {/* Poster Image */}
          <img 
            src={posterUrl}
            alt={movie.title}
            style={{
              width: '100%',
              aspectRatio: '2/3',
              objectFit: 'cover',
              display: 'block'
            }}
          />

          {/* Rating Badge (top left like mappl.tv) */}
          {movie.voteAverage && (
            <div style={{
              position: 'absolute',
              top: '8px',
              left: '8px',
              zIndex: 2
            }}>
              <Rating value={movie.voteAverage} />
            </div>
          )}

          {/* Premium Badge (top right like mappl.tv) */}
          {index % 3 === 0 && (
            <div style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              zIndex: 2
            }}>
              <PremiumBadge />
            </div>
          )}

          {/* Title Overlay (bottom like mappl.tv) */}
          <div style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
            padding: '20px 10px 10px 10px',
            color: 'white'
          }}>
            <h3 style={{
              margin: '0',
              fontSize: '14px',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {movie.title}
            </h3>
            <p style={{
              margin: '4px 0 0 0',
              fontSize: '12px',
              color: '#999'
            }}>
              {movie.releaseDate?.split('-')[0] || '2024'}
            </p>
          </div>
        </div>
      </Link>
    );
  };

  // Section Header (like mappl.tv)
  const SectionHeader = ({ title, seeAll = true }) => (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px'
    }}>
      <h2 style={{
        fontSize: '20px',
        fontWeight: '600',
        color: 'white',
        margin: 0
      }}>{title}</h2>
      {seeAll && (
        <span style={{
          color: '#E50914',
          fontSize: '14px',
          cursor: 'pointer'
        }}>See All →</span>
      )}
    </div>
  );

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0A0C0F',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{
          border: '3px solid #1A1E24',
          borderTop: '3px solid #E50914',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0C0F',
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    }}>
      <Head>
        <title>SURFIX - Watch Free Movies Online</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      {/* Header/Navbar (like mappl.tv) */}
      <header style={{
        background: '#0F1217',
        padding: '12px 16px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: '1px solid #1A1E24'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <h1 style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #fff 0%, #E50914 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>SURFIX</h1>
          
          <div style={{ display: 'flex', gap: '20px' }}>
            <span style={{ color: '#E50914', fontWeight: '500' }}>Movies</span>
            <span style={{ color: '#999' }}>TV Shows</span>
            <span style={{ color: '#999' }}>My List</span>
          </div>
        </div>
      </header>

      {/* Hero Section (featured content) */}
      {movies.length > 0 && (
        <div style={{
          background: `linear-gradient(to bottom, rgba(10,12,15,0.8), rgba(10,12,15,1)), url(https://image.tmdb.org/t/p/original${movies[0]?.backdropPath || ''})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: '60px 16px 40px 16px',
          marginBottom: '30px'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', margin: '0 0 8px 0' }}>{movies[0]?.title}</h2>
            <p style={{ color: '#999', margin: '0 0 16px 0', maxWidth: '600px' }}>
              {movies[0]?.overview?.substring(0, 120)}...
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button style={{
                background: '#E50914',
                color: 'white',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '4px',
                fontWeight: 'bold',
                fontSize: '16px'
              }}>▶ Watch Now</button>
              <button style={{
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '4px',
                fontSize: '16px'
              }}>+ Add to List</button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px 40px 16px' }}>

        {/* Trending Now Section */}
        <section style={{ marginBottom: '40px' }}>
          <SectionHeader title="Trending Now" />
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '12px'
          }}>
            {trending.map((movie, index) => (
              <MovieCard key={movie._id} movie={movie} index={index} />
            ))}
          </div>
        </section>

        {/* Popular Movies Section */}
        <section style={{ marginBottom: '40px' }}>
          <SectionHeader title="Popular Movies" />
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '12px'
          }}>
            {popular.map((movie, index) => (
              <MovieCard key={movie._id} movie={movie} index={index + 8} />
            ))}
          </div>
        </section>

        {/* New Releases Section */}
        <section style={{ marginBottom: '40px' }}>
          <SectionHeader title="New Releases" />
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '12px'
          }}>
            {movies.slice(16, 24).map((movie, index) => (
              <MovieCard key={movie._id} movie={movie} index={index + 16} />
            ))}
          </div>
        </section>

        {/* Recommended Section */}
        <section style={{ marginBottom: '40px' }}>
          <SectionHeader title="Recommended For You" />
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '12px'
          }}>
            {movies.slice(24, 32).map((movie, index) => (
              <MovieCard key={movie._id} movie={movie} index={index + 24} />
            ))}
          </div>
        </section>

        {/* Categories/Genres (like mappl.tv) */}
        <section style={{ marginBottom: '40px' }}>
          <SectionHeader title="Browse by Genre" seeAll={false} />
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px'
          }}>
            {['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller', 'Documentary', 'Animation'].map(genre => (
              <div key={genre} style={{
                background: '#1A1E24',
                padding: '12px',
                borderRadius: '8px',
                textAlign: 'center',
                fontSize: '14px',
                color: '#fff'
              }}>
                {genre}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer (like mappl.tv) */}
      <footer style={{
        background: '#0F1217',
        borderTop: '1px solid #1A1E24',
        padding: '30px 16px',
        marginTop: '40px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '20px',
            marginBottom: '30px'
          }}>
            <div>
              <h4 style={{ margin: '0 0 10px 0', color: '#fff' }}>SURFIX</h4>
              <p style={{ color: '#666', fontSize: '13px', margin: '0' }}>
                Your ultimate destination for free movies and TV shows.
              </p>
            </div>
            <div>
              <h4 style={{ margin: '0 0 10px 0', color: '#fff' }}>Quick Links</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#666', fontSize: '13px' }}>
                <li style={{ marginBottom: '8px' }}>About Us</li>
                <li style={{ marginBottom: '8px' }}>Contact</li>
                <li style={{ marginBottom: '8px' }}>Terms of Service</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
          </div>
          <div style={{
            textAlign: 'center',
            color: '#444',
            fontSize: '12px',
            borderTop: '1px solid #1A1E24',
            paddingTop: '20px'
          }}>
            © 2024 SURFIX. All rights reserved.
          </div>
        </div>
      </footer>

      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          background: #0A0C0F;
        }
        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}
