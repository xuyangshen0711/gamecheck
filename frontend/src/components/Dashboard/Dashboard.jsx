import PropTypes from 'prop-types';
import './Dashboard.css';

function Dashboard({ games, sessions, loading }) {
  const uniquePlayers = new Set(sessions.flatMap((session) => session.players));
  const latestSession = sessions[0];

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
    </section>
  );
}

Dashboard.propTypes = {
  games: PropTypes.arrayOf(PropTypes.object).isRequired,
  sessions: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool.isRequired,
};

export default Dashboard;
