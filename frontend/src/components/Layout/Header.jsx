import PropTypes from 'prop-types';
import './Header.css';

function Header({ currentUser, onLogout, logoutPending, theme, onThemeChange, themeOptions }) {
  return (
    <header className="header">
      <div>
        <p className="header__eyebrow">CS5610 Project 3</p>
        <div className="header__brand">
          <img src="/gamecheck-logo.png" alt="GameCheck logo" className="header__logo" />
          <h1>GameCheck</h1>
        </div>
      </div>
      <div className="header__meta">
        <p className="header__summary">
          Track your game library, log each session, and keep a reliable history of game nights.
        </p>
        <label className="header__theme-selector">
          <span>Theme</span>
          <select value={theme} onChange={onThemeChange}>
            {themeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        {currentUser ? (
          <div className="header__auth">
            <p className="header__user">Signed in as <strong>{currentUser.username}</strong></p>
            <button type="button" className="button-secondary" onClick={onLogout} disabled={logoutPending}>
              {logoutPending ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}

Header.propTypes = {
  currentUser: PropTypes.shape({
    username: PropTypes.string.isRequired,
  }),
  onLogout: PropTypes.func.isRequired,
  logoutPending: PropTypes.bool.isRequired,
  theme: PropTypes.string.isRequired,
  onThemeChange: PropTypes.func.isRequired,
  themeOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
};

Header.defaultProps = {
  currentUser: null,
};

export default Header;
