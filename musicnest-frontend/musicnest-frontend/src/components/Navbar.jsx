import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/axios.js';
import Logo from './Logo.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.log(err);
    }
    logout();
    setOpen(false);
  }

  return (
    <nav className="navbar">
      <Link to="/" className="brand" onClick={() => setOpen(false)}>
        <Logo size={30} />
        <span>
          Music<em>Nest</em>
        </span>
      </Link>

      <button
        type="button"
        className={`nav-toggle ${open ? 'open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle menu"
        aria-expanded={open}
      >
        <span />
        <span />
        <span />
      </button>

      <div className={`nav-links ${open ? 'open' : ''}`}>
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')} onClick={() => setOpen(false)}>
          Home
        </NavLink>
        <NavLink to="/albums" className={({ isActive }) => (isActive ? 'active' : '')} onClick={() => setOpen(false)}>
          Albums
        </NavLink>

        {user?.role === 'artist' && (
          <NavLink to="/upload" className={({ isActive }) => (isActive ? 'active' : '')} onClick={() => setOpen(false)}>
            Upload
          </NavLink>
        )}
        {user?.role === 'artist' && (
          <NavLink to="/create-album" className={({ isActive }) => (isActive ? 'active' : '')} onClick={() => setOpen(false)}>
            New Album
          </NavLink>
        )}

        {user ? (
          <div className="nav-user-group">
            <span className="nav-user">
              <span className={`role-dot ${user.role}`} />
              {user.username}
            </span>
            <button className="btn-ghost" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <div className="nav-user-group">
            <Link to="/login" className="btn-ghost" onClick={() => setOpen(false)}>
              Login
            </Link>
            <Link to="/register" className="btn-primary" onClick={() => setOpen(false)}>
              Sign up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}