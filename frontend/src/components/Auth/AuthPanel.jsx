import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import './AuthPanel.css';

function AuthPanel({ submitting, errorMessage, onAuthenticate }) {
  const [mode, setMode] = useState('login');
  const [formValues, setFormValues] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [localError, setLocalError] = useState('');

  const visibleError = localError || errorMessage;
  const submitLabel = useMemo(() => {
    if (submitting) {
      return mode === 'login' ? 'Signing in...' : 'Creating account...';
    }

    return mode === 'login' ? 'Sign In' : 'Create Account';
  }, [mode, submitting]);

  function switchMode(nextMode) {
    setMode(nextMode);
    setLocalError('');
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));
    setLocalError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (mode === 'register' && formValues.password !== formValues.confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    await onAuthenticate(
      {
        username: formValues.username,
        password: formValues.password,
      },
      mode
    );
  }

  return (
    <section className="auth-panel">
      <div className="auth-panel__intro">
        <p className="auth-panel__eyebrow">Passport Authentication</p>
        <h2>Sign in to manage your game library</h2>
        <p>
          This project now protects the workspace with a Passport local strategy and a persistent
          server-side session.
        </p>
      </div>
      <div className="auth-panel__card">
        <div className="auth-panel__tabs">
          <button
            type="button"
            className={mode === 'login' ? 'auth-panel__tab auth-panel__tab--active' : 'auth-panel__tab'}
            onClick={() => switchMode('login')}
          >
            Sign In
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'auth-panel__tab auth-panel__tab--active' : 'auth-panel__tab'}
            onClick={() => switchMode('register')}
          >
            Register
          </button>
        </div>
        <form className="auth-panel__form" onSubmit={handleSubmit}>
          <label>
            <span>Username</span>
            <input
              autoComplete="username"
              name="username"
              value={formValues.username}
              onChange={handleChange}
              placeholder="e.g. gaoyuan"
              required
            />
          </label>
          <label>
            <span>Password</span>
            <input
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              name="password"
              type="password"
              value={formValues.password}
              onChange={handleChange}
              placeholder="At least 8 characters"
              required
            />
          </label>
          {mode === 'register' ? (
            <label>
              <span>Confirm password</span>
              <input
                autoComplete="new-password"
                name="confirmPassword"
                type="password"
                value={formValues.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat the password"
                required
              />
            </label>
          ) : null}
          {visibleError ? <p className="auth-panel__error">{visibleError}</p> : null}
          <button type="submit" disabled={submitting}>
            {submitLabel}
          </button>
        </form>
      </div>
    </section>
  );
}

AuthPanel.propTypes = {
  submitting: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string.isRequired,
  onAuthenticate: PropTypes.func.isRequired,
};

export default AuthPanel;
