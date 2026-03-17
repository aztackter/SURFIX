import Link from 'next/link';

export default function MovieCard({ movie }) {
  const posterUrl = movie.posterPath 
    ? `https://image.tmdb.org/t/p/w300${movie.posterPath}`
    : 'https://via.placeholder.com/300x450?text=No+Poster';

  return (
    <Link href={`/watch/${movie._id}`} className="group">
      <div className="relative rounded-lg overflow-hidden hover:scale-105 transition duration-300">
        <img 
          src={posterUrl}
          alt={movie.title}
          className="w-full aspect-[2/3] object-cover"
        />
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
            <div className="bg-red-600 rounded-full p-4">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Available servers badge */}
        {movie.embeds && movie.embeds.length > 0 && (
          <div className="absolute top-2 right-2 bg-red-600 text-xs px-2 py-1 rounded">
            {movie.embeds.length} servers
          </div>
        )}
      </div>
      
      <div className="mt-2">
        <h3 className="font-semibold truncate">{movie.title}</h3>
        <p className="text-sm text-gray-400">
          {movie.releaseDate?.split('-')[0] || 'N/A'}
        </p>
      </div>
    </Link>
  );
}
