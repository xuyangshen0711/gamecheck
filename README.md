# GameCheck

## Author

- Xuyang Shen

## Class Link

- CS5610 Project 3

## Project Objective

GameCheck is a full-stack web application for tracking a personal board game library and recording game night sessions. This implementation focuses on Xuyang Shen's assigned scope: game library management and session logging.

## Screenshot

- Add a screenshot of the running app before submission.

## Instructions to Build

### Backend

1. Copy `backend/.env.example` to `backend/.env`.
2. Install dependencies in `backend/`.
3. Start MongoDB locally or provide a MongoDB connection string.
4. Run `npm run seed` to generate synthetic data.
5. Run `npm run dev` or `npm start`.

### Frontend

1. Install dependencies in `frontend/`.
2. Optional: create `frontend/.env` with `VITE_API_BASE_URL=http://localhost:4000/api`.
3. Run `npm run dev`.

## Feature Scope

- Create, edit, delete, search, and browse games in the library.
- Create, edit, delete, filter, and browse logged sessions.
- Filter sessions by game and player.
- View a lightweight dashboard summary for games, sessions, players, and the latest winner.

## Project Structure

- `backend/`: Express API, MongoDB driver integration, and seed script.
- `frontend/`: React client with hooks, PropTypes, and component-scoped CSS.

## Notes

- The project uses `fetch` on the frontend and the MongoDB Node driver on the backend.
- The project intentionally avoids `axios`, `mongoose`, and the `cors` package to align with the assignment restrictions.
