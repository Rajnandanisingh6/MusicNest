import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';

const COVER_PALETTES = ['grad-1', 'grad-2', 'grad-3', 'grad-4', 'grad-5'];

function coverPaletteFor(title = '') {
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash = (hash * 31 + title.charCodeAt(i)) >>> 0;
  return COVER_PALETTES[hash % COVER_PALETTES.length];
}

export default function Home() {
  const [musics, setMusics] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const { user } = useAuth();
  const location = useLocation();

  const audioRefs = useRef({});
  const [playingId, setPlayingId] = useState(null);

  useEffect(() => {
    if (location.state?.justAuthed && user) {
      setToast({ type: 'welcome', message: `Welcome, ${user.username}! 🎵` });
      const t = setTimeout(() => setToast(null), 3200);
      window.history.replaceState({}, document.title);
      return () => clearTimeout(t);
    }
  }, [location.state, user]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchMusics() {
      try {
        const res = await api.get('/music');
        setMusics(res.data.musics);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load music');
      } finally {
        setLoading(false);
      }
    }
    fetchMusics();

    api.get('/music/trending?limit=5')
      .then((res) => setTrending(res.data.musics))
      .catch(() => {});
  }, [user]);

  function showToast(type, message) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2800);
  }

  function toggleAudio(id) {
    const audio = audioRefs.current[id];
    if (!audio) return;

    if (playingId === id) {
      audio.pause();
      setPlayingId(null);
    } else {
      Object.values(audioRefs.current).forEach((a) => a && a.pause());
      audio.play();
    }
  }

  async function handleLike(id) {
    setMusics((prev) =>
      prev.map((m) => {
        if ((m.id || m._id) !== id) return m;
        const nowLiked = !m.isLiked;
        return { ...m, isLiked: nowLiked, likeCount: (m.likeCount || 0) + (nowLiked ? 1 : -1) };
      })
    );

    try {
      await api.post(`/music/${id}/like`);
    } catch (err) {
      setMusics((prev) =>
        prev.map((m) => {
          if ((m.id || m._id) !== id) return m;
          const revertLiked = !m.isLiked;
          return { ...m, isLiked: revertLiked, likeCount: (m.likeCount || 0) + (revertLiked ? 1 : -1) };
        })
      );
      showToast('error', 'Could not update like');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this track? This cannot be undone.')) return;

    setDeletingId(id);
    try {
      await api.delete(`/music/${id}`);
      setMusics((prev) => prev.filter((m) => (m.id || m._id) !== id));
      showToast('success', 'Track deleted');
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to delete track');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="hero">
        <div>
          <span className="eyebrow">{user ? `Welcome back, ${user.username}` : 'Your library'}</span>
          <h1>Music Library</h1>
          <p>Where every artist finds their audience, one track at a time.</p>
        </div>
        <div className="hero-waveform" aria-hidden="true">
          {[14, 24, 10, 30, 18, 26, 12].map((h, i) => (
            <span key={i} style={{ height: `${h}px`, animationDelay: `${i * 0.12}s` }} />
          ))}
        </div>
      </div>

      {!user && <p className="hint">Login to see the music library.</p>}
      {user && loading && <div className="spinner" aria-label="Loading" />}
      {user && !loading && error && <p className="error">{error}</p>}

      {user && !loading && !error && (
        <>
          {trending.length > 0 && (
            <section className="trending-rail">
              <h2 className="section-title">🔥 Trending now</h2>
              <div className="trending-scroll">
                {trending.map((t) => (
                  <div key={t._id} className="trending-chip">
                    {t.coverImage?.url ? (
                      <img src={t.coverImage.url} alt={t.title} className="trending-thumb" />
                    ) : (
                      <span className={`trending-thumb cover-fallback ${coverPaletteFor(t.title)}`}>♪</span>
                    )}
                    <div>
                      <p className="trending-title">{t.title}</p>
                      <p className="trending-meta">by {t.artist?.username} · {t.likes.length} likes</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {musics.length === 0 ? (
            <div className="empty-state">No music uploaded yet — check back soon.</div>
          ) : (
            <div className="grid">
              {musics.map((music, index) => {
                const id = music.id || music._id;
                const isOwner = user.role === 'artist' && music.artist?._id === user.id;
                const isPlaying = playingId === id;
                return (
                  <div key={id} className="card" style={{ animationDelay: `${Math.min(index * 0.06, 0.6)}s` }}>
                    <div className="card-top">
                      {music.coverImage?.url ? (
                        <button
                          type="button"
                          className={`cover-btn ${isPlaying ? 'spinning' : ''}`}
                          onClick={() => toggleAudio(id)}
                          aria-label={isPlaying ? 'Pause' : 'Play'}
                        >
                          <img src={music.coverImage.url} alt={music.title} className="cover-thumb" />
                          <span className="vinyl-hole" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          className={`cover-btn cover-fallback ${coverPaletteFor(music.title)} ${isPlaying ? 'spinning' : ''}`}
                          onClick={() => toggleAudio(id)}
                          aria-label={isPlaying ? 'Pause' : 'Play'}
                        >
                          <span className="cover-fallback-icon">{isPlaying ? '⏸' : '♪'}</span>
                          <span className="vinyl-hole" />
                        </button>
                      )}
                      <div>
                        <h3>{music.title}</h3>
                        <p className="muted">
                          by {music.artist?.username}
                          {isPlaying && (
                            <span className="eq-bars" aria-hidden="true">
                              <span /><span /><span />
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <audio
                      ref={(el) => (audioRefs.current[id] = el)}
                      controls
                      src={music.uri}
                      onPlay={() => {
                        if (playingId !== id) {
                          setPlayingId(id);
                          api.post(`/music/${id}/play`).catch(() => {});
                          setMusics((prev) =>
                            prev.map((m) =>
                              (m.id || m._id) === id ? { ...m, playCount: (m.playCount || 0) + 1 } : m
                            )
                          );
                        }
                      }}
                      onPause={() => setPlayingId((prev) => (prev === id ? null : prev))}
                      onEnded={() => setPlayingId((prev) => (prev === id ? null : prev))}
                    />
                    <div className="card-stats">
                      <button
                        type="button"
                        className={`like-btn ${music.isLiked ? 'liked' : ''}`}
                        onClick={() => handleLike(id)}
                      >
                        <span className="like-icon">{music.isLiked ? '❤️' : '🤍'}</span> {music.likeCount || 0}
                      </button>
                      <span className="play-count">▶ {music.playCount || 0} plays</span>
                    </div>
                    {isOwner && (
                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() => handleDelete(id)}
                        disabled={deletingId === id}
                      >
                        {deletingId === id ? 'Deleting...' : 'Delete'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
    </div>
  );
}