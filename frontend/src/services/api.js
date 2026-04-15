// src/services/api.js
// Real HTTP calls to the Express backend

import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// ── Axios instance ──────────────────────────────────────────────────────────
const api = axios.create({ baseURL: BASE_URL });

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('evoting_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If token expired/invalid, auto-logout
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('evoting_token');
      localStorage.removeItem('evoting_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ────────────────────────────────────────────────────────────────────

export const loginUser = async (voterId, password) => {
  const { data } = await api.post('/auth/login', { voterId, password });
  return data; // { success, token, user }
};

export const registerUser = async (formData) => {
  const { data } = await api.post('/auth/register', formData);
  return data; // { success, token, user }
};

export const getMe = async () => {
  const { data } = await api.get('/auth/me');
  return data.user;
};

// ── Candidates ──────────────────────────────────────────────────────────────

export const fetchCandidates = async (search = '') => {
  const { data } = await api.get('/candidates', { params: { search } });
  // Normalize _id → id so existing components keep working
  return data.candidates.map(c => ({ ...c, id: c.candidateId }));
};

export const fetchCandidateById = async (candidateId) => {
  const { data } = await api.get(`/candidates/${candidateId}`);
  return { ...data.candidate, id: data.candidate.candidateId };
};

// ── Votes ───────────────────────────────────────────────────────────────────

export const castVoteAPI = async (candidateId) => {
  const { data } = await api.post('/votes/cast', { candidateId });
  return data; // { success, transactionId, candidateName }
};

export const fetchVoteStatus = async () => {
  const { data } = await api.get('/votes/status');
  return data; // { hasVoted, votedCandidate, transactionId }
};

export const fetchResults = async () => {
  const { data } = await api.get('/votes/results');
  // Normalize for existing components (they use c.id)
  const candidates = data.candidates.map(c => ({ ...c, id: c.candidateId }));
  return {
    candidates,
    total: data.total,
    turnout: data.turnout,
    totalRegistered: data.totalRegistered,
    electionTitle: data.electionTitle,
    deadline: data.deadline,
  };
};

// ── Admin ───────────────────────────────────────────────────────────────────

export const fetchAdminStats = async () => {
  const { data } = await api.get('/admin/stats');
  return data.stats;
};

export const fetchAdminResults = async () => {
  const { data } = await api.get('/admin/stats');
  const candidates = data.candidates.map(c => ({ ...c, id: c.candidateId }));
  return {
    candidates,
    total: data.total,
    turnout: data.turnout,
  };
};

export const fetchActivityLog = async () => {
  const { data } = await api.get('/admin/activity');
  return data.activity;
};

export const fetchAdminExport = async () => {
  const { data } = await api.get('/admin/export');
  return data.data;
};

export const fetchElection = async () => {
  const { data } = await api.get('/admin/election');
  return data.election;
};

// ── Profile ─────────────────────────────────────────────────────────────────

export const fetchProfile = async () => {
  const { data } = await api.get('/profile');
  return data.profile;
};

export default api;
