import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api } from './api.js';
import Dashboard from './components/Dashboard/Dashboard.jsx';
import Header from './components/Layout/Header.jsx';
import GameLibrary from './components/GameLibrary/GameLibrary.jsx';
import SessionManager from './components/SessionManager/SessionManager.jsx';
import StatisticsPage from './components/Statistics/StatisticsPage.jsx';
import './styles/App.css';

function hasActiveSessionFilters(filters) {
  return Boolean(filters.gameId || filters.player.trim());
}

function App() {
  const [games, setGames] = useState([]);
  const [allSessions, setAllSessions] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [activePanel, setActivePanel] = useState('both');
  const [focusedStatsPlayer, setFocusedStatsPlayer] = useState('');
  const [sessionFilters, setSessionFilters] = useState({
    gameId: '',
    player: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const activeRequestControllerRef = useRef(null);
  const activeStatsRequestControllerRef = useRef(null);
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

      setErrorMessage(error.message);
    } finally {
      if (activeStatsRequestControllerRef.current === controller) {
        activeStatsRequestControllerRef.current = null;
        setStatsLoading(false);
      }
    }
  }, []);

  const loadData = useCallback(async (filters = {}) => {
    activeRequestControllerRef.current?.abort();
    const controller = new AbortController();
    activeRequestControllerRef.current = controller;
    const isFirstLoad = initialLoading && games.length === 0 && allSessions.length === 0;

    if (isFirstLoad) {
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

      setErrorMessage(error.message);
    } finally {
      if (activeRequestControllerRef.current === controller) {
        activeRequestControllerRef.current = null;
        setInitialLoading(false);
        setRefreshing(false);
      }
    }
  }, [allSessions.length, games.length, initialLoading]);

  useEffect(() => {
    loadData();
    loadStats();

    return () => {
      activeRequestControllerRef.current?.abort();
      activeStatsRequestControllerRef.current?.abort();
    };
  }, [loadData, loadStats]);

  async function handleDataChange(filters) {
    await Promise.all([loadData(filters), loadStats(focusedStatsPlayer)]);
  }

  async function handleStatsFocusChange(player) {
    setFocusedStatsPlayer(player);
    await loadStats(player);
  }

  return (
    <div className="app-shell">
      <Header />
      {errorMessage ? <p className="app-shell__error">{errorMessage}</p> : null}
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
      <section className="app-shell__view-switcher">
        <button
          type="button"
          className={activePanel === 'both' ? 'app-shell__view-button app-shell__view-button--active' : 'app-shell__view-button'}
          onClick={() => setActivePanel('both')}
        >
          Workspace
        </button>
        <button
          type="button"
          className={activePanel === 'sessions' ? 'app-shell__view-button app-shell__view-button--active' : 'app-shell__view-button'}
          onClick={() => setActivePanel('sessions')}
        >
          Sessions
        </button>
        <button
          type="button"
          className={activePanel === 'stats' ? 'app-shell__view-button app-shell__view-button--active' : 'app-shell__view-button'}
          onClick={() => setActivePanel('stats')}
        >
          Statistics
        </button>
      </section>
      <main
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
      </main>
    </div>
  );
}

export default App;
