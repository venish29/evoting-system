// src/pages/DashboardPage.jsx — connected to real backend
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchResults } from '../services/api';
import {
  Vote, BarChart2, CheckCircle, Clock, Users, TrendingUp,
  Shield, ChevronRight, Activity
} from 'lucide-react';
import { CountdownTimer, StatCard, PageLoader, Alert } from '../components/UI';
import { formatNumber } from '../utils/helpers';

const DashboardPage = () => {
  const { user, hasVoted, getVotedCandidate } = useAuth();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const voted = hasVoted();
  const votedId = getVotedCandidate();

  useEffect(() => {
    fetchResults()
      .then(r => { setResults(r); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader text="Loading dashboard..." />;

  const leading = results?.candidates?.sort((a, b) => b.voteCount - a.voteCount)[0];
  const votedCandidate = results?.candidates?.find(c => (c.candidateId || c.id) === votedId);
  const deadline = results?.deadline || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

  return (
    <div className="page-enter space-y-8">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-navy-800 via-navy-700 to-indigo-800 rounded-3xl p-8 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-indigo-400/10 rounded-full translate-y-1/2" />
        </div>
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="flex items-center gap-1.5 bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                <Activity className="w-3.5 h-3.5" /> Election Active
              </span>
            </div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
              Welcome back, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-white/70 mt-2 max-w-lg">{results?.electionTitle || '2026 General Presidential Election'}</p>
            <div className="mt-4">
              {voted ? (
                <div className="flex items-center gap-2 text-emerald-400 font-medium">
                  <CheckCircle className="w-5 h-5" />
                  You have voted{votedCandidate ? ` for ${votedCandidate.name}` : ''}
                </div>
              ) : (
                <Link to="/vote" className="inline-flex items-center gap-2 bg-white text-navy-700 font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  <Vote className="w-5 h-5" /> Cast Your Vote Now <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
          <div className="flex-shrink-0">
            <p className="text-white/60 text-sm mb-3 text-center lg:text-right">Time Remaining</p>
            <CountdownTimer deadline={deadline} />
          </div>
        </div>
      </div>

      {!voted && (
        <Alert type="warning" title="Action Required" message="You haven't voted yet! The election closes soon. Make sure your voice is heard." />
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Registered Voters" value={formatNumber(results?.totalRegistered || 248750)} color="blue" />
        <StatCard icon={Vote} label="Votes Cast" value={formatNumber(results?.total)} sub={`${results?.turnout}% turnout`} color="green" trend={4.2} />
        <StatCard icon={TrendingUp} label="Leading Candidate" value={leading?.name?.split(' ')[0]} sub={leading?.party} color="purple" />
        <StatCard icon={Clock} label="Election Status" value="Active" sub="Polls open" color="amber" />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="font-display font-bold text-xl text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { to: '/vote',    icon: Vote,     title: 'Cast Your Vote',    desc: voted ? 'You have already voted in this election.' : 'Review candidates and submit your ballot.', color: 'from-navy-500 to-indigo-600', disabled: voted },
            { to: '/results', icon: BarChart2, title: 'View Live Results', desc: 'See real-time vote counts and statistics.',              color: 'from-emerald-500 to-teal-600' },
            { to: '/profile', icon: Shield,   title: 'My Profile',        desc: 'View your voter registration details.',                  color: 'from-amber-500 to-orange-600' },
          ].map(action => (
            <Link key={action.to} to={action.to}
              className={`card p-6 flex items-start gap-4 hover:-translate-y-1 transition-all duration-300 group ${action.disabled ? 'opacity-60 pointer-events-none' : ''}`}>
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-md group-hover:shadow-lg transition-all flex-shrink-0`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{action.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{action.desc}</p>
              </div>
              {!action.disabled && <ChevronRight className="w-5 h-5 text-gray-300 dark:text-navy-600 ml-auto self-center group-hover:text-navy-600 dark:group-hover:text-indigo-400 transition-colors" />}
            </Link>
          ))}
        </div>
      </div>

      {/* Current Standings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-xl text-gray-900 dark:text-white">Current Standings</h2>
          <Link to="/results" className="text-sm text-navy-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-1">
            Full Results <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="card p-6 space-y-4">
          {results?.candidates
            ?.sort((a, b) => b.voteCount - a.voteCount)
            .slice(0, 3)
            .map((c, i) => {
              const pct = results.total > 0 ? ((c.voteCount / results.total) * 100).toFixed(1) : '0.0';
              return (
                <div key={c.candidateId || c.id} className="flex items-center gap-4">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                    ${i === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-gray-100 text-gray-500 dark:bg-navy-800 dark:text-gray-400'}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">{c.name}</span>
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-2 flex-shrink-0">{pct}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-navy-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, backgroundColor: c.partyColor }} />
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0 w-16 text-right">{formatNumber(c.voteCount)}</span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
