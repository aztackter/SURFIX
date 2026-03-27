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
  const [hoveredId, setHoveredId] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const heroMovie = movies[0] || null;

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

  return (
    <>
      <Head>
        <title>SURFIX</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className="app">
        <aside className="sidebar">
          <div className="sidebar-logo">
            <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26">
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1 14.5v-9l7 4.5-7 4.5z"/>
            </svg>
            <span>SURFIX</span>
          </div>
          <nav className="sidebar-nav">
            <a href="#" className="nav-item nav-active">
              <svg viewBox="0 0 24 24" fill="currentColor" width="17" height="17"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
              Home
            </a>
            <a href="#" className="nav-item">
              <svg viewBox="0 0 24 24" fill="currentColor" width="17" height="17"><path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/></svg>
              Movies
            </a>
            <a href="#" className="nav-item">
              <svg viewBox="0 0 24 24" fill="currentColor" width="17" height="17"><path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z"/></svg>
              TV Shows
            </a>
            <a href="#" className="nav-item">
              <svg viewBox="0 0 24 24" fill="currentColor" width="17" height="17"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>
              Watchlist
            </a>
          </nav>
        </aside>

        <main className="content">
          <div className="topbar">
            <div className={`search-box ${searchFocused ? 'focused' : ''}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15" style={{color:'#666',flexShrink:0}}>
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                className="search-input"
                type="text"
                placeholder="Search movies and shows..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              {search && <button className="clear-btn" onClick={() => setSearch('')}>✕</button>}
            </div>
          </div>

          {!debouncedSearch && heroMovie && !loading && (
            <div className="hero">
              <div className="hero-bg" style={{backgroundImage:`url(${heroMovie.poster})`}} />
              <div className="hero-grad" />
              <div className="hero-body">
                <p className="hero-label">Featured Film</p>
                <h1 className="hero-title">{heroMovie.title}</h1>
                <p className="hero-sub">{heroMovie.year}{heroMovie.rating > 0 ? ` · ★ ${Number(heroMovie.rating).toFixed(1)}` : ''}</p>
                {heroMovie.overview && <p className="hero-overview">{heroMovie.overview.slice(0, 150)}{heroMovie.overview.length > 150 ? '…' : ''}</p>}
                <div className="hero-btns">
                  <Link href={`/watch/${heroMovie._id}`} className="btn-play">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M8 5v14l11-7z"/></svg>
                    Play
                  </Link>
                  <button className="btn-info">More Info</button>
                </div>
              </div>
            </div>
          )}

          <div className="section-header">
            <h2 className="section-title">{debouncedSearch ? `Results for "${debouncedSearch}"` : 'All Movies'}</h2>
            {pagination && <span className="section-count">{pagination.totalCount.toLocaleString()} titles</span>}
          </div>

          {loading ? (
            <div className="grid">
              {Array.from({length:20}).map((_,i) => (
                <div key={i} className="skeleton" style={{animationDelay:`${i*0.04}s`}} />
              ))}
            </div>
          ) : error ? (
            <div className="state">
              <p className="state-text">{error}</p>
              <button onClick={fetchMovies} className="retry-btn">Try Again</button>
            </div>
          ) : movies.length === 0 ? (
            <div className="state"><p className="state-text">No results found.</p></div>
          ) : (
            <div className="grid">
              {movies.map((movie, i) => (
                <Link
                  key={movie._id}
                  href={`/watch/${movie._id}`}
                  className="card-link"
                  onMouseEnter={() => setHoveredId(movie._id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{animationDelay:`${(i%20)*0.03}s`}}
                >
                  <div className={`card ${hoveredId === movie._id ? 'card-hover' : ''}`}>
                    <div className="poster-wrap">
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="poster"
                        loading="lazy"
                        onError={(e) => { e.target.src='https://placehold.co/300x450/1c1c1e/3a3a3c?text=No+Image'; }}
                      />
                      <div className="card-overlay">
                        <div className="play-circle">
                          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" style={{marginLeft:2}}><path d="M8 5v14l11-7z"/></svg>
                        </div>
                      </div>
                      {movie.rating > 0 && (
                        <div className="rating-badge">★ {Number(movie.rating).toFixed(1)}</div>
                      )}
                    </div>
                    <div className="card-info">
                      <p className="card-title">{movie.title}</p>
                      <p className="card-year">{movie.year}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {pagination && pagination.totalPages > 1 && !loading && (
            <div className="pagination">
              <button className="page-btn" onClick={() => setPage(p=>p-1)} disabled={!pagination.hasPrevPage}>← Previous</button>
              <span className="page-info">{pagination.page} of {pagination.totalPages}</span>
              <button className="page-btn" onClick={() => setPage(p=>p+1)} disabled={!pagination.hasNextPage}>Next →</button>
            </div>
          )}
        </main>
      </div>

      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#000;color:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;-webkit-font-smoothing:antialiased}
        a{text-decoration:none;color:inherit}

        .app{display:flex;min-height:100vh}

        .sidebar{width:210px;flex-shrink:0;background:#111;border-right:1px solid rgba(255,255,255,0.07);display:flex;flex-direction:column;padding:24px 0;position:sticky;top:0;height:100vh}
        .sidebar-logo{display:flex;align-items:center;gap:10px;padding:0 20px 32px;color:#fff;font-size:19px;font-weight:700;letter-spacing:-0.5px}
        .sidebar-nav{display:flex;flex-direction:column;gap:2px;padding:0 10px}
        .nav-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;font-size:13.5px;font-weight:500;color:#666;transition:background 0.15s,color 0.15s}
        .nav-item:hover{background:rgba(255,255,255,0.07);color:#f5f5f7}
        .nav-active{background:rgba(255,255,255,0.1)!important;color:#f5f5f7!important}

        .content{flex:1;min-width:0}

        .topbar{padding:18px 32px;position:sticky;top:0;z-index:50;background:rgba(0,0,0,0.85);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,0.06)}
        .search-box{display:flex;align-items:center;gap:8px;background:rgba(255,255,255,0.09);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:8px 14px;max-width:400px;transition:background 0.2s,border-color 0.2s}
        .focused{background:rgba(255,255,255,0.13);border-color:rgba(255,255,255,0.18)}
        .search-input{flex:1;background:transparent;border:none;outline:none;color:#f5f5f7;font-size:14px;font-family:inherit}
        .search-input::placeholder{color:#555}
        .clear-btn{background:none;border:none;color:#555;cursor:pointer;font-size:11px;padding:0 2px}

        .hero{position:relative;height:460px;overflow:hidden}
        .hero-bg{position:absolute;inset:0;background-size:cover;background-position:center 20%;filter:blur(3px) brightness(0.35);transform:scale(1.06)}
        .hero-grad{position:absolute;inset:0;background:linear-gradient(to right,rgba(0,0,0,0.95) 0%,rgba(0,0,0,0.5) 60%,transparent 100%),linear-gradient(to top,rgba(0,0,0,0.7) 0%,transparent 50%)}
        .hero-body{position:relative;z-index:2;height:100%;display:flex;flex-direction:column;justify-content:flex-end;padding:0 40px 44px;max-width:500px}
        .hero-label{font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#0A84FF;margin-bottom:10px}
        .hero-title{font-size:40px;font-weight:700;letter-spacing:-1px;line-height:1.05;color:#fff;margin-bottom:8px}
        .hero-sub{font-size:13px;color:#777;margin-bottom:10px}
        .hero-overview{font-size:13.5px;color:#999;line-height:1.6;margin-bottom:22px}
        .hero-btns{display:flex;gap:10px}
        .btn-play{display:flex;align-items:center;gap:6px;background:#fff;color:#000;border:none;padding:10px 22px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;transition:background 0.15s}
        .btn-play:hover{background:#e5e5e5}
        .btn-info{background:rgba(255,255,255,0.18);color:#fff;border:none;padding:10px 22px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;backdrop-filter:blur(10px);transition:background 0.15s}
        .btn-info:hover{background:rgba(255,255,255,0.25)}

        .section-header{display:flex;align-items:baseline;justify-content:space-between;padding:28px 32px 14px}
        .section-title{font-size:20px;font-weight:700;letter-spacing:-0.4px}
        .section-count{font-size:12px;color:#555}

        @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}

        .grid{padding:0 32px 32px;display:grid;grid-template-columns:repeat(auto-fill,minmax(155px,1fr));gap:18px}
        .skeleton{border-radius:12px;aspect-ratio:2/3;background:linear-gradient(90deg,#1c1c1e 25%,#2c2c2e 50%,#1c1c1e 75%);background-size:1200px 100%;animation:shimmer 1.5s infinite}
        .card-link{display:block;animation:fadeIn 0.3s ease both}
        .card{border-radius:12px;overflow:hidden;background:#1c1c1e;transition:transform 0.25s cubic-bezier(0.34,1.56,0.64,1);cursor:pointer}
        .card-hover{transform:scale(1.05)}
        .poster-wrap{position:relative;aspect-ratio:2/3;overflow:hidden}
        .poster{width:100%;height:100%;object-fit:cover;display:block;transition:transform 0.35s ease}
        .card-hover .poster{transform:scale(1.07)}
        .card-overlay{position:absolute;inset:0;background:rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.2s}
        .card-hover .card-overlay{opacity:1}
        .play-circle{width:46px;height:46px;border-radius:50%;background:rgba(255,255,255,0.92);display:flex;align-items:center;justify-content:center;color:#000}
        .rating-badge{position:absolute;bottom:8px;right:8px;background:rgba(0,0,0,0.72);backdrop-filter:blur(8px);color:#FFD60A;font-size:11px;font-weight:600;padding:3px 8px;border-radius:6px}
        .card-info{padding:10px 12px 13px}
        .card-title{font-size:13px;font-weight:500;color:#f5f5f7;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:3px}
        .card-year{font-size:11px;color:#555}

        .state{text-align:center;padding:80px 20px}
        .state-text{color:#555;font-size:15px;margin-bottom:20px}
        .retry-btn{background:#0A84FF;color:#fff;border:none;padding:10px 24px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit}

        .pagination{display:flex;justify-content:center;align-items:center;gap:16px;padding:8px 32px 48px}
        .page-btn{background:rgba(255,255,255,0.08);color:#f5f5f7;border:none;padding:10px 22px;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer;font-family:inherit;transition:background 0.15s}
        .page-btn:hover:not(:disabled){background:rgba(255,255,255,0.14)}
        .page-btn:disabled{opacity:0.2;cursor:not-allowed}
        .page-info{font-size:13px;color:#555}

        @media(max-width:768px){
          .sidebar{display:none}
          .grid{padding:0 16px 24px;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:12px}
          .section-header{padding:20px 16px 10px}
          .topbar{padding:14px 16px}
          .hero{height:340px}
          .hero-title{font-size:26px}
          .hero-body{padding:0 20px 32px}
        }
      `}</style>
    </>
  );
}
