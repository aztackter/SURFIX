import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { FiArrowLeft, FiAlertCircle } from 'react-icons/fi';

export default function WatchPage() {
  const router = useRouter();
  const { id } = router.query;
  const [movie, setMovie] = useState(null);
  const [selectedServer, setSelectedServer] = useState(null);
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
        setMovie(data);
        // Auto-select first working server
        if (data.embeds && data.embeds.length > 0) {
          setSelectedServer(data.embeds[0]);
        }
      }
      setLoading(false);
    } catch (error) {
      setError('Failed to load movie');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <FiAlertCircle className="text-6xl text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl mb-4">{error || 'Movie not found'}</h1>
          <Link href="/" className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Head>
        <title>{movie.title} - SURFIX</title>
      </Head>

      {/* Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black to-transparent p-4">
        <div className="container mx-auto flex items-center">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full px-4 py-2"
          >
            <FiArrowLeft />
            Back
          </button>
          
          <h1 className="ml-4 text-xl font-semibold truncate">
            {movie.title}
          </h1>
        </div>
      </div>

      {/* Video Player */}
      <div className="w-full" style={{ height: 'calc(100vh - 80px)' }}>
        {selectedServer && (
          <iframe
            src={selectedServer.embedUrl}
            className="w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        )}
      </div>

      {/* Server Selection Bar */}
      {movie.embeds && movie.embeds.length > 1 && (
        <div className="bg-gray-900 border-t border-gray-800 p-4">
          <div className="container mx-auto">
            <h3 className="text-sm text-gray-400 mb-2">Select Server:</h3>
            <div className="flex flex-wrap gap-2">
              {movie.embeds.map((server, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedServer(server)}
                  className={`px-4 py-2 rounded-lg transition ${
                    selectedServer === server
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  }`}
                >
                  {server.provider} {server.quality && `(${server.quality})`}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Movie Info */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-6">
          <img 
            src={`https://image.tmdb.org/t/p/w200${movie.posterPath}`}
            alt={movie.title}
            className="w-32 rounded-lg hidden md:block"
          />
          <div>
            <h2 className="text-2xl font-bold mb-2">{movie.title}</h2>
            <p className="text-gray-400 mb-4">{movie.overview}</p>
            <div className="flex gap-4">
              <span className="bg-gray-800 px-3 py-1 rounded-full text-sm">
                Rating: {movie.voteAverage}/10
              </span>
              <span className="bg-gray-800 px-3 py-1 rounded-full text-sm">
                {movie.releaseDate?.split('-')[0]}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
