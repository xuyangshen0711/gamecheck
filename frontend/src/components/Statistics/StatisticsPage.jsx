import PropTypes from 'prop-types';
import './StatisticsPage.css';

function formatPercentage(value) {
  return `${value.toFixed(1)}%`;
}

function formatRivalryScore(rivalry) {
  const [leftPlayer, rightPlayer] = rivalry.players;
  return `${rivalry.wins[leftPlayer]} - ${rivalry.wins[rightPlayer]}`;
}

function calculateChartWidth(value, max) {
  return max > 0 ? `${Math.round((value / max) * 100)}%` : '0%';
}

function MetricCard({ label, value, detail }) {
  return (
    <article className="statistics-page__metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function RankedList({ title, subtitle, emptyMessage, items, renderValue, renderMeta }) {
  return (
    <section className="statistics-page__panel">
      <div className="statistics-page__section-heading">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
      </div>
      {items.length === 0 ? (
        <p className="list-state">{emptyMessage}</p>
      ) : (
        <div className="statistics-page__rankings">
          {items.map((item, index) => (
            <article className="statistics-page__ranking-card" key={item.player || item.name}>
              <div className="statistics-page__ranking-order">#{index + 1}</div>
              <div>
                <h4>{item.player || item.name}</h4>
                <strong>{renderValue(item)}</strong>
                <p>{renderMeta(item)}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function StatisticsPage({ stats, loading, focusedPlayer, playerSuggestions, onFocusPlayerChange }) {
  const dashboard = stats?.dashboard;
  const winRates = stats?.winRates.slice(0, 5) || [];
  const mostPlayedGames = stats?.mostPlayedGames.slice(0, 5) || [];
  const currentStreaks =
    stats?.streaks.current.filter((entry) => entry.streak > 0).slice(0, 5) || [];
  const longestStreaks =
    stats?.streaks.longest.filter((entry) => entry.streak > 0).slice(0, 5) || [];
  const headToHead = stats?.headToHead.slice(0, 6) || [];
  const headToHeadChart = headToHead.slice(0, 5);
  const headToHeadMaxWins = headToHeadChart.reduce(
    (maxWins, rivalry) => Math.max(maxWins, rivalry.wins[rivalry.players[0]], rivalry.wins[rivalry.players[1]]),
    1
  );
  const winRateChart = winRates.slice(0, 5);
  const maxWinRate = winRateChart.reduce((maxRate, entry) => Math.max(maxRate, entry.winRate), 1);

  return (
    <section className="statistics-page">
      <div className="panel__heading">
        <div>
          <p className="panel__eyebrow">Built by Gaoyuan Shi</p>
          <h2>Player Statistics &amp; History</h2>
        </div>
        <label className="statistics-page__focus-filter">
          <span>Head-to-head spotlight</span>
          <select value={focusedPlayer} onChange={(event) => onFocusPlayerChange(event.target.value)}>
            <option value="">All players</option>
            {playerSuggestions.map((player) => (
              <option key={player} value={player}>
                {player}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="statistics-page__hero">
        <div className="statistics-page__hero-copy">
          <p className="statistics-page__eyebrow">Proposal Scope</p>
          <h3>Win rates, rivalries, streaks, and the shape of your game nights</h3>
          <p>
            This view turns raw session logs into player history, most-played games, streak
            tracking, and head-to-head matchups.
          </p>
        </div>
        <div className="statistics-page__metrics">
          <MetricCard
            label="Games tracked"
            value={loading ? '...' : dashboard?.gamesTracked ?? 0}
            detail="Titles with library records"
          />
          <MetricCard
            label="Sessions logged"
            value={loading ? '...' : dashboard?.sessionsLogged ?? 0}
            detail="All recorded play sessions"
          />
          <MetricCard
            label="Players tracked"
            value={loading ? '...' : dashboard?.playersTracked ?? 0}
            detail="Unique players in session history"
          />
          <MetricCard
            label="Latest winner"
            value={loading ? '...' : dashboard?.latestWinner || 'No sessions yet'}
            detail="Most recent champion on record"
          />
        </div>
      </div>

      <div className="statistics-page__insights">
        <article className="statistics-page__spotlight-card">
          <span>Most Played Game</span>
          <strong>{loading ? '...' : dashboard?.mostPlayedGame?.name || 'No sessions yet'}</strong>
          <p>
            {loading
              ? ''
              : dashboard?.mostPlayedGame
                ? `${dashboard.mostPlayedGame.sessionsPlayed} logged sessions`
                : 'Start logging sessions to reveal your staples.'}
          </p>
        </article>
        <article className="statistics-page__spotlight-card">
          <span>Best Win Rate</span>
          <strong>{loading ? '...' : dashboard?.bestWinRate?.player || 'No data yet'}</strong>
          <p>
            {loading
              ? ''
              : dashboard?.bestWinRate
                ? `${formatPercentage(dashboard.bestWinRate.winRate)} across ${dashboard.bestWinRate.appearances} appearances`
                : 'No players logged yet.'}
          </p>
        </article>
        <article className="statistics-page__spotlight-card">
          <span>Current Hottest Streak</span>
          <strong>{loading ? '...' : dashboard?.hottestStreak?.player || 'No streak yet'}</strong>
          <p>
            {loading
              ? ''
              : dashboard?.hottestStreak
                ? `${dashboard.hottestStreak.streak} straight wins`
                : 'No active winning streaks yet.'}
          </p>
        </article>
        <article className="statistics-page__spotlight-card">
          <span>Busiest Rivalry</span>
          <strong>
            {loading
              ? '...'
              : dashboard?.busiestRivalry?.players.join(' vs ') || 'No rivalry yet'}
          </strong>
          <p>
            {loading
              ? ''
              : dashboard?.busiestRivalry
                ? `${dashboard.busiestRivalry.meetings} meetings`
                : 'Need at least two-player sessions to compare rivals.'}
          </p>
        </article>
      </div>

      <div className="statistics-page__grid">
        <RankedList
          title="Win Rate Leaders"
          subtitle="Players ranked by wins divided by total appearances."
          emptyMessage="No player records yet."
          items={winRates}
          renderValue={(item) => formatPercentage(item.winRate)}
          renderMeta={(item) => `${item.wins} wins in ${item.appearances} appearances`}
        />
        <RankedList
          title="Most-Played Games"
          subtitle="The titles showing up most often in session history."
          emptyMessage="No games have session history yet."
          items={mostPlayedGames}
          renderValue={(item) => `${item.sessionsPlayed} sessions`}
          renderMeta={(item) => `Last played on ${item.lastPlayedAt}`}
        />
        <RankedList
          title="Current Streaks"
          subtitle="Consecutive wins in each player's most recent appearances."
          emptyMessage="No active streaks yet."
          items={currentStreaks}
          renderValue={(item) => `${item.streak} wins`}
          renderMeta={(item) => `Latest appearance: ${item.latestAppearanceDate}`}
        />
        <RankedList
          title="Longest Streaks"
          subtitle="Best winning runs found in the full session timeline."
          emptyMessage="No streak history yet."
          items={longestStreaks}
          renderValue={(item) => `${item.streak} wins`}
          renderMeta={(item) => `${item.startDate} to ${item.endDate}`}
        />
      </div>

      <section className="statistics-page__panel statistics-page__chart-panel">
        <div className="statistics-page__section-heading">
          <div>
            <h3>Head-to-Head Win Chart</h3>
            <p>Visualize matchup results for the selected player or the most active rivalries.</p>
          </div>
        </div>
        {headToHeadChart.length === 0 ? (
          <p className="list-state">No matchup data available for charting.</p>
        ) : (
          <div className="statistics-page__chart-grid">
            {headToHeadChart.map((rivalry) => {
              const [leftPlayer, rightPlayer] = rivalry.players;
              const leftWins = rivalry.wins[leftPlayer];
              const rightWins = rivalry.wins[rightPlayer];

              return (
                <article className="statistics-page__chart-item" key={rivalry.players.join('::')}>
                  <div className="statistics-page__chart-row">
                    <strong>{rivalry.players.join(' vs ')}</strong>
                    <span>{rivalry.meetings} meetings</span>
                  </div>
                  <div className="statistics-page__chart-bar">
                    <span
                      className="statistics-page__chart-segment statistics-page__chart-segment--left"
                      style={{ width: calculateChartWidth(leftWins, headToHeadMaxWins) }}
                    />
                    <span
                      className="statistics-page__chart-segment statistics-page__chart-segment--right"
                      style={{ width: calculateChartWidth(rightWins, headToHeadMaxWins) }}
                    />
                  </div>
                  <div className="statistics-page__chart-meta">
                    <span>{leftPlayer}: {leftWins} wins</span>
                    <span>{rightPlayer}: {rightWins} wins</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="statistics-page__panel statistics-page__chart-panel">
        <div className="statistics-page__section-heading">
          <div>
            <h3>Win Rate Distribution</h3>
            <p>Compare the top players by win rate to see who dominates the table.</p>
          </div>
        </div>
        {winRateChart.length === 0 ? (
          <p className="list-state">No win rate data available for charting.</p>
        ) : (
          <div className="statistics-page__chart-grid">
            {winRateChart.map((entry) => (
              <article className="statistics-page__chart-item" key={entry.player}>
                <div className="statistics-page__chart-row">
                  <strong>{entry.player}</strong>
                  <span>{formatPercentage(entry.winRate)}</span>
                </div>
                <div className="statistics-page__chart-bar">
                  <span
                    className="statistics-page__chart-segment statistics-page__chart-segment--left"
                    style={{ width: calculateChartWidth(entry.winRate, maxWinRate) }}
                  />
                </div>
                <div className="statistics-page__chart-meta">
                  <span>{entry.wins} wins</span>
                  <span>{entry.appearances} appearances</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="statistics-page__panel">
        <div className="statistics-page__section-heading">
          <div>
            <h3>Head-to-Head Matchups</h3>
            <p>
              {focusedPlayer
                ? `Rivalries involving ${focusedPlayer}.`
                : 'Most frequent player pairings across all recorded sessions.'}
            </p>
          </div>
        </div>
        {loading ? (
          <p className="list-state">Loading matchup data...</p>
        ) : headToHead.length === 0 ? (
          <p className="list-state">No head-to-head data yet.</p>
        ) : (
          <div className="statistics-page__matchups">
            {headToHead.map((rivalry) => (
              <article
                className="statistics-page__matchup-card"
                key={rivalry.players.join('::')}
              >
                <div className="statistics-page__matchup-header">
                  <h4>{rivalry.players.join(' vs ')}</h4>
                  <span>{rivalry.meetings} meetings</span>
                </div>
                <strong>{formatRivalryScore(rivalry)}</strong>
                <p>
                  Leader: {rivalry.leader} • Last played {rivalry.lastPlayedAt}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

MetricCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  detail: PropTypes.string.isRequired,
};

RankedList.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  emptyMessage: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  renderValue: PropTypes.func.isRequired,
  renderMeta: PropTypes.func.isRequired,
};

StatisticsPage.propTypes = {
  stats: PropTypes.shape({
    dashboard: PropTypes.object,
    winRates: PropTypes.arrayOf(PropTypes.object),
    mostPlayedGames: PropTypes.arrayOf(PropTypes.object),
    streaks: PropTypes.shape({
      current: PropTypes.arrayOf(PropTypes.object),
      longest: PropTypes.arrayOf(PropTypes.object),
    }),
    headToHead: PropTypes.arrayOf(PropTypes.object),
  }),
  loading: PropTypes.bool.isRequired,
  focusedPlayer: PropTypes.string.isRequired,
  playerSuggestions: PropTypes.arrayOf(PropTypes.string).isRequired,
  onFocusPlayerChange: PropTypes.func.isRequired,
};

StatisticsPage.defaultProps = {
  stats: null,
};

export default StatisticsPage;
