import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import './SessionFilter.css';

function SessionFilter({ games, filters, onChange }) {
  const [draftFilters, setDraftFilters] = useState(filters);
  const debounceTimeoutRef = useRef(null);

  useEffect(() => {
    setDraftFilters(filters);
  }, [filters]);

  useEffect(() => {
    return () => {
      clearTimeout(debounceTimeoutRef.current);
    };
  }, []);

  function handleGameChange(event) {
    const nextFilters = {
      gameId: event.target.value,
      player: draftFilters.player,
    };

    clearTimeout(debounceTimeoutRef.current);
    setDraftFilters(nextFilters);
    onChange(nextFilters);
  }

  function handlePlayerChange(event) {
    const nextFilters = {
      ...draftFilters,
      player: event.target.value,
    };

    clearTimeout(debounceTimeoutRef.current);
    setDraftFilters(nextFilters);
    debounceTimeoutRef.current = setTimeout(() => {
      onChange(nextFilters);
    }, 300);
  }

  return (
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
