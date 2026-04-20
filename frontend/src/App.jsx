import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api } from './api.js';
import AuthPanel from './components/Auth/AuthPanel.jsx';
import Dashboard from './components/Dashboard/Dashboard.jsx';
import Header from './components/Layout/Header.jsx';
import GameLibrary from './components/GameLibrary/GameLibrary.jsx';
import SessionManager from './components/SessionManager/SessionManager.jsx';
import StatisticsPage from './components/Statistics/StatisticsPage.jsx';
import './styles/App.css';

const emptySessionFilters = {
  gameId: '',
  player: '',
};

function hasActiveSessionFilters(filters) {
  return Boolean(filters.gameId || filters.player.trim());
}

const themeOptions = [
  { value: 'day', label: 'Day mode' },
  { value: 'night', label: 'Night mode' },
  { value: 'forest', label: 'Forest theme' },
  { value: 'sunset', label: 'Sunset theme' },
];

function App() {
  const [games, setGames] = useState([]);
  const [allSessions, setAllSessions] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [activePanel, setActivePanel] = useState('both');
  const [focusedStatsPlayer, setFocusedStatsPlayer] = useState('');
  const [theme, setTheme] = useState(() => localStorage.getItem('gamecheck-theme') || 'day');
  const [sessionFilters, setSessionFilters] = useState(emptySessionFilters);
  const [errorMessage, setErrorMessage] = useState('');
  const [authLoading, setAuthLoading] = useState(true);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const activeRequestControllerRef = useRef(null);
  const activeStatsRequestControllerRef = useRef(null);
  const hasLoadedDataRef = useRef(false);
  const isEmptyDeployment =
    !initialLoading && !errorMessage && games.length === 0 && allSessions.length === 0;
  const playerSuggestions = useMemo(() => {
    const playerCounts = new Map();

    allSessions.forEach((session) => {
      session.players.forEach((player) => {
        playerCounts.set(player, (playerCounts.get(player) || 0) + 1);
      });
    });

    return [...playerCounts.entries()]
      .sort((left, right) => {
        if (right[1] !== left[1]) {
          return right[1] - left[1];
        }

        return left[0].localeCompare(right[0]);
      })
      .map(([player]) => player);
  }, [allSessions]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('gamecheck-theme', theme);
  }, [theme]);

  const resetWorkspaceState = useCallback(() => {
    activeRequestControllerRef.current?.abort();
    activeStatsRequestControllerRef.current?.abort();
    activeRequestControllerRef.current = null;
    activeStatsRequestControllerRef.current = null;
    hasLoadedDataRef.current = false;
    setGames([]);
    setAllSessions([]);
    setSessions([]);
    setStats(null);
    setActivePanel('both');
    setFocusedStatsPlayer('');
    setSessionFilters(emptySessionFilters);
    setInitialLoading(false);
    setStatsLoading(false);
    setRefreshing(false);
  }, []);

  const clearAuthenticationState = useCallback((message = '') => {
    setCurrentUser(null);
    resetWorkspaceState();
    setErrorMessage(message);
  }, [resetWorkspaceState]);

  const loadStats = useCallback(async (player = '') => {
    activeStatsRequestControllerRef.current?.abort();
    const controller = new AbortController();
    activeStatsRequestControllerRef.current = controller;

    setStatsLoading(true);

    try {
      const statsPayload = await api.getStats({ player }, { signal: controller.signal });
      setStats(statsPayload);
      setErrorMessage('');
    } catch (error) {
      if (error.name === 'AbortError') {
        return;
      }

      if (error.status === 401) {
        clearAuthenticationState('Your session expired. Please sign in again.');
        return;
      }

      setErrorMessage(error.message);
    } finally {
      if (activeStatsRequestControllerRef.current === controller) {
        activeStatsRequestControllerRef.current = null;
        setStatsLoading(false);
      }
    }
  }, [clearAuthenticationState]);

  const loadData = useCallback(async (filters = {}) => {
    activeRequestControllerRef.current?.abort();
    const controller = new AbortController();
    activeRequestControllerRef.current = controller;

    if (!hasLoadedDataRef.current) {
      setInitialLoading(true);
    } else {
      setRefreshing(true);
    }

    const normalizedFilters = {
      gameId: filters.gameId || '',
      player: filters.player || '',
    };

    try {
      const requests = [
        api.listGames('', { signal: controller.signal }),
        api.listSessions({}, { signal: controller.signal }),
      ];

      if (hasActiveSessionFilters(normalizedFilters)) {
        requests.push(api.listSessions(normalizedFilters, { signal: controller.signal }));
      }

      const [gameData, allSessionData, filteredSessionData] = await Promise.all(requests);
      setGames(gameData);
      setAllSessions(allSessionData);
      setSessions(filteredSessionData || allSessionData);
      setSessionFilters(normalizedFilters);
      setErrorMessage('');
    } catch (error) {
      if (error.name === 'AbortError') {
        return;
      }

      if (error.status === 401) {
        clearAuthenticationState('Your session expired. Please sign in again.');
        return;
      }

      setErrorMessage(error.message);
    } finally {
      if (activeRequestControllerRef.current === controller) {
        activeRequestControllerRef.current = null;
        setInitialLoading(false);
        setRefreshing(false);
        hasLoadedDataRef.current = true;
      }
    }
  }, [clearAuthenticationState]);

  useEffect(() => {
    async function initializeSession() {
      setAuthLoading(true);

      try {
        const sessionPayload = await api.getCurrentUser();
        const nextUser = sessionPayload.user;

        setCurrentUser(nextUser);
        setErrorMessage('');

        if (nextUser) {
          await Promise.all([loadData(), loadStats()]);
        } else {
          resetWorkspaceState();
        }
      } catch (error) {
        setErrorMessage(error.message);
        resetWorkspaceState();
      } finally {
        setAuthLoading(false);
      }
    }

    function handleUnauthorized() {
      setAuthLoading(false);
      clearAuthenticationState('Your session expired. Please sign in again.');
    }

    initializeSession();
    window.addEventListener('gamecheck:unauthorized', handleUnauthorized);

    return () => {
      activeRequestControllerRef.current?.abort();
      activeStatsRequestControllerRef.current?.abort();
      window.removeEventListener('gamecheck:unauthorized', handleUnauthorized);
    };
  }, [clearAuthenticationState, loadData, loadStats, resetWorkspaceState]);

  async function handleDataChange(filters) {
    await Promise.all([loadData(filters), loadStats(focusedStatsPlayer)]);
  }

  async function handleStatsFocusChange(player) {
    setFocusedStatsPlayer(player);
    await loadStats(player);
  }

  async function handleAuthenticate(credentials, mode) {
    setAuthSubmitting(true);

    try {
      const payload =
        mode === 'register'
          ? await api.register(credentials)
          : await api.login(credentials);

      setCurrentUser(payload.user);
      setErrorMessage('');
      setInitialLoading(true);
      setStatsLoading(true);
      hasLoadedDataRef.current = false;
      await Promise.all([loadData(), loadStats()]);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setAuthSubmitting(false);
      setAuthLoading(false);
    }
  }

  async function handleLogout() {
    setLogoutPending(true);

    try {
      await api.logout();
      clearAuthenticationState('');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLogoutPending(false);
    }
  }

  function handleThemeChange(event) {
    setTheme(event.target.value);
  }

  return (
    <div className="app-shell">
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        logoutPending={logoutPending}
        theme={theme}
        onThemeChange={handleThemeChange}
        themeOptions={themeOptions}
      />
      {errorMessage ? <p className="app-shell__error" role="alert">{errorMessage}</p> : null}
      {authLoading ? (
        <section className="app-shell__notice">
          <h2>Checking session</h2>
          <p>Loading your authentication state and preparing the workspace.</p>
        </section>
      ) : null}
      {!authLoading && !currentUser ? (
        <main className="app-shell__auth">
          <AuthPanel
            submitting={authSubmitting}
            errorMessage={errorMessage}
            onAuthenticate={handleAuthenticate}
          />
        </main>
      ) : null}
      {authLoading || !currentUser ? null : (
        <>
          {isEmptyDeployment ? (
            <section className="app-shell__notice">
              <h2>Deployment is working</h2>
              <p>
                The app is live, but this cloud database does not have sample data yet. Add games and
                sessions manually, or seed Atlas from your local machine with
                <code> MONGO_URI=&quot;your-atlas-uri&quot; npm run render-seed</code>.
              </p>
            </section>
          ) : null}
          <Dashboard games={games} sessions={allSessions} loading={initialLoading} />
          <nav aria-label="View navigation" className="app-shell__view-switcher">
            <button
              type="button"
              aria-pressed={activePanel === 'both'}
              className={activePanel === 'both' ? 'app-shell__view-button app-shell__view-button--active' : 'app-shell__view-button'}
              onClick={() => setActivePanel('both')}
            >
              Workspace
            </button>
            <button
              type="button"
              aria-pressed={activePanel === 'sessions'}
              className={activePanel === 'sessions' ? 'app-shell__view-button app-shell__view-button--active' : 'app-shell__view-button'}
              onClick={() => setActivePanel('sessions')}
            >
              Sessions
            </button>
            <button
              type="button"
              aria-pressed={activePanel === 'stats'}
              className={activePanel === 'stats' ? 'app-shell__view-button app-shell__view-button--active' : 'app-shell__view-button'}
              onClick={() => setActivePanel('stats')}
            >
              Statistics
            </button>
          </nav>
          <main>
            <div
              key={activePanel}
              className={`app-shell__content ${
                activePanel === 'sessions' || activePanel === 'stats' ? 'app-shell__content--single' : ''
              }`}
            >
              {activePanel === 'both' ? (
                <GameLibrary
                  games={games}
                  loading={initialLoading}
                  onDataChange={() => handleDataChange(sessionFilters)}
                  onOpenSessionLogging={() => setActivePanel('sessions')}
                  setErrorMessage={setErrorMessage}
                />
              ) : null}
              {activePanel !== 'stats' ? (
                <SessionManager
                  games={games}
                  sessions={sessions}
                  filters={sessionFilters}
                  playerSuggestions={playerSuggestions}
                  loading={initialLoading}
                  refreshing={refreshing}
                  fullWidth={activePanel === 'sessions'}
                  onShowAllPanels={() => setActivePanel('both')}
                  onDataChange={handleDataChange}
                  setErrorMessage={setErrorMessage}
                />
              ) : null}
              {activePanel === 'stats' ? (
                <StatisticsPage
                  stats={stats}
                  loading={statsLoading}
                  focusedPlayer={focusedStatsPlayer}
                  playerSuggestions={playerSuggestions}
                  onFocusPlayerChange={handleStatsFocusChange}
                />
              ) : null}
            </div>
          </main>
        </>
      )}
    </div>
  );
}

export default App;
