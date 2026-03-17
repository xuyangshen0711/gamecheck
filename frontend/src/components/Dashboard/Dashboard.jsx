import PropTypes from 'prop-types';
import './Dashboard.css';

function getTopEntry(counts) {
  return [...counts.entries()].sort((left, right) => {
    if (right[1] !== left[1]) {
      return right[1] - left[1];
    }

    return left[0].localeCompare(right[0]);
  })[0] || null;
}

function Dashboard({ games, sessions, loading }) {
  const uniquePlayers = new Set(sessions.flatMap((session) => session.players));
  const latestSession = sessions[0];
  const gameCounts = new Map();
  const playerCounts = new Map();

  sessions.forEach((session) => {
    gameCounts.set(session.gameName, (gameCounts.get(session.gameName) || 0) + 1);

    session.players.forEach((player) => {
      playerCounts.set(player, (playerCounts.get(player) || 0) + 1);
    });
  });

  const mostPlayedGame = getTopEntry(gameCounts);
  const mostActivePlayer = getTopEntry(playerCounts);

  return (
    <section className="dashboard">
      <article className="dashboard__card">
        <span className="dashboard__label">Games</span>
        <strong>{loading ? '...' : games.length}</strong>
      </article>
      <article className="dashboard__card">
        <span className="dashboard__label">Sessions</span>
        <strong>{loading ? '...' : sessions.length}</strong>
      </article>
      <article className="dashboard__card">
        <span className="dashboard__label">Players Logged</span>
        <strong>{loading ? '...' : uniquePlayers.size}</strong>
      </article>
      <article className="dashboard__card">
        <span className="dashboard__label">Latest Winner</span>
        <strong>{loading ? '...' : latestSession?.winner || 'No sessions yet'}</strong>
      </article>
      <article className="dashboard__card">
        <span className="dashboard__label">Most Played Game</span>
        <strong className="dashboard__value dashboard__value--compact">
          {loading ? '...' : mostPlayedGame?.[0] || 'No sessions yet'}
        </strong>
        <small>{loading ? '' : mostPlayedGame ? `${mostPlayedGame[1]} sessions` : ''}</small>
      </article>
      <article className="dashboard__card">
        <span className="dashboard__label">Most Active Player</span>
        <strong className="dashboard__value dashboard__value--compact">
          {loading ? '...' : mostActivePlayer?.[0] || 'No players yet'}
        </strong>
        <small>{loading ? '' : mostActivePlayer ? `${mostActivePlayer[1]} appearances` : ''}</small>
      </article>
    </section>
  );
}

Dashboard.propTypes = {
  games: PropTypes.arrayOf(PropTypes.object).isRequired,
  sessions: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool.isRequired,
};

export default Dashboard;
