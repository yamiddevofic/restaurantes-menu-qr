const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export const api = {
  async get(endpoint) {
    const res = await fetch(`${API_BASE}/api${endpoint}`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Error en la petición');
    return res.json();
  },

  async post(endpoint, body) {
    const res = await fetch(`${API_BASE}/api${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Error en la petición');
    return res.json();
  },

  async put(endpoint, body) {
    const res = await fetch(`${API_BASE}/api${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Error en la petición');
    return res.json();
  },

  async delete(endpoint) {
    const res = await fetch(`${API_BASE}/api${endpoint}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Error en la petición');
    return res.json();
  },
};
