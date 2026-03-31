import PropTypes from 'prop-types';
import './Dashboard.css';

const statIcons = {
  games: '🎲',
  sessions: '📋',
  players: '👥',
  winner: '🏆',
  mostPlayed: '⭐',
  mostActive: '🔥',
};

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
  const isEmptyState = !loading && games.length === 0 && sessions.length === 0;
  const statCards = [
    { key: 'games', label: 'Games', value: games.length },
    { key: 'sessions', label: 'Sessions', value: sessions.length },
    { key: 'players', label: 'Players Logged', value: uniquePlayers.size },
    { key: 'winner', label: 'Latest Winner', value: latestSession?.winner || 'No sessions yet' },
    {
      key: 'mostPlayed',
      label: 'Most Played Game',
      value: mostPlayedGame?.[0] || 'No sessions yet',
      detail: mostPlayedGame ? `${mostPlayedGame[1]} sessions` : '',
      compact: true,
    },
    {
      key: 'mostActive',
      label: 'Most Active Player',
      value: mostActivePlayer?.[0] || 'No players yet',
      detail: mostActivePlayer ? `${mostActivePlayer[1]} appearances` : '',
      compact: true,
    },
  ];

  return (
    <section className="dashboard">
      {statCards.map((card) => (
        <article className="dashboard__card" key={card.key}>
          <span className="dashboard__label">
            <span className="dashboard__icon" aria-hidden="true">{statIcons[card.key]}</span>
            {card.label}
          </span>
          <strong className={card.compact ? 'dashboard__value dashboard__value--compact' : 'dashboard__value'}>
            {loading ? '...' : card.value}
          </strong>
          <small>{loading ? '' : card.detail || ''}</small>
        </article>
      ))}
      {isEmptyState ? (
        <p className="dashboard__empty-state">
          🎯 Start by adding games and logging sessions to see your stats!
        </p>
      ) : null}
    </section>
  );
}

Dashboard.propTypes = {
  games: PropTypes.arrayOf(PropTypes.object).isRequired,
  sessions: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool.isRequired,
};

export default Dashboard;
