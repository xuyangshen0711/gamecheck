import PropTypes from 'prop-types';
import './SessionList.css';

function SessionList({ sessions, loading, hasActiveFilters, onEdit, onDelete }) {
  if (loading) {
    return <p className="list-state">Loading sessions...</p>;
  }

  if (sessions.length === 0) {
    return (
      <div className="list-state list-state--empty">
        <span className="list-state__emoji" aria-hidden="true">📋</span>
        <p>
          {hasActiveFilters
            ? 'No sessions match the current filters.'
            : 'No sessions recorded yet. Log your first game night!'}
        </p>
      </div>
    );
  }

  return (
    <div className="session-list">
      {sessions.map((session) => (
        <article className="session-list__item" key={session.id}>
          <div>
            <h3>{session.gameName}</h3>
            <p className="session-list__meta">
              {session.sessionDate} • Winner:{' '}
              <span className="session-list__winner">🏆 {session.winner}</span>
            </p>
            <p>Players: {session.players.join(', ')}</p>
            <p>{session.notes || 'No notes added for this session.'}</p>
          </div>
          <div className="session-list__actions">
            <button
              type="button"
              className="session-list__action-button session-list__action-button--edit"
              aria-label={`Edit session: ${session.gameName} on ${session.sessionDate}`}
              onClick={() => onEdit(session)}
            >
              Edit
            </button>
            <button
              type="button"
              className="session-list__action-button session-list__action-button--delete"
              aria-label={`Delete session: ${session.gameName} on ${session.sessionDate}`}
              onClick={() => onDelete(session.id)}
            >
              Delete
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

SessionList.propTypes = {
  sessions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      gameName: PropTypes.string.isRequired,
      sessionDate: PropTypes.string.isRequired,
      players: PropTypes.arrayOf(PropTypes.string).isRequired,
      winner: PropTypes.string.isRequired,
      notes: PropTypes.string.isRequired,
    })
  ).isRequired,
  loading: PropTypes.bool.isRequired,
  hasActiveFilters: PropTypes.bool.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default SessionList;
