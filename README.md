# GameCheck

## Authors

- Gaoyuan Shi
- Xuyang Shen

## Class Link

- CS5610 Project 3

## Project Objective

GameCheck is a full-stack web application for tracking a personal board game library, recording game night sessions, and reviewing player statistics. The project follows the required CS5610 Project 3 stack: Node.js, Express, client-side rendered React with Hooks, and MongoDB using the official Node.js driver.
It now also implements authentication using Passport with a local username/password strategy and server-side sessions.

## Team Scope And Independent User Stories

### Gaoyuan Shi

- Build and maintain the game library workspace, including game browsing, search, selection, and game metadata editing.
- Extend the product with player statistics and history views, including summaries, win rates, streaks, and head-to-head insights.
- Implement the full stack for these stories, including React UI, API integration, and backend data support.

### Xuyang Shen

- Build and maintain the session logging workflow, including creating, editing, deleting, and filtering logged play sessions.
- Implement the dashboard and session-oriented interactions for reviewing recent activity and session summaries.
- Implement the full stack for these stories, including React UI, Express routes, and MongoDB persistence.

## Instructions to Build

### Backend

1. Copy `backend/.env.example` to `backend/.env`.
2. Install dependencies in `backend/`.
3. Set `SESSION_SECRET` in `backend/.env`.
4. Start MongoDB locally or provide a MongoDB connection string.
5. Run `npm run seed` to generate synthetic data. The primary seed creates more than 1,000 MongoDB records across the `games` and `sessions` collections.
6. Run `npm run dev` or `npm start`.

### Frontend

1. Install dependencies in `frontend/`.
2. Optional: create `frontend/.env` with `VITE_API_BASE_URL=http://localhost:4000/api`.
3. Run `npm run dev`.

## Render Deployment

This repository includes a root-level [render.yaml](./render.yaml) so you can deploy the app as a single Render web service.

1. Push the repository to GitHub.
2. Create a MongoDB Atlas cluster and copy the application connection string.
3. In Render, click `New` -> `Blueprint` and select this repository.
4. When prompted for `MONGO_URI`, paste your Atlas connection string.
5. Complete the deploy. Render will build the React frontend, start the Express server, and serve the built frontend from the same service.
6. After the first deploy, seed the cloud database from your machine with:

```bash
MONGO_URI="your-atlas-connection-string" npm run render-seed
```

7. Open the Render service URL and verify that the dashboard, game library, and session logging features work.

## Feature Scope

- Create, edit, delete, search, and browse games in the library.
- Create, edit, delete, filter, and browse logged sessions.
- Filter sessions by game and player.
- View a lightweight dashboard summary for games, sessions, players, and the latest winner.
- View player statistics such as win rates, streaks, rivalry matchups, and most-played games.
- Register, sign in, and sign out with Passport local authentication.

## Project Structure

- `backend/`: Express API, MongoDB driver integration, and seed script.
- `frontend/`: React client with hooks, PropTypes, and component-scoped CSS.

## Assignment Notes

- The project uses `fetch` on the frontend and the MongoDB Node driver on the backend.
- The project intentionally avoids `axios`, `mongoose`, and the `cors` package to align with the assignment restrictions.

## AI Usage Disclosure

- AI tools were used for limited development support such as debugging, wording cleanup, and small UI/code refinements.
- The application structure, implementation decisions, and final review were completed by the project team.
