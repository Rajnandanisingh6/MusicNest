import { useState } from 'react';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Upload() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!user) return <p className="hint">Login first.</p>;
  if (user.role !== 'artist') return <p className="hint">Only artists can upload music.</p>;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!file) {
      setError('Please choose a music file');
      return;
    }

    const MAX_SIZE = 8 * 1024 * 1024; // 8MB
    if (file.size > MAX_SIZE) {
      setError('Music file is too large. Max size is 8MB.');
      return;
    }
    if (coverImage && coverImage.size > MAX_SIZE) {
      setError('Cover image is too large. Max size is 8MB.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('music', file);
    if (coverImage) {
      formData.append('coverImage', coverImage);
    }

    try {
      await api.post('/music/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage('Music uploaded successfully!');
      setTitle('');
      setFile(null);
      setCoverImage(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    }
  }

  return (
    <div className="form-card">
      <h1>Upload a track</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Song title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <label className="field-label">
          Music file
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
        </label>
        {file && <p className="muted">Selected: {file.name}</p>}
        <p className="muted" style={{ fontSize: '0.85em' }}>Max file size: 8MB</p>

        <label className="field-label">
          Cover image (optional)
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverImage(e.target.files[0])}
          />
        </label>
        {coverImage && <p className="muted">Selected: {coverImage.name}</p>}

        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
        <button type="submit">Upload</button>
      </form>
    </div>
  );
}