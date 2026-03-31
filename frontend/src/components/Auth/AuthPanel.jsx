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
      <div className="auth-panel__card">
        <img src="/gamecheck-logo.png" alt="GameCheck logo" className="auth-panel__logo" />
        <p className="auth-panel__eyebrow">Passport Authentication</p>
        <h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
        <p className="auth-panel__subtitle">Sign in to manage your game library</p>
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
        <div className="auth-panel__divider" aria-hidden="true" />
        <p className="auth-panel__switch-text">
          {mode === 'login' ? 'New here?' : 'Already have an account?'}
        </p>
        <button
          type="button"
          className="auth-panel__switch-button"
          onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
        >
          {mode === 'login' ? 'Register' : 'Back to Sign In'}
        </button>
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
