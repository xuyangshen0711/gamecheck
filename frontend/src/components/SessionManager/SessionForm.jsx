import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import './SessionForm.css';

function SessionForm({
  games,
  initialValues,
  playerSuggestions,
  onSubmit,
  onCancel,
  isEditing,
  submitting,
}) {
  const [formValues, setFormValues] = useState(initialValues);
  const [isPlayersFocused, setIsPlayersFocused] = useState(false);

  useEffect(() => {
    setFormValues(initialValues);
  }, [initialValues]);

  const playerOptions = useMemo(() => {
    return formValues.playersText
      .split(',')
      .map((player) => player.trim())
      .filter(Boolean);
  }, [formValues.playersText]);

  const playerAutocompleteSuggestions = useMemo(() => {
    const playerSegments = formValues.playersText.split(',');
    const rawCurrentSegment = playerSegments[playerSegments.length - 1] || '';
    const normalizedCurrentSegment = rawCurrentSegment.trim().toLowerCase();
    const selectedPlayers = new Set(
      playerSegments
        .slice(0, -1)
        .map((player) => player.trim().toLowerCase())
        .filter(Boolean)
    );

    return playerSuggestions.filter((player) => {
      const normalizedPlayer = player.toLowerCase();

      if (selectedPlayers.has(normalizedPlayer)) {
        return false;
      }

      if (!normalizedCurrentSegment) {
        return true;
      }

      return normalizedPlayer.includes(normalizedCurrentSegment);
    });
  }, [formValues.playersText, playerSuggestions]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));
  }

  function handlePlayerSuggestionClick(player) {
    setFormValues((currentValues) => {
      const playerSegments = currentValues.playersText.split(',');
      playerSegments[playerSegments.length - 1] = ` ${player}`;
      const nextPlayersText = playerSegments.join(',').replace(/^ /, '');

      return {
        ...currentValues,
        playersText: `${nextPlayersText}, `,
      };
    });
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
          onFocus={() => setIsPlayersFocused(true)}
          onBlur={() => setTimeout(() => setIsPlayersFocused(false), 100)}
          placeholder="Comma-separated player names"
          required
        />
        {isPlayersFocused && playerAutocompleteSuggestions.length > 0 ? (
          <div className="player-autocomplete">
            {playerAutocompleteSuggestions.slice(0, 6).map((player) => (
              <button
                key={player}
                type="button"
                className="player-autocomplete__option"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handlePlayerSuggestionClick(player)}
              >
                {player}
              </button>
            ))}
          </div>
        ) : null}
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
  playerSuggestions: PropTypes.arrayOf(PropTypes.string).isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isEditing: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
};

export default SessionForm;
