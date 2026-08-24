import axios from 'axios';

// local development mein .env nahi hoga toh localhost use hoga,
// deploy karte waqt Vercel mein VITE_API_URL set karna hoga
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  withCredentials: true, // sends the "token" cookie set by the backend
});

export default api;