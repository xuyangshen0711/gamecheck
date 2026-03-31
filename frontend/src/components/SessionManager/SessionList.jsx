import PropTypes from 'prop-types';
import './SessionList.css';

function SessionList({ sessions, loading, onEdit, onDelete }) {
  if (loading) {
    return <p className="list-state">Loading sessions...</p>;
  }

  if (sessions.length === 0) {
    return <p className="list-state">No sessions match the current filters.</p>;
  }

  return (
    <div className="session-list">
      {sessions.map((session) => (
        <article className="session-list__item" key={session.id}>
          <div>
            <h3>{session.gameName}</h3>
            <p className="session-list__meta">
              {session.sessionDate} • Winner: {session.winner}
            </p>
            <p>Players: {session.players.join(', ')}</p>
            <p>{session.notes || 'No notes added for this session.'}</p>
          </div>
          <div className="session-list__actions">
            <button type="button" aria-label={`Edit session: ${session.gameName} on ${session.sessionDate}`} onClick={() => onEdit(session)}>
              Edit
            </button>
            <button type="button" aria-label={`Delete session: ${session.gameName} on ${session.sessionDate}`} className="button-danger" onClick={() => onDelete(session.id)}>
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
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default SessionList;
