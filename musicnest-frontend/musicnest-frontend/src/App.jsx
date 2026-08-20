import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Upload from './pages/Upload.jsx';
import Albums from './pages/Albums.jsx';
import AlbumDetail from './pages/AlbumDetail.jsx';
import CreateAlbum from './pages/CreateAlbum.jsx';

export default function App() {
  return (
    <AuthProvider>
      <Navbar />
      <main className="page">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/albums" element={<Albums />} />
          <Route path="/albums/:albumId" element={<AlbumDetail />} />
          <Route path="/create-album" element={<CreateAlbum />} />
        </Routes>
      </main>
    </AuthProvider>
  );
}