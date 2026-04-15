// src/pages/AdminPage.jsx — connected to real backend
import React, { useState, useEffect, useCallback } from 'react';
import { fetchAdminStats, fetchAdminResults, fetchActivityLog, fetchAdminExport } from '../services/api';
import {
  Users, Vote, Activity, Shield, RefreshCw, Download,
  CheckCircle, AlertCircle, BarChart2, Settings
} from 'lucide-react';
import { StatCard, PageLoader, Badge } from '../components/UI';
import { formatNumber, formatPct } from '../utils/helpers';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

import axios from "axios";

const AdminPage = () => {
  const [stats, setStats] = useState(null);
  const [results, setResults] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  const load = useCallback(async () => {
    try {
      const [s, r, a] = await Promise.all([
        fetchAdminStats(),
        fetchAdminResults(),
        fetchActivityLog(),
      ]);
      setStats(s);
      setResults(r);
      setActivity(a);
          const votersRes = await axios.get("http://localhost:5000/api/admin/voters", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("evoting_token")}`
      }
    });

    setUsers(votersRes.data.voters);
    } catch (err) {
      console.error('Admin load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);
          const handleDelete = async (id) => {
          if (!window.confirm("Are you sure you want to delete this candidate?")) return;

          try {
            await axios.delete(`http://localhost:5000/api/admin/candidates/${id}`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("evoting_token")}`
              }
            });

            alert("Candidate deleted");
            load(); // refresh data
          } catch (err) {
            console.error(err);
            alert("Delete failed");
          }
        };

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [load]);

  const handleExport = async () => {
    try {
      const data = await fetchAdminExport();
      const csv = [
        ['Rank', 'Name', 'Party', 'State', 'Votes', 'Percentage'],
        ...data.map(r => [r.rank, r.name, r.partyShort, r.state, r.votes, `${r.percentage}%`]),
      ];
      const csvContent = 'data:text/csv;charset=utf-8,' + csv.map(e => e.join(',')).join('\n');
      const link = document.createElement('a');
      link.setAttribute('href', encodeURI(csvContent));
      link.setAttribute('download', 'evoting-results.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  if (loading) return <PageLoader text="Loading admin panel..." />;

  const sorted = [...(results?.candidates || [])].sort((a, b) => b.voteCount - a.voteCount);
  const tabs = ['overview', 'candidates', 'users', 'system'];

  return (
    <div className="page-enter space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-purple-500" />
            <Badge color="purple">Admin Access</Badge>
          </div>
          <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white">Admin Panel</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Election Management Dashboard</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-secondary"><RefreshCw className="w-4 h-4" /> Refresh</button>
          <button onClick={handleExport} className="btn-secondary"><Download className="w-4 h-4" /> Export CSV</button>
          <button
                 onClick={() => navigate('/add-candidate')}
                className="btn-secondary flex items-center gap-2 bg-blue-600 text-white"
              >
                 <UserPlus className="w-4 h-4" />
                   Add Candidate
                </button>
        </div>
      </div>

      <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl w-fit border border-emerald-100 dark:border-emerald-800">
        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse-slow" />
        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">System Operational — Live Monitoring Active</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Registered Voters" value={formatNumber(stats?.registeredVoters)} color="blue" />
        <StatCard icon={Vote} label="Votes Cast" value={formatNumber(stats?.totalVotesCast)} sub={`${stats?.turnout}% turnout`} color="green" trend={2.1} />
        <StatCard icon={Activity} label="Active Polls" value={stats?.activePolls} sub="In progress" color="amber" />
        <StatCard icon={BarChart2} label="Candidates" value={sorted.length} color="purple" />
      </div>

      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-navy-800 rounded-2xl w-full sm:w-auto">
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-medium capitalize transition-all
              ${activeTab === t ? 'bg-white dark:bg-navy-900 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            {t}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-5 animate-fade-in">
          <div className="card p-6">
            <h2 className="font-display font-bold text-lg text-gray-900 dark:text-white mb-5">Vote Distribution</h2>
            <div className="space-y-4">
              {sorted.map((c, i) => {
                const pct = parseFloat(formatPct(c.voteCount, results.total));
                return (
                  <div key={c.candidateId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-gray-100 text-gray-500 dark:bg-navy-700 dark:text-gray-400'}`}>{i + 1}</span>
                        <span className="font-medium text-gray-900 dark:text-white text-sm">{c.name}</span>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: c.partyColor }}>{c.partyShort}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">{formatNumber(c.voteCount)}</span>
                        <span className="font-bold text-gray-900 dark:text-white text-sm w-14 text-right">{pct}%</span>
                      </div>
                    </div>
                    <div className="h-2.5 bg-gray-100 dark:bg-navy-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, backgroundColor: c.partyColor }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-display font-bold text-lg text-gray-900 dark:text-white mb-5">Recent Activity</h2>
            <div className="space-y-2">
              {activity.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No activity yet.</p>}
              {activity.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-navy-800 transition-colors">
                  {item.status === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-gray-900 dark:text-white">{item.action}</span>
                    <span className="text-xs text-gray-400 ml-2 font-mono">{item.user}</span>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

  {activeTab === 'candidates' && (
    <div className="card animate-fade-in overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-navy-700">
            <h2 className="font-display font-bold text-lg text-gray-900 dark:text-white">Candidate Management</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-navy-800">
                  {['Rank', 'Candidate', 'Party', 'State', 'Votes', 'Share', 'Status'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-navy-700">
                {sorted.map((c, i) => (
                  <tr key={c.candidateId} className="hover:bg-gray-50 dark:hover:bg-navy-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-gray-100 text-gray-500 dark:bg-navy-700 dark:text-gray-400'}`}>{i + 1}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${c.bgColor} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>{c.initials}</div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{c.name}</p>
                          <p className="text-xs text-gray-400">Age {c.age}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="text-xs font-medium px-2 py-1 rounded-full text-white" style={{ backgroundColor: c.partyColor }}>{c.partyShort}</span></td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{c.state}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">{formatNumber(c.voteCount)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-200 dark:bg-navy-700 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${formatPct(c.voteCount, results.total)}%`, backgroundColor: c.partyColor }} />
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">{formatPct(c.voteCount, results.total)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                        <Badge color="green">Active</Badge>

                        <button
                          onClick={() => handleDelete(c.candidateId)}
                          className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                        >
                          Delete
                        </button>
                      </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="card p-6">
          <h2 className="text-lg font-bold mb-4">All Voters</h2>
          <table className="w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Voter ID</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={i}>
                  <td>{u.name}</td>
                  <td>{u.voterId}</td>
                  <td>{u.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'system' && (
        <div className="space-y-5 animate-fade-in">
          <div className="card p-6">
            <h2 className="font-display font-bold text-lg text-gray-900 dark:text-white mb-5">System Status</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Voting System', status: 'Operational', color: 'green' },
                { label: 'Authentication Service (JWT)', status: 'Operational', color: 'green' },
                { label: 'Database (MongoDB)', status: 'Operational', color: 'green' },
                { label: 'Password Encryption (bcrypt)', status: 'Operational', color: 'green' },
                { label: 'Audit Log', status: 'Active', color: 'green' },
                { label: 'Backup Service', status: 'Scheduled', color: 'yellow' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-navy-800 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{item.label}</span>
                  </div>
                  <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full
                    ${item.color === 'green' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${item.color === 'green' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse-slow`} />
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
