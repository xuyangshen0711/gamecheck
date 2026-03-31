import { useState } from 'react';
import PropTypes from 'prop-types';
import { api } from '../../api.js';
import GameForm from './GameForm.jsx';
import GameList from './GameList.jsx';
import './GameLibrary.css';

const emptyGame = {
  id: '',
  name: '',
  category: '',
  minPlayers: 2,
  maxPlayers: 4,
  description: '',
};

function GameLibrary({ games, loading, onDataChange, onOpenSessionLogging, setErrorMessage }) {
  const [searchValue, setSearchValue] = useState('');
  const [editingGame, setEditingGame] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isFormExpanded, setIsFormExpanded] = useState(false);

  async function handleSubmit(payload) {
    setSubmitting(true);
    const { id, ...gamePayload } = payload;
    const targetGameId = id || editingGame?.id;

    try {
      if (targetGameId) {
        await api.updateGame(targetGameId, gamePayload);
      } else {
        await api.createGame(gamePayload);
      }

      setEditingGame(null);
      setIsFormExpanded(false);
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

  function handleEdit(game) {
    setEditingGame(game);
    setIsFormExpanded(true);
  }

  function handleCancelEdit() {
    setEditingGame(null);
    setIsFormExpanded(false);
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
          <p className="panel__eyebrow">Built by Gaoyuan Shi</p>
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
          <button
            type="button"
            className="button-secondary panel__jump"
            onClick={onOpenSessionLogging}
          >
            Open Session Logging
          </button>
        </div>
      </div>
      <div className="panel__form-section">
        <button
          type="button"
          className="panel__toggle"
          aria-expanded={isFormExpanded}
          aria-controls="game-form-region"
          onClick={() => {
            if (isFormExpanded && editingGame) {
              setEditingGame(null);
            }

            setIsFormExpanded((currentValue) => !currentValue);
          }}
        >
          <span className="panel__toggle-icon" aria-hidden="true">
            {isFormExpanded ? '-' : '+'}
          </span>
          {isFormExpanded ? 'Hide Game Form' : 'Add New Game'}
        </button>
        <div
          id="game-form-region"
          className={isFormExpanded ? 'panel__form-wrapper panel__form-wrapper--expanded' : 'panel__form-wrapper'}
        >
          <GameForm
            games={games}
            initialValues={editingGame || emptyGame}
            onSubmit={handleSubmit}
            onCancel={handleCancelEdit}
            isEditing={Boolean(editingGame)}
            submitting={submitting}
          />
        </div>
      </div>
      <GameList
        games={filteredGames}
        loading={loading}
        hasSearchQuery={Boolean(searchValue.trim())}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </section>
  );
}

GameLibrary.propTypes = {
  games: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool.isRequired,
  onDataChange: PropTypes.func.isRequired,
  onOpenSessionLogging: PropTypes.func.isRequired,
  setErrorMessage: PropTypes.func.isRequired,
};

export default GameLibrary;
