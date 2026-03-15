const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:4000/api' : '/api');

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json();

  if (!response.ok) {
    const message = data.error || data.errors?.join(' ') || 'Request failed.';
    throw new Error(message);
  }

  return data;
}

export const api = {
  listGames(search = '') {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return request(`/games${query}`);
  },
  createGame(payload) {
    return request('/games', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  updateGame(gameId, payload) {
    return request(`/games/${gameId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
  deleteGame(gameId) {
    return request(`/games/${gameId}`, {
      method: 'DELETE',
    });
  },
  listSessions(filters = {}) {
    const params = new URLSearchParams();

    if (filters.gameId) {
      params.set('gameId', filters.gameId);
    }

    if (filters.player) {
      params.set('player', filters.player);
    }

    const query = params.toString() ? `?${params.toString()}` : '';
    return request(`/sessions${query}`);
  },
  createSession(payload) {
    return request('/sessions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  updateSession(sessionId, payload) {
    return request(`/sessions/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
  deleteSession(sessionId) {
    return request(`/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  },
};
