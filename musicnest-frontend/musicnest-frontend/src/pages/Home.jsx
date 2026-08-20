import { useEffect, useRef, useState } from 'react';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Home() {
  const [musics, setMusics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  // Keep one <audio> DOM reference per track, keyed by its id.
  // This lets us play/pause a specific track from the note-badge button.
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
      // stop any other track that might be playing first
      Object.values(audioRefs.current).forEach((a) => a && a.pause());
      audio.play();
      setPlayingId(id);
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
                return (
                  <div key={id} className="card">
                    <div className="card-top">
                      <button
                        type="button"
                        className="note-badge"
                        onClick={() => toggleAudio(id)}
                        aria-label={playingId === id ? 'Pause' : 'Play'}
                      >
                        {playingId === id ? '⏸' : '🎵'}
                      </button>
                      <div>
                        <h3>{music.title}</h3>
                        <p className="muted">by {music.artist?.username}</p>
                      </div>
                    </div>
                    <audio
                      ref={(el) => (audioRefs.current[id] = el)}
                      controls
                      src={music.uri}
                      onPause={() => setPlayingId((prev) => (prev === id ? null : prev))}
                      onEnded={() => setPlayingId((prev) => (prev === id ? null : prev))}
                    />
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