# MusicNest 🎵

A full-stack music sharing platform built with the MERN stack, where artists can upload and organize their music into albums, and listeners can browse and stream them.

🔗 **Live Demo**: [https://musicnest-1.onrender.com](https://musicnest-1.onrender.com)
*(Note: backend is hosted on Render's free tier and may take 30-50 seconds to wake up on first load if inactive.)*

![MusicNest Homepage](screenshots<img width="1914" height="911" alt="Screenshot 2026-08-24 160706" src="https://github.com/user-attachments/assets/6eeeb24d-e372-4f9d-90a3-2f1b7ca614a2" />
/homepage.png)

## Tech Stack

**Backend:** Node.js, Express, MongoDB (Mongoose), JWT authentication, bcrypt, Multer, ImageKit (file storage), music-metadata (audio tag parsing)
**Frontend:** React (Vite), React Router, Axios

## Features

- User authentication (register/login/logout) with JWT stored in HTTP-only cookies
- Role-based access — two roles: `user` (listener) and `artist`, validated against an allow-list on register
- Strong password and username validation on registration
- Rate limiting on login/register to prevent brute-force attacks
- Artists can upload music (max 8MB per file, max 20 songs per artist) and create albums
- **Automatic cover art**: extracts embedded album art from the uploaded audio file if present, otherwise generates a deterministic gradient placeholder per track
- Artists can delete their own tracks — removes the file from both MongoDB and ImageKit
- Like/unlike tracks and a play-count tracker
- Trending section ranks tracks by a weighted score of likes and plays
- Paginated music listing
- Responsive UI with a spinning vinyl-record player state, animated waveform accents, and mobile-friendly navigation
- Request logging (Morgan) and centralized error handling

## Project Structure

```
MusicNest/
├── musicnest-backend/     # Express API
└── musicnest-frontend/
    └── musicnest-frontend/ # React app
```

## Getting Started

### Backend Setup

```bash
cd musicnest-backend
npm install
```

Create a `.env` file in `musicnest-backend/` with:

```
PORT=4000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Run the server:

```bash
npm run dev
```

The API will be available at `http://localhost:4000`.

### Frontend Setup

```bash
cd musicnest-frontend/musicnest-frontend
npm install
```

Create a `.env` file in `musicnest-frontend/musicnest-frontend/` with:

```
VITE_API_URL=http://localhost:4000/api
```

(In production, set this to your deployed backend's URL, e.g. `https://your-backend.onrender.com/api`)

```bash
npm run dev
```

## API Routes

Base URL: `http://localhost:4000/api`

**Auth**
- `POST /auth/register` — Register a new user or artist
- `POST /auth/login` — Login and receive a session cookie
- `POST /auth/logout` — Clear the session

**Music**
- `GET /music` — All songs (paginated)
- `GET /music/trending` — Top trending songs (ranked by likes + plays)
- `POST /music/upload` — Upload a song, auto cover art *(artist only)*
- `DELETE /music/:musicId` — Delete own song *(artist only)*
- `POST /music/:musicId/like` — Like/unlike a song
- `POST /music/:musicId/play` — Track a play

**Albums**
- `POST /music/album` — Create album *(artist only)*
- `GET /music/albums` — All albums
- `GET /music/albums/:albumId` — Single album with its tracks

## Security Notes

- Passwords are hashed with bcrypt before storage
- JWTs expire after 7 days
- Cookies are set with `httpOnly`, `sameSite: strict`, and `secure` (in production)
- User-submitted `role` is validated against an allow-list (`user`, `artist`) — no arbitrary roles can be assigned
- Login/register routes are rate-limited (10 attempts per 15 minutes per IP)

## Future Improvements

- Forgot/reset password via email
- Email verification on signup
- Search and filtering for music/albums
- Load-more / pagination in the frontend
- Refresh token flow for smoother re-authentication
- Automated tests (Jest/Supertest)

## License

This project is licensed under the [MIT License](LICENSE).
