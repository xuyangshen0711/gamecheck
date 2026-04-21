import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './GameForm.css';

const CUSTOM_GAME_VALUE = '__custom__';
const ALL_GAMES_VALUE = '';
const CURATED_GAME_NAMES = [
  'Azul',
  'Catan',
  'Codenames',
  'Wingspan',
  'Ticket to Ride',
  'Pandemic',
  'Splendor',
  'Carcassonne',
];

function GameForm({ games, initialValues, onSubmit, onCancel, isEditing, submitting }) {
  const [formValues, setFormValues] = useState(initialValues);

  function getSelectedGameValue(game) {
    if (!game.id && !game.name) {
      return ALL_GAMES_VALUE;
    }

    if (CURATED_GAME_NAMES.includes(game.name)) {
      return game.name;
    }

    return CUSTOM_GAME_VALUE;
  }

  const [selectedGameId, setSelectedGameId] = useState(getSelectedGameValue(initialValues));

  useEffect(() => {
    setFormValues(initialValues);
    setSelectedGameId(getSelectedGameValue(initialValues));
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

    const selectedGame = games.find((game) => game.name === value);

    if (!selectedGame) {
      setFormValues((currentValues) => ({
        ...currentValues,
        id: '',
        name: value,
      }));
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
  const isUpdatingExistingGame = Boolean(formValues.id);

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <div className="form-card__grid">
        <label>
          <span>Game</span>
          <select name="selectedGameId" value={selectedGameId} onChange={handleGameSelectionChange}>
            <option value={ALL_GAMES_VALUE}>All games</option>
            {CURATED_GAME_NAMES.map((gameName) => (
              <option key={gameName} value={gameName}>
                {gameName}
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
