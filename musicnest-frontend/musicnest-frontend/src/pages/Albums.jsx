import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Albums() {
  const [albums, setAlbums] = useState([]);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    async function fetchAlbums() {
      try {
        const res = await api.get('/music/albums');
        setAlbums(res.data.albums);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load albums');
      }
    }
    fetchAlbums();
  }, [user]);

  return (
    <div>
      <div className="hero">
        <span className="eyebrow">Collections</span>
        <h1>Albums</h1>
        <p>Browse tracks grouped together by artists.</p>
      </div>

      {!user && <p className="hint">Login to see albums.</p>}
      {user && error && <p className="error">{error}</p>}

      {user && !error && (
        <>
          {albums.length === 0 ? (
            <div className="empty-state">No albums yet.</div>
          ) : (
            <div className="grid">
              {albums.map((album) => (
                <Link key={album.id || album._id} to={`/albums/${album.id || album._id}`} className="card">
                  <div className="card-top">
                    <div className="note-badge">💿</div>
                    <div>
                      <h3>{album.title}</h3>
                      <p className="muted">by {album.artist?.username}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
