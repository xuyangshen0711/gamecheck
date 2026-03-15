import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { api } from '../../api.js';
import SessionFilter from './SessionFilter.jsx';
import SessionForm from './SessionForm.jsx';
import SessionList from './SessionList.jsx';
import './SessionManager.css';

const emptySession = {
  gameId: '',
  sessionDate: '',
  playersText: '',
  winner: '',
  notes: '',
};

function SessionManager({ games, sessions, loading, onDataChange, setErrorMessage }) {
  const [editingSession, setEditingSession] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [filters, setFilters] = useState({
    gameId: '',
    player: '',
  });

  const sessionFormValues = useMemo(() => {
    if (!editingSession) {
      return emptySession;
    }

    return {
      gameId: editingSession.gameId,
      sessionDate: editingSession.sessionDate,
      playersText: editingSession.players.join(', '),
      winner: editingSession.winner,
      notes: editingSession.notes,
    };
  }, [editingSession]);

  async function handleSubmit(payload) {
    setSubmitting(true);
    const requestPayload = {
      ...payload,
      players: payload.playersText
        .split(',')
        .map((player) => player.trim())
        .filter(Boolean),
    };
    delete requestPayload.playersText;

    try {
      if (editingSession) {
        await api.updateSession(editingSession.id, requestPayload);
      } else {
        await api.createSession(requestPayload);
      }

      setEditingSession(null);
      setErrorMessage('');
      await onDataChange(filters);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(sessionId) {
    try {
      await api.deleteSession(sessionId);
      setErrorMessage('');
      await onDataChange(filters);
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleFilterChange(nextFilters) {
    setFilters(nextFilters);
    await onDataChange(nextFilters);
  }

  return (
    <section className="panel">
      <div className="panel__heading">
        <div>
          <p className="panel__eyebrow">Xuyang Shen</p>
          <h2>Session Logging</h2>
        </div>
      </div>
      <SessionFilter games={games} filters={filters} onChange={handleFilterChange} />
      <SessionForm
        games={games}
        initialValues={sessionFormValues}
        onSubmit={handleSubmit}
        onCancel={() => setEditingSession(null)}
        isEditing={Boolean(editingSession)}
        submitting={submitting}
      />
      <SessionList
        sessions={sessions}
        loading={loading}
        onEdit={setEditingSession}
        onDelete={handleDelete}
      />
    </section>
  );
}

SessionManager.propTypes = {
  games: PropTypes.arrayOf(PropTypes.object).isRequired,
  sessions: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool.isRequired,
  onDataChange: PropTypes.func.isRequired,
  setErrorMessage: PropTypes.func.isRequired,
};

export default SessionManager;
