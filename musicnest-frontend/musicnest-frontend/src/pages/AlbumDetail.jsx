import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios.js';

export default function AlbumDetail() {
  const { albumId } = useParams();
  const [album, setAlbum] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchAlbum() {
      try {
        const res = await api.get(`/music/albums/${albumId}`);
        setAlbum(res.data.album);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load album');
      }
    }
    fetchAlbum();
  }, [albumId]);

  if (error) return <p className="error">{error}</p>;
  if (!album) return <p className="hint">Loading...</p>;

  return (
    <div>
      <div className="hero">
        <span className="eyebrow">Album</span>
        <h1>{album.title}</h1>
        <p>by {album.artist?.username}</p>
      </div>

      {album.musics.length === 0 ? (
        <div className="empty-state">No tracks in this album yet.</div>
      ) : (
        <div className="grid">
          {album.musics.map((music) => (
            <div key={music._id} className="card">
              <div className="card-top">
                <div className="note-badge">🎵</div>
                <h3>{music.title}</h3>
              </div>
              <audio controls src={music.uri} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
