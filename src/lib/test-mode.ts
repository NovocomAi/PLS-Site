/**
 * TEST MODE - Bypass auth to test system functionality
 * Use only for testing. Disabled in production.
 * 
 * To enable test mode:
 * 1. Set localStorage.setItem('DEBUG_TEST_MODE', 'true')
 * 2. In browser console: DEBUG_TEST_MODE enabled
 * 3. Can test full flow without auth working
 */

export interface TestUser {
  id: string;
  email: string;
  name: string;
  role: 'client' | 'admin';
}

const TEST_USERS: Record<string, TestUser> = {
  'client@pls.com': {
    id: 'test-client-001',
    email: 'client@pls.com',
    name: 'Test Client',
    role: 'client',
  },
  'admin@pls.com': {
    id: 'test-admin-001',
    email: 'admin@pls.com',
    name: 'Test Admin',
    role: 'admin',
  },
  'jp.couto@hotmail.com': {
    id: 'test-user-001',
    email: 'jp.couto@hotmail.com',
    name: 'Joao Pedro Silva Couto',
    role: 'client',
  },
};

let testModeEnabled = false;
let testUser: TestUser | null = null;

// Initialize test mode from localStorage
export const initTestMode = () => {
  const stored = localStorage.getItem('DEBUG_TEST_MODE');
  if (stored === 'true' && import.meta.env.MODE !== 'production') {
    testModeEnabled = true;
    console.log('🧪 TEST MODE ENABLED');
    console.log('Available test users:');
    Object.keys(TEST_USERS).forEach(email => {
      console.log(`  - ${email}`);
    });
  }
};

// Check if test mode is active
export const isTestModeEnabled = () => testModeEnabled;

// Simulate login for testing
export const testModeLogin = (email: string, password: string) => {
  if (!testModeEnabled) {
    throw new Error('Test mode not enabled');
  }

  const user = TEST_USERS[email];
  if (!user) {
    throw new Error(`Unknown test user: ${email}`);
  }

  // Simulate password check
  if (password !== 'test' && password !== 'TestPassword123!' && password !== 'ClientTest123!' && password !== 'AdminTest123!' && password !== 'k7XIejXiTlcG') {
    throw new Error('Invalid test password');
  }

  testUser = user;
  localStorage.setItem('TEST_USER', JSON.stringify(user));
  console.log(`✅ Test user logged in: ${user.email}`);
  return user;
};

// Get current test user
export const getTestUser = () => {
  if (!testModeEnabled) return null;
  
  if (!testUser) {
    const stored = localStorage.getItem('TEST_USER');
    if (stored) {
      testUser = JSON.parse(stored);
    }
  }
  return testUser;
};

// Test logout
export const testModeLogout = () => {
  testUser = null;
  localStorage.removeItem('TEST_USER');
  console.log('✅ Test user logged out');
};

// Mock data for testing
export const getMockClients = () => [
  { id: '1', name: 'Casa Portuguesa', email: 'test1@pls.com', status: 'active' },
  { id: '2', name: 'Cristina Maria', email: 'test2@pls.com', status: 'active' },
  { id: '3', name: 'Antonio Gaspar', email: 'test3@pls.com', status: 'pending' },
];

export const getMockServices = () => [
  { id: '1', name: 'Cleaning Service', price: 150, duration: '3 hours' },
  { id: '2', name: 'Garden Maintenance', price: 200, duration: '4 hours' },
  { id: '3', name: 'Home Repair', price: 250, duration: 'varies' },
];

export const getMockInvoices = () => [
  { id: '1', clientId: '1', amount: 150, status: 'paid', date: '2026-01-28' },
  { id: '2', clientId: '2', amount: 200, status: 'pending', date: '2026-01-29' },
  { id: '3', clientId: '3', amount: 250, status: 'overdue', date: '2026-01-20' },
];

// Enable test mode in browser console:
// localStorage.setItem('DEBUG_TEST_MODE', 'true'); location.reload();
// 
// Then login with any test user above using password 'test'
