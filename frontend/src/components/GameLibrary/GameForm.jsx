import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './GameForm.css';

const CUSTOM_GAME_VALUE = '__custom__';
const ALL_GAMES_VALUE = '';

function GameForm({ games, initialValues, onSubmit, onCancel, isEditing, submitting }) {
  const [formValues, setFormValues] = useState(initialValues);
  const [selectedGameId, setSelectedGameId] = useState(
    initialValues.id || ALL_GAMES_VALUE
  );

  useEffect(() => {
    setFormValues(initialValues);
    setSelectedGameId(initialValues.id || ALL_GAMES_VALUE);
  }, [initialValues]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: name === 'minPlayers' || name === 'maxPlayers' ? Number(value) : value,
    }));
  }

  function handleGameSelectionChange(event) {
    const { value } = event.target;
    setSelectedGameId(value);

    if (value === ALL_GAMES_VALUE) {
      setFormValues((currentValues) => ({
        ...currentValues,
        id: '',
        name: '',
      }));
      return;
    }

    if (value === CUSTOM_GAME_VALUE) {
      setFormValues((currentValues) => ({
        ...currentValues,
        id: '',
        name: '',
      }));
      return;
    }

    const selectedGame = games.find((game) => game.id === value);

    if (!selectedGame) {
      return;
    }

    setFormValues({
      ...selectedGame,
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit(formValues);
  }

  const isCustomGame = selectedGameId === CUSTOM_GAME_VALUE;
  const isUpdatingExistingGame =
    selectedGameId !== ALL_GAMES_VALUE && selectedGameId !== CUSTOM_GAME_VALUE;

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <div className="form-card__grid">
        <label>
          <span>Game</span>
          <select name="selectedGameId" value={selectedGameId} onChange={handleGameSelectionChange}>
            <option value={ALL_GAMES_VALUE}>All games</option>
            {games.map((game) => (
              <option key={game.id} value={game.id}>
                {game.name}
              </option>
            ))}
            <option value={CUSTOM_GAME_VALUE}>Custom game</option>
          </select>
        </label>
        <label>
          <span>Category</span>
          <input name="category" value={formValues.category} onChange={handleChange} required />
        </label>
        {isCustomGame ? (
          <label className="form-card__field form-card__field--full">
            <span>Custom game name</span>
            <input name="name" value={formValues.name} onChange={handleChange} required />
          </label>
        ) : null}
        <label>
          <span>Min players</span>
          <input
            min="1"
            name="minPlayers"
            type="number"
            value={formValues.minPlayers}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          <span>Max players</span>
          <input
            min="1"
            name="maxPlayers"
            type="number"
            value={formValues.maxPlayers}
            onChange={handleChange}
            required
          />
        </label>
      </div>
      <label>
        <span>Description</span>
        <textarea
          name="description"
          value={formValues.description}
          onChange={handleChange}
          rows="3"
        />
      </label>
      <div className="form-card__actions">
        <button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : isEditing || isUpdatingExistingGame ? 'Update Game' : 'Add Game'}
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

GameForm.propTypes = {
  games: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      category: PropTypes.string.isRequired,
      minPlayers: PropTypes.number.isRequired,
      maxPlayers: PropTypes.number.isRequired,
      description: PropTypes.string.isRequired,
    })
  ).isRequired,
  initialValues: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    minPlayers: PropTypes.number.isRequired,
    maxPlayers: PropTypes.number.isRequired,
    description: PropTypes.string.isRequired,
  }).isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isEditing: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
};

export default GameForm;
