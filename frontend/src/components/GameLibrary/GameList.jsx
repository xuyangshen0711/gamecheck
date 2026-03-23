import PropTypes from 'prop-types';
import './GameList.css';

function GameList({ games, loading, onEdit, onDelete }) {
  if (loading) {
    return <p className="list-state">Loading game library...</p>;
  }

  if (games.length === 0) {
    return (
      <p className="list-state">No games found. Add your first title above.</p>
    );
  }

  return (
    <div className="game-list">
      {games.map((game) => (
        <article className="game-list__item" key={game.id}>
          <div>
            <h3>{game.name}</h3>
            <p className="game-list__meta">
              {game.category} • {game.minPlayers}-{game.maxPlayers} players
            </p>
            <p>{game.description || 'No description provided yet.'}</p>
          </div>
          <div className="game-list__actions">
            <button type="button" onClick={() => onEdit(game)}>
              Edit
            </button>
            <button
              type="button"
              className="button-danger"
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
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default GameList;
