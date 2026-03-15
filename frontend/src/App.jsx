import { useEffect, useState } from 'react';
import { api } from './api.js';
import Dashboard from './components/Dashboard/Dashboard.jsx';
import Header from './components/Layout/Header.jsx';
import GameLibrary from './components/GameLibrary/GameLibrary.jsx';
import SessionManager from './components/SessionManager/SessionManager.jsx';
import './styles/App.css';

function App() {
  const [games, setGames] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadData(filters = {}) {
    setLoading(true);

    try {
      const [gameData, sessionData] = await Promise.all([
        api.listGames(),
        api.listSessions(filters),
      ]);
      setGames(gameData);
      setSessions(sessionData);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="app-shell">
      <Header />
      {errorMessage ? <p className="app-shell__error">{errorMessage}</p> : null}
      <Dashboard games={games} sessions={sessions} loading={loading} />
      <main className="app-shell__content">
        <GameLibrary
          games={games}
          loading={loading}
          onDataChange={() => loadData()}
          setErrorMessage={setErrorMessage}
        />
        <SessionManager
          games={games}
          sessions={sessions}
          loading={loading}
          onDataChange={(filters) => loadData(filters)}
          setErrorMessage={setErrorMessage}
        />
      </main>
    </div>
  );
}

export default App;
