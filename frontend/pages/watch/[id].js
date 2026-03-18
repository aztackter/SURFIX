import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function WatchPage() {
  const router = useRouter();
  const { id } = router.query;
  const [movie, setMovie] = useState(null);
  const [selectedServer, setSelectedServer] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetch(`/api/movies/${id}`)
        .then(res => res.json())
        .then(data => {
          setMovie(data);
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#000',
        color: 'white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{
          border: '4px solid rgba(255,255,255,0.3)',
          borderTop: '4px solid white',
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

  if (!movie) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#000',
        color: 'white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <p>Movie not found</p>
      </div>
    );
  }

  const embedServers = [
    `https://vidsrc.cc/v2/embed/movie/${movie.imdbId}`,
    `https://2embed.cc/embed/${movie.imdbId}`,
    `https://vidsrc.to/embed/movie/${movie.imdbId}`,
    `https://multiembed.mov/?video_id=${movie.imdbId}`,
    `https://moviesapi.club/movie/${movie.imdbId}`
  ].filter(Boolean);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      color: 'white'
    }}>
      <Head>
        <title>{movie.title} - SURFIX</title>
      </Head>

      {/* Back button */}
      <div style={{
        position: 'fixed',
        top: '10px',
        left: '10px',
        zIndex: 1000
      }}>
        <button 
          onClick={() => router.back()}
          style={{
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            fontSize: '20px',
            cursor: 'pointer'
          }}
        >←</button>
      </div>

      {/* Video Player */}
      <div style={{
        width: '100%',
        height: '60vh',
        background: '#111'
      }}>
        <iframe
          src={embedServers[selectedServer]}
          style={{
            width: '100%',
            height: '100%',
            border: 'none'
          }}
          allowFullScreen
        />
      </div>

      {/* Server Selection */}
      <div style={{
        padding: '15px',
        background: '#111'
      }}>
        <h3 style={{ margin: '0 0 10px 0' }}>Servers:</h3>
        <div style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          padding: '5px 0'
        }}>
          {embedServers.map((server, index) => (
            <button
              key={index}
              onClick={() => setSelectedServer(index)}
              style={{
                background: selectedServer === index ? '#4CAF50' : '#333',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Server {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Movie Info */}
      <div style={{
        padding: '20px'
      }}>
        <h1 style={{ margin: '0 0 10px 0' }}>{movie.title}</h1>
        <p style={{ color: '#ccc' }}>{movie.overview}</p>
        <div style={{
          display: 'flex',
          gap: '10px',
          marginTop: '10px'
        }}>
          <span style={{
            background: '#333',
            padding: '5px 10px',
            borderRadius: '5px',
            fontSize: '14px'
          }}>⭐ {movie.rating}/10</span>
          <span style={{
            background: '#333',
            padding: '5px 10px',
            borderRadius: '5px',
            fontSize: '14px'
          }}>{movie.year}</span>
        </div>
      </div>
    </div>
  );
}
