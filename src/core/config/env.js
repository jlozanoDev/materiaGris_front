// Base API URL configuration. Uses Vite env var if provided, otherwise falls back
// to the local api host used in development.
export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://api.materiagris.local:8080'

export default API_BASE
