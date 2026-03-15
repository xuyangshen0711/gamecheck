export function validateGamePayload(payload) {
  const errors = [];

  if (!payload.name || !payload.name.trim()) {
    errors.push('Game name is required.');
  }

  if (!payload.category || !payload.category.trim()) {
    errors.push('Category is required.');
  }

  const minPlayers = Number(payload.minPlayers);
  const maxPlayers = Number(payload.maxPlayers);

  if (!Number.isInteger(minPlayers) || minPlayers < 1) {
    errors.push('Minimum players must be an integer greater than 0.');
  }

  if (!Number.isInteger(maxPlayers) || maxPlayers < minPlayers) {
    errors.push('Maximum players must be an integer greater than or equal to minimum players.');
  }

  return errors;
}

export function validateSessionPayload(payload) {
  const errors = [];

  if (!payload.gameId || !payload.gameId.trim()) {
    errors.push('Game selection is required.');
  }

  if (!payload.sessionDate || !payload.sessionDate.trim()) {
    errors.push('Session date is required.');
  }

  if (!Array.isArray(payload.players) || payload.players.length < 2) {
    errors.push('At least two players are required.');
  }

  const normalizedPlayers = Array.isArray(payload.players)
    ? payload.players.map((player) => player.trim()).filter(Boolean)
    : [];

  if (normalizedPlayers.length !== new Set(normalizedPlayers.map((player) => player.toLowerCase())).size) {
    errors.push('Player names must be unique within a session.');
  }

  if (!payload.winner || !payload.winner.trim()) {
    errors.push('Winner is required.');
  } else if (!normalizedPlayers.includes(payload.winner.trim())) {
    errors.push('Winner must match one of the players in the session.');
  }

  return errors;
}
