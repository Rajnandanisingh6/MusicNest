import axios from 'axios';

// Change this if your backend runs on a different URL/port.
const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  withCredentials: true, // sends the "token" cookie set by the backend
});

export default api;
