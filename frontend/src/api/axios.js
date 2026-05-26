import axios from 'axios';

// Create a pre-configured axios instance
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;
