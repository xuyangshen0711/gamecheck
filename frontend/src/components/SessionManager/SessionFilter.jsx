import PropTypes from 'prop-types';
import './SessionFilter.css';

function SessionFilter({ games, filters, onChange }) {
  return (
    <div className="filter-row">
      <label>
        <span>Filter by game</span>
        <select
          value={filters.gameId}
          onChange={(event) => onChange({ ...filters, gameId: event.target.value })}
        >
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
          value={filters.player}
          onChange={(event) => onChange({ ...filters, player: event.target.value })}
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
