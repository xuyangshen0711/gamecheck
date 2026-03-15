import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './GameForm.css';

function GameForm({ initialValues, onSubmit, onCancel, isEditing, submitting }) {
  const [formValues, setFormValues] = useState(initialValues);

  useEffect(() => {
    setFormValues(initialValues);
  }, [initialValues]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: name === 'minPlayers' || name === 'maxPlayers' ? Number(value) : value,
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
          <span>Game name</span>
          <input name="name" value={formValues.name} onChange={handleChange} required />
        </label>
        <label>
          <span>Category</span>
          <input name="category" value={formValues.category} onChange={handleChange} required />
        </label>
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
          {submitting ? 'Saving...' : isEditing ? 'Update Game' : 'Add Game'}
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
  initialValues: PropTypes.shape({
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
