import { useEffect, useRef, useState } from 'react';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Home() {
  const [musics, setMusics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const { user } = useAuth();

  const audioRefs = useRef({});
  const [playingId, setPlayingId] = useState(null);

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
  }, [user]);

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
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this track? This cannot be undone.')) return;

    setDeletingId(id);
    try {
      await api.delete(`/music/${id}`);
      setMusics((prev) => prev.filter((m) => (m.id || m._id) !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete track');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="hero">
        <span className="eyebrow">Your library</span>
        <h1>Music Library</h1>
        <p>Every track uploaded by artists on MusicNest, ready to stream.</p>
      </div>

      {!user && <p className="hint">Login to see the music library.</p>}
      {user && loading && <p className="hint">Loading...</p>}
      {user && error && <p className="error">{error}</p>}

      {user && !loading && !error && (
        <>
          {musics.length === 0 ? (
            <div className="empty-state">No music uploaded yet — check back soon.</div>
          ) : (
            <div className="grid">
              {musics.map((music) => {
                const id = music.id || music._id;
                const isOwner = user.role === 'artist' && music.artist?._id === user.id;
                return (
                  <div key={id} className="card">
                    <div className="card-top">
                      {music.coverImage ? (
                        <img src={music.coverImage} alt={music.title} className="cover-thumb" />
                      ) : (
                        <button
                          type="button"
                          className="note-badge"
                          onClick={() => toggleAudio(id)}
                          aria-label={playingId === id ? 'Pause' : 'Play'}
                        >
                          {playingId === id ? '⏸' : '🎵'}
                        </button>
                      )}
                      <div>
                        <h3>{music.title}</h3>
                        <p className="muted">by {music.artist?.username}</p>
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
                        {music.isLiked ? '❤️' : '🤍'} {music.likeCount || 0}
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
    </div>
  );
}