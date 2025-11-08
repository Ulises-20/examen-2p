import axios from 'axios'


const prodBackend = 'https://examen-2p-backend2.onrender.com/api'
const base = import.meta.env.VITE_API_BASE_URL || (import.meta.env.MODE === 'production' ? prodBackend : '/api')
const api = axios.create({
  baseURL: base,
  timeout: 5000,
})

export default api
