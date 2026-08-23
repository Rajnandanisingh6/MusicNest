import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from '../components/Logo.jsx';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'user' });
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
      const res = await api.post('/auth/register', form);
      login(res.data.user);
      navigate('/');
    } catch (err) {
      const data = err.response?.data;
      setError(data?.requirements || data?.message || 'Registration failed');
    }
  }

  return (
    <div className="form-card">
      <Logo size={40} />
      <h1>Create account</h1>
      <form onSubmit={handleSubmit}>
        <input name="username" placeholder="Username" value={form.username} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />

        <label className="role-label">
          I am a
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="user">Listener</option>
            <option value="artist">Artist</option>
          </select>
        </label>

        {error && <p className="error">{error}</p>}
        <button type="submit">Register</button>
      </form>
      <p className="muted" style={{ marginTop: 16 }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}