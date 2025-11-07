import axios from 'axios'

// Use VITE_API_BASE_URL when provided (set at build time). When running
// in production without that env var, default to the deployed backend URL.
// In development, default to the local vite proxy at '/api'.
const prodBackend = 'https://examen-2p-backend2.onrender.com/api'
const base = import.meta.env.VITE_API_BASE_URL || (import.meta.env.MODE === 'production' ? prodBackend : '/api')
const api = axios.create({
  baseURL: base,
  timeout: 5000,
})

export default api
