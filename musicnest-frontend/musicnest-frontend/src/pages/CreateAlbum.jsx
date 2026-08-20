import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function CreateAlbum() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  if (!user) return <p className="hint">Login first.</p>;
  if (user.role !== 'artist') return <p className="hint">Only artists can create albums.</p>;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      // musics starts empty — this backend route doesn't yet expose a way
      // to pick from your own tracks, so the album is created empty for now
      await api.post('/music/album', { title, musics: [] });
      setMessage('Album created successfully!');
      setTitle('');
      setTimeout(() => navigate('/albums'), 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create album');
    }
  }

  return (
    <div className="form-card">
      <h1>Create an album</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Album title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
        <button type="submit">Create album</button>
      </form>
    </div>
  );
}