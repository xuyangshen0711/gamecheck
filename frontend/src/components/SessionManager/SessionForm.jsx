import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import './SessionForm.css';

function SessionForm({ games, initialValues, onSubmit, onCancel, isEditing, submitting }) {
  const [formValues, setFormValues] = useState(initialValues);

  useEffect(() => {
    setFormValues(initialValues);
  }, [initialValues]);

  const playerOptions = useMemo(() => {
    return formValues.playersText
      .split(',')
      .map((player) => player.trim())
      .filter(Boolean);
  }, [formValues.playersText]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit(formValues);
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <div className="form-card__grid">
        <label>
          <span>Game</span>
          <select name="gameId" value={formValues.gameId} onChange={handleChange} required>
            <option value="">Select a game</option>
            {games.map((game) => (
              <option key={game.id} value={game.id}>
                {game.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Date</span>
          <input
            name="sessionDate"
            type="date"
            value={formValues.sessionDate}
            onChange={handleChange}
            required
          />
        </label>
      </div>
      <label>
        <span>Players</span>
        <input
          name="playersText"
          value={formValues.playersText}
          onChange={handleChange}
          placeholder="Comma-separated player names"
          required
        />
      </label>
      <label>
        <span>Winner</span>
        <input
          list="winner-options"
          name="winner"
          value={formValues.winner}
          onChange={handleChange}
          placeholder="Winner must match a listed player"
          required
        />
        <datalist id="winner-options">
          {playerOptions.map((player) => (
            <option key={player} value={player} />
          ))}
        </datalist>
      </label>
      <label>
        <span>Notes</span>
        <textarea name="notes" rows="3" value={formValues.notes} onChange={handleChange} />
      </label>
      <div className="form-card__actions">
        <button type="submit" disabled={submitting || games.length === 0}>
          {submitting ? 'Saving...' : isEditing ? 'Update Session' : 'Log Session'}
        </button>
        {isEditing ? (
          <button type="button" className="button-secondary" onClick={onCancel}>
            Cancel Edit
          </button>
        ) : null}
      </div>
    </form>
  );
}

SessionForm.propTypes = {
  games: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  initialValues: PropTypes.shape({
    gameId: PropTypes.string.isRequired,
    sessionDate: PropTypes.string.isRequired,
    playersText: PropTypes.string.isRequired,
    winner: PropTypes.string.isRequired,
    notes: PropTypes.string.isRequired,
  }).isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isEditing: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
};

export default SessionForm;
