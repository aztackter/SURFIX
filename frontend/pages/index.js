import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/movies')
      .then(res => res.json())
      .then(data => {
        setMovies(data.movies || []);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontFamily: 'Arial'
    }}>
      <Head>
        <title>SURFIX - Watch Free Movies</title>
      </Head>

      {/* Header */}
      <div style={{
        background: 'rgba(0,0,0,0.3)',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '48px',
          margin: '0',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}>SURFIX</h1>
        <p style={{ fontSize: '18px', opacity: '0.9' }}>
          Watch Free Movies & TV Shows
        </p>
      </div>

      {/* Movies Grid */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px'
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <div style={{
              border: '4px solid rgba(255,255,255,0.3)',
              borderTop: '4px solid white',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }}></div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '15px'
          }}>
            {movies.map(movie => (
              <Link key={movie._id} href={`/watch/${movie._id}`}>
                <div style={{
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                  <img 
                    src={movie.poster || 'https://via.placeholder.com/300x450?text=No+Poster'}
                    alt={movie.title}
                    style={{
                      width: '100%',
                      height: 'auto',
                      aspectRatio: '2/3',
                      objectFit: 'cover'
                    }}
                  />
                  <div style={{
                    padding: '10px',
                    background: 'rgba(0,0,0,0.7)'
                  }}>
                    <h3 style={{
                      margin: '0 0 5px 0',
                      fontSize: '14px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>{movie.title}</h3>
                    <p style={{
                      margin: '0',
                      fontSize: '12px',
                      opacity: '0.7'
                    }}>{movie.year || '2024'}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
