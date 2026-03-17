import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './SessionFilter.css';

function SessionFilter({ games, filters, onChange }) {
  const [draftFilters, setDraftFilters] = useState(filters);

  useEffect(() => {
    setDraftFilters(filters);
  }, [filters]);

  function handleGameChange(event) {
    setDraftFilters((currentFilters) => ({
      ...currentFilters,
      gameId: event.target.value,
    }));
  }

  function handlePlayerChange(event) {
    setDraftFilters((currentFilters) => ({
      ...currentFilters,
      player: event.target.value,
    }));
  }

  function handleApplyFilters() {
    onChange(draftFilters);
  }

  function handleClearFilters() {
    const clearedFilters = {
      gameId: '',
      player: '',
    };

    setDraftFilters(clearedFilters);
    onChange(clearedFilters);
  }

  return (
    <>
      <div className="filter-row">
        <label>
          <span>Filter by game</span>
          <select value={draftFilters.gameId} onChange={handleGameChange}>
            <option value="">All games</option>
            {games.map((game) => (
              <option key={game.id} value={game.id}>
                {game.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Filter by player</span>
          <input
            type="search"
            value={draftFilters.player}
            onChange={handlePlayerChange}
            placeholder="Enter player name"
          />
        </label>
      </div>
      <div className="filter-actions">
        <button type="button" onClick={handleApplyFilters}>
          Apply Filters
        </button>
        <button type="button" className="button-secondary" onClick={handleClearFilters}>
          Clear
        </button>
      </div>
    </>
  );
}

SessionFilter.propTypes = {
  games: PropTypes.arrayOf(PropTypes.object).isRequired,
  filters: PropTypes.shape({
    gameId: PropTypes.string.isRequired,
    player: PropTypes.string.isRequired,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default SessionFilter;
