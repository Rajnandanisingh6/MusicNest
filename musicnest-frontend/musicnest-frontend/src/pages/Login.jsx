import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from '../components/Logo.jsx';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/login', {
        username: form.username,
        email: form.username,
        password: form.password,
      });
      login(res.data.user);
      navigate('/', { state: { justAuthed: true } });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  }

  return (
    <div className="form-card">
      <Logo size={40} />
      <h1>Welcome back</h1>
      <form onSubmit={handleSubmit}>
        <input name="username" placeholder="Username or email" value={form.username} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        {error && <p className="error">{error}</p>}
        <button type="submit">Login</button>
      </form>
      <p className="muted" style={{ marginTop: 12 }}>
        New here? <Link to="/register">Create an account</Link>
      </p>
    </div>
  );
}