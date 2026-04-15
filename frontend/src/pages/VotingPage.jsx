// src/pages/VotingPage.jsx — connected to real backend
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchCandidates, fetchResults } from '../services/api';
import { Search, Vote, CheckCircle, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import CandidateCard from '../components/CandidateCard';
import { Modal, PageLoader, CountdownTimer, Alert, SkeletonCard } from '../components/UI';

const VotingPage = () => {
  const { hasVoted, getVotedCandidate, castVote, voteStatus } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [electionInfo, setElectionInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [search, setSearch] = useState('');
  const [filterParty, setFilterParty] = useState('');
  const [confirmCandidate, setConfirmCandidate] = useState(null);
  const [voted, setVoted] = useState(hasVoted());
  const [votedId, setVotedId] = useState(getVotedCandidate());
  const [showSuccess, setShowSuccess] = useState(false);

  const loadCandidates = useCallback(async (s = '') => {
    setLoading(true);
    try {
      const [cands, results] = await Promise.all([
        fetchCandidates(s),
        fetchResults(),
      ]);
      setCandidates(cands);
      setElectionInfo(results);
    } catch (err) {
      console.error('Failed to load candidates', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCandidates(); }, [loadCandidates]);

  useEffect(() => {
    const t = setTimeout(() => loadCandidates(search), 300);
    return () => clearTimeout(t);
  }, [search, loadCandidates]);

  // Sync voted state from auth context
  useEffect(() => {
    setVoted(hasVoted());
    setVotedId(getVotedCandidate());
  }, [hasVoted, getVotedCandidate, voteStatus]);

  const parties = [...new Set(candidates.map(c => c.party))];
  const filtered = filterParty ? candidates.filter(c => c.party === filterParty) : candidates;

  const confirmVote = async () => {
    if (!confirmCandidate) return;
    setVoting(true);
    try {
      const result = await castVote(confirmCandidate.candidateId || confirmCandidate.id);
      setVotedId(confirmCandidate.candidateId || confirmCandidate.id);
      setVoted(true);
      setConfirmCandidate(null);
      setShowSuccess(true);
      toast.success(`Vote cast for ${confirmCandidate.name}!`, { icon: '🗳️', duration: 5000 });
      loadCandidates();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to cast vote');
      setConfirmCandidate(null);
    } finally {
      setVoting(false);
    }
  };

  const deadline = electionInfo?.deadline || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

  return (
    <div className="page-enter space-y-6">
      {/* Header */}
      <div className="card p-6 bg-gradient-to-r from-navy-50 to-indigo-50 dark:from-navy-900 dark:to-navy-800 border-navy-100 dark:border-navy-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white">Cast Your Vote</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{electionInfo?.electionTitle || '2026 General Presidential Election'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-2 text-right">Time remaining</p>
            <CountdownTimer deadline={deadline} />
          </div>
        </div>
      </div>

      {/* Voted success banner */}
      {showSuccess && (
        <div className="card p-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-800">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/40 rounded-2xl flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-emerald-800 dark:text-emerald-300">Vote Successfully Cast!</h3>
              <p className="text-emerald-700 dark:text-emerald-400 mt-1">
                Your vote for <strong>{candidates.find(c => (c.candidateId || c.id) === votedId)?.name}</strong> has been recorded. Thank you for participating!
              </p>
              <div className="flex items-center gap-2 mt-3 text-xs text-emerald-600 dark:text-emerald-500">
                <span>🔒 Your vote is encrypted and secured in MongoDB</span>
                <span>·</span>
                <span>Transaction ID: {voteStatus?.transactionId || '—'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {voted && !showSuccess && (
        <Alert type="info" title="You have already voted" message="Your vote has been recorded. You can view current results on the Results page." />
      )}

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search candidates by name, party, or state..."
            className="input-field pl-10"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            className="input-field pl-10 min-w-48"
            value={filterParty}
            onChange={e => setFilterParty(e.target.value)}
          >
            <option value="">All Parties</option>
            {parties.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* Candidates Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">No candidates found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(candidate => (
            <CandidateCard
              key={candidate.candidateId || candidate.id}
              candidate={candidate}
              onVote={() => setConfirmCandidate(candidate)}
              hasVoted={voted}
              votedCandidateId={votedId}
              loading={voting}
            />
          ))}
        </div>
      )}

      {/* Confirm Vote Modal */}
      <Modal open={!!confirmCandidate} onClose={() => setConfirmCandidate(null)} title="Confirm Your Vote">
        {confirmCandidate && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-navy-800 rounded-2xl">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${confirmCandidate.bgColor} flex items-center justify-center text-white font-display font-bold text-lg shadow-md`}>
                {confirmCandidate.initials}
              </div>
              <div>
                <h3 className="font-display font-bold text-gray-900 dark:text-white">{confirmCandidate.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{confirmCandidate.party}</p>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full text-white mt-1 inline-block" style={{ backgroundColor: confirmCandidate.partyColor }}>
                  {confirmCandidate.partyShort}
                </span>
              </div>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">⚠️ This action cannot be undone. You can only vote once.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmCandidate(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={confirmVote} disabled={voting} className="btn-primary flex-1 justify-center">
                {voting ? 'Submitting...' : <><Vote className="w-4 h-4" /> Confirm Vote</>}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VotingPage;
