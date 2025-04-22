import { Api } from '../api/api-client';


const api = new Api({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5295',
});


export default api;