import React, { useState, useEffect } from 'react';
import { signIn } from '../lib/supabase';
import { isBypassEnabled, getBypassUser, enableBypass, disableBypass } from '../lib/bypass-auth';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

export const LoginWithBypass: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('test@pls.com');
  const [password, setPassword] = useState('TestPassword123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [bypassMode, setBypassMode] = useState(isBypassEnabled());

  useEffect(() => {
    // Check if bypass is already enabled
    if (isBypassEnabled()) {
      const user = getBypassUser();
      if (user) {
        onLoginSuccess(user);
      }
    }
  }, [onLoginSuccess]);

  const handleNormalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn(email, password);
      if (result?.user) {
        onLoginSuccess(result.user);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBypassToggle = () => {
    if (bypassMode) {
      // Disable bypass
      disableBypass();
      setBypassMode(false);
      setError('');
    } else {
      // Enable bypass
      enableBypass();
      setBypassMode(true);
      const user = getBypassUser();
      if (user) {
        onLoginSuccess(user);
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Welcome back</h1>
        <p>Sign in to access your secure portal</p>

        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

        {bypassMode && (
          <div className="bypass-banner">
            🔓 BYPASS MODE ENABLED - Testing without login
            <button 
              className="bypass-toggle"
              onClick={handleBypassToggle}
            >
              Disable Bypass
            </button>
          </div>
        )}

        <form onSubmit={handleNormalLogin}>
          <div className="form-group">
            <label>EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={bypassMode}
            />
          </div>

          <div className="form-group">
            <label>PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              disabled={bypassMode}
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading || bypassMode}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <hr />

        <div className="bypass-section">
          <p>🧪 Testing the system?</p>
          <button 
            className="btn-secondary"
            onClick={handleBypassToggle}
          >
            {bypassMode ? '🔐 Exit Test Mode' : '🔓 Enter Test Mode (Skip Login)'}
          </button>
          <small>
            {bypassMode 
              ? 'You are in bypass mode. You will skip authentication.'
              : 'Enable bypass mode to test the dashboard without logging in.'}
          </small>
        </div>

        <div className="test-credentials">
          <p>📋 Test Credentials:</p>
          <code>test@pls.com / TestPassword123!</code>
          <code>client@pls.com / ClientTest123!</code>
          <code>admin@pls.com / AdminTest123!</code>
        </div>
      </div>
    </div>
  );
};

export default LoginWithBypass;
