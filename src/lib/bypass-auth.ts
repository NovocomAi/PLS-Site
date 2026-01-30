/**
 * Auth Bypass Mode - Skip login for system testing
 * Enable with: localStorage.setItem('BYPASS_AUTH', 'true');
 * Access dashboard directly without login
 */

export interface BypassUser {
  id: string;
  email: string;
  name: string;
  role: 'client' | 'admin';
  expires_at?: number;
}

const BYPASS_TEST_USER: BypassUser = {
  id: 'bypass-user-001',
  email: 'bypass@test.local',
  name: 'System Tester',
  role: 'admin',
};

let bypassEnabled = false;
let bypassUser: BypassUser | null = null;

// Initialize bypass mode
export const initBypassMode = () => {
  const stored = localStorage.getItem('BYPASS_AUTH');
  if (stored === 'true') {
    bypassEnabled = true;
    bypassUser = { ...BYPASS_TEST_USER };
    localStorage.setItem('BYPASS_USER', JSON.stringify(bypassUser));
    console.log('🔓 BYPASS AUTH MODE ENABLED');
    console.log('   Logged in as:', bypassUser.email);
    console.log('   Role:', bypassUser.role);
    return true;
  }
  return false;
};

// Check if bypass is enabled
export const isBypassEnabled = () => bypassEnabled;

// Get bypass user (simulates auth user)
export const getBypassUser = () => {
  if (!bypassEnabled) return null;
  
  if (!bypassUser) {
    const stored = localStorage.getItem('BYPASS_USER');
    if (stored) {
      bypassUser = JSON.parse(stored);
    }
  }
  return bypassUser;
};

// Simulate auth session
export const getBypassSession = () => {
  if (!bypassEnabled || !bypassUser) return null;
  
  return {
    access_token: 'bypass-token-' + bypassUser.id,
    token_type: 'Bearer',
    expires_in: 3600,
    user: bypassUser,
  };
};

// Disable bypass
export const disableBypass = () => {
  bypassEnabled = false;
  bypassUser = null;
  localStorage.removeItem('BYPASS_AUTH');
  localStorage.removeItem('BYPASS_USER');
  console.log('🔐 Bypass mode disabled');
};

// Enable bypass
export const enableBypass = () => {
  localStorage.setItem('BYPASS_AUTH', 'true');
  initBypassMode();
};

console.log(`
╔════════════════════════════════════════════════════════════════╗
║  SYSTEM TESTING MODE AVAILABLE                                 ║
╠════════════════════════════════════════════════════════════════╣
║  To enable bypass mode (skip login):                            ║
║                                                                 ║
║  localStorage.setItem('BYPASS_AUTH', 'true');                  ║
║  location.reload();                                            ║
║                                                                 ║
║  Or run: enableBypass() then reload                            ║
║                                                                 ║
║  To disable:                                                   ║
║  localStorage.removeItem('BYPASS_AUTH');                       ║
║  location.reload();                                            ║
║                                                                 ║
╚════════════════════════════════════════════════════════════════╝
`);
