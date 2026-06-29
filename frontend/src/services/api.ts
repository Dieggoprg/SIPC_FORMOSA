import axios from 'axios'

// Instancia base de axios apuntando al backend FastAPI.
// Todas las llamadas HTTP del frontend pasan por acá.
export const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
})