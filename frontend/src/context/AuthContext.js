// src/context/AuthContext.js
// Real backend-connected authentication context

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { loginUser, registerUser, getMe, castVoteAPI, fetchVoteStatus } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voteStatus, setVoteStatus] = useState({ hasVoted: false, votedCandidate: null, transactionId: null });

  // ── Rehydrate session from stored token ─────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('evoting_token');
      const storedUser = localStorage.getItem('evoting_user');
      if (token && storedUser) {
        try {
          const freshUser = await getMe();
          setUser(freshUser);
          // Also load vote status
          const status = await fetchVoteStatus();
          setVoteStatus(status);
        } catch {
          // Token expired or invalid — clear storage
          localStorage.removeItem('evoting_token');
          localStorage.removeItem('evoting_user');
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  // ── Login ────────────────────────────────────────────────────────────────
  const login = useCallback(async (voterId, password) => {
    const data = await loginUser(voterId, password);
    localStorage.setItem('evoting_token', data.token);
    localStorage.setItem('evoting_user', JSON.stringify(data.user));
    setUser(data.user);

    // Fetch vote status after login
    try {
      const status = await fetchVoteStatus();
      setVoteStatus(status);
    } catch { /* ignore */ }

    return data.user;
  }, []);

  // ── Register ─────────────────────────────────────────────────────────────
  const register = useCallback(async (formData) => {
    const { confirm, ...payload } = formData; // strip confirm field
    const data = await registerUser(payload);
    localStorage.setItem('evoting_token', data.token);
    localStorage.setItem('evoting_user', JSON.stringify(data.user));
    setUser(data.user);
    setVoteStatus({ hasVoted: false, votedCandidate: null, transactionId: null });
    return data.user;
  }, []);

  // ── Logout ───────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('evoting_token');
    localStorage.removeItem('evoting_user');
    setUser(null);
    setVoteStatus({ hasVoted: false, votedCandidate: null, transactionId: null });
    toast.success('Logged out successfully');
  }, []);

  // ── Vote helpers (used by VotingPage & DashboardPage) ───────────────────
  const hasVoted = useCallback(() => {
    return voteStatus.hasVoted || user?.hasVoted || false;
  }, [voteStatus, user]);

  const getVotedCandidate = useCallback(() => {
    // Return candidateId string for backward compat with pages that do CANDIDATES.find(c => c.id === votedId)
    if (voteStatus.votedCandidate) {
      return voteStatus.votedCandidate.candidateId || voteStatus.votedCandidate._id;
    }
    return null;
  }, [voteStatus]);

  const castVote = useCallback(async (candidateId) => {
    if (!user) throw new Error('Not authenticated');
    if (hasVoted()) throw new Error('You have already voted');

    const result = await castVoteAPI(candidateId);

    // Update user state
    const updatedUser = { ...user, hasVoted: true };
    setUser(updatedUser);
    localStorage.setItem('evoting_user', JSON.stringify(updatedUser));

    // Refresh vote status
    const status = await fetchVoteStatus();
    setVoteStatus(status);

    return result;
  }, [user, hasVoted]);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      hasVoted,
      getVotedCandidate,
      castVote,
      voteStatus,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
