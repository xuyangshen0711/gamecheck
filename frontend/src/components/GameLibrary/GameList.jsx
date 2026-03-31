import PropTypes from 'prop-types';
import './GameList.css';

const categoryColors = {
  strategy: '#17324d',
  abstract: '#2b6b63',
  party: '#e07c4f',
  cooperative: '#4a9e6f',
  family: '#6b8ec4',
  'engine building': '#8b6bb5',
  'tile placement': '#c4956b',
};

function getCategoryColor(category) {
  return categoryColors[category.trim().toLowerCase()] || '#526070';
}

function GameList({ games, loading, hasSearchQuery, onEdit, onDelete }) {
  if (loading) {
    return <p className="list-state">Loading game library...</p>;
  }

  if (games.length === 0) {
    return (
      <div className="list-state list-state--empty">
        <span className="list-state__emoji" aria-hidden="true">🎲</span>
        <p>{hasSearchQuery ? 'No games matched your search.' : 'No games yet. Add your first game above!'}</p>
      </div>
    );
  }

  return (
    <div className="game-list">
      {games.map((game) => (
        <article
          className="game-list__item"
          key={game.id}
          style={{ '--game-category-color': getCategoryColor(game.category) }}
        >
          <div>
            <h3>{game.name}</h3>
            <p className="game-list__meta">
              {game.category} • {game.minPlayers}-{game.maxPlayers} players
            </p>
            <p>{game.description || 'No description provided yet.'}</p>
          </div>
          <div className="game-list__actions">
            <button
              type="button"
              className="game-list__action-button game-list__action-button--edit"
              aria-label={`Edit ${game.name}`}
              onClick={() => onEdit(game)}
            >
              Edit
            </button>
            <button
              type="button"
              className="game-list__action-button game-list__action-button--delete"
              aria-label={`Delete ${game.name}`}
              onClick={() => onDelete(game.id)}
            >
              Delete
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

GameList.propTypes = {
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
  loading: PropTypes.bool.isRequired,
  hasSearchQuery: PropTypes.bool.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default GameList;
