# MusicNest Frontend

Simple React (Vite) frontend for the MusicNest backend.

## Setup

1. Make sure your backend is running on `http://localhost:3000`
   (see `src/api/axios.js` if it's on a different port).

2. Install dependencies:
   ```
   npm install
   ```

3. Start the dev server:
   ```
   npm run dev
   ```

4. Open the URL Vite prints (usually `http://localhost:5173`).

## How it's organized

- `src/api/axios.js` — one axios instance, used by every page to talk to the backend.
  `withCredentials: true` is important — it's what makes the browser send the
  login cookie with every request.
- `src/context/AuthContext.jsx` — tiny context that remembers who's logged in
  (and their role) so the Navbar and pages can react to it. The real auth
  token lives in an httpOnly cookie set by the backend; this just tracks
  the user object for the UI.
- `src/components/Navbar.jsx` — top nav, shows different links depending on
  whether you're logged out, a listener, or an artist.
- `src/pages/` — one file per screen: Login, Register, Home (music list),
  Upload (artist only), Albums, AlbumDetail.

## Notes

- Only users with role `artist` can see the Upload page (enforced both by
  hiding the link in the Navbar and by the backend's `authArtist` middleware).
- Only users with role `user` (listener) can currently browse `/api/music`
  and `/api/music/albums`, because of how `authUser` is written on the
  backend. If you want artists to browse music too, relax that role check.
