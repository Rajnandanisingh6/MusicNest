# MusicNest 🎵

A full-stack music sharing platform built with the MERN stack, where artists can upload and organize their music into albums, and listeners can browse and stream them.

## Tech Stack

**Backend:** Node.js, Express, MongoDB (Mongoose), JWT authentication, bcrypt, Multer, ImageKit (file storage)
**Frontend:** React (Vite), React Router, Axios

## Features

- User authentication (register/login/logout) with JWT stored in HTTP-only cookies
- Role-based access — two roles: `user` (listener) and `artist`
- Strong password enforcement on registration
- Rate limiting on login/register to prevent brute-force attacks
- Artists can upload music (max 8MB per file, max 20 songs per artist) and create albums
- Paginated music listing
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
npm run dev
```

## API Routes

Base URL: `http://localhost:4000/api`

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/auth/register` | Public | Register a new user or artist |
| POST | `/api/auth/login` | Public | Login and receive a session cookie |
| POST | `/api/auth/logout` | Logged in | Clear the session |
| GET | `/api/music` | Logged in | Paginated list of all music |
| POST | `/api/music/upload` | Artist only | Upload a new track |
| POST | `/api/music/album` | Artist only | Create an album |
| GET | `/api/music/albums` | Logged in | List all albums |
| GET | `/api/music/albums/:albumId` | Logged in | Get a single album with its tracks |

## Security Notes

- Passwords are hashed with bcrypt before storage
- JWTs expire after 7 days
- Cookies are set with `httpOnly`, `sameSite: strict`, and `secure` (in production)
- User-submitted `role` is validated against an allow-list (`user`, `artist`) — no arbitrary roles can be assigned
- Login/register routes are rate-limited (10 attempts per 15 minutes per IP)

## Future Improvements

- Refresh token flow for smoother re-authentication
- Search and filtering for music/albums
- Automated tests (Jest/Supertest)