const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:4000/api' : '/api');

async function request(path, options = {}) {
  const { skipUnauthorizedEvent = false, ...requestOptions } = options;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(requestOptions.headers || {}),
    },
    ...requestOptions,
  });

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') || '';
  const isJsonResponse = contentType.includes('application/json');
  const data = isJsonResponse ? await response.json() : await response.text();

  if (!response.ok) {
    const message = isJsonResponse
      ? data.error || data.errors?.join(' ') || `Request failed with status ${response.status}.`
      : data.trim() || `Request failed with status ${response.status}.`;
    const error = new Error(message);
    error.status = response.status;

    if (response.status === 401 && !skipUnauthorizedEvent && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('gamecheck:unauthorized'));
    }

    throw error;
  }

  return data;
}

export const api = {
  getCurrentUser() {
    return request('/auth/me');
  },
  register(payload) {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  login(payload) {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
      skipUnauthorizedEvent: true,
    });
  },
  logout() {
    return request('/auth/logout', {
      method: 'POST',
    });
  },
  listGames(search = '', options = {}) {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return request(`/games${query}`, options);
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
  listSessions(filters = {}, options = {}) {
    const params = new URLSearchParams();

    if (filters.gameId) {
      params.set('gameId', filters.gameId);
    }

    if (filters.player) {
      params.set('player', filters.player);
    }

    if (filters.page !== undefined) {
      params.set('page', filters.page);
    }

    const query = params.toString() ? `?${params.toString()}` : '';
    return request(`/sessions${query}`, options);
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
  getStats(filters = {}, options = {}) {
    const params = new URLSearchParams();

    if (filters.player) {
      params.set('player', filters.player);
    }

    const query = params.toString() ? `?${params.toString()}` : '';
    return request(`/stats${query}`, options);
  },
};
