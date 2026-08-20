import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/axios.js';
import Logo from './Logo.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();

  async function handleLogout() {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.log(err);
    }
    logout();
  }

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        <Logo size={30} />
        <span>
          Music<em>Nest</em>
        </span>
      </Link>

      <div className="nav-links">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
          Home
        </NavLink>
        <NavLink to="/albums" className={({ isActive }) => (isActive ? 'active' : '')}>
          Albums
        </NavLink>

        {user?.role === 'artist' && (
          <NavLink to="/upload" className={({ isActive }) => (isActive ? 'active' : '')}>
            Upload
          </NavLink>
        )}
        {user?.role === 'artist' && (
          <NavLink to="/create-album" className={({ isActive }) => (isActive ? 'active' : '')}>
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
            <Link to="/login" className="btn-ghost">
              Login
            </Link>
            <Link to="/register" className="btn-primary">
              Sign up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
