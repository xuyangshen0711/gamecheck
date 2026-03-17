import { useState } from 'react';
import PropTypes from 'prop-types';
import { api } from '../../api.js';
import GameForm from './GameForm.jsx';
import GameList from './GameList.jsx';
import './GameLibrary.css';

const emptyGame = {
  name: '',
  category: '',
  minPlayers: 2,
  maxPlayers: 4,
  description: '',
};

function GameLibrary({ games, loading, onDataChange, onJumpToSessionLogging, setErrorMessage }) {
  const [searchValue, setSearchValue] = useState('');
  const [editingGame, setEditingGame] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(payload) {
    setSubmitting(true);

    try {
      if (editingGame) {
        await api.updateGame(editingGame.id, payload);
      } else {
        await api.createGame(payload);
      }

      setEditingGame(null);
      setErrorMessage('');
      await onDataChange();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(gameId) {
    try {
      await api.deleteGame(gameId);
      setErrorMessage('');
      await onDataChange();
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  const filteredGames = games.filter((game) => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    if (!normalizedSearch) {
      return true;
    }

    return (
      game.name.toLowerCase().includes(normalizedSearch) ||
      game.category.toLowerCase().includes(normalizedSearch)
    );
  });

  return (
    <section className="panel">
      <div className="panel__heading">
        <div>
          <p className="panel__eyebrow">Xuyang Shen</p>
          <h2>Game Library</h2>
        </div>
        <div className="panel__controls">
          <label className="panel__search">
            <span>Search games</span>
            <input
              type="search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search by name or category"
            />
          </label>
          <button type="button" className="button-secondary panel__jump" onClick={onJumpToSessionLogging}>
            Back to Session Logging
          </button>
        </div>
      </div>
      <GameForm
        initialValues={editingGame || emptyGame}
        onSubmit={handleSubmit}
        onCancel={() => setEditingGame(null)}
        isEditing={Boolean(editingGame)}
        submitting={submitting}
      />
      <GameList
        games={filteredGames}
        loading={loading}
        onEdit={setEditingGame}
        onDelete={handleDelete}
      />
    </section>
  );
}

GameLibrary.propTypes = {
  games: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool.isRequired,
  onDataChange: PropTypes.func.isRequired,
  onJumpToSessionLogging: PropTypes.func.isRequired,
  setErrorMessage: PropTypes.func.isRequired,
};

export default GameLibrary;
