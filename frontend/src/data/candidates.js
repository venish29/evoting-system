// src/data/candidates.js
// Static fallback data — actual data comes from the backend API.
// Kept so existing imports (ELECTION_INFO, CANDIDATES length reference) don't break.

export const ELECTION_INFO = {
  title: '2026 General Presidential Election',
  subtitle: 'Cast your vote for the next President',
  deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  totalRegistered: 248750,
};

// Empty — candidates are loaded from backend via /api/candidates
export const CANDIDATES = [];

// No mock users — auth is handled by backend JWT
export const MOCK_USERS = [];
