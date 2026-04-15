// src/pages/ProfilePage.jsx — connected to real backend
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchProfile } from '../services/api';
import { User, Mail, MapPin, Calendar, Shield, CheckCircle, Clock, Hash } from 'lucide-react';
import { Badge, Alert, PageLoader } from '../components/UI';

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile()
      .then(p => { setProfile(p); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader text="Loading profile..." />;

  const data = profile || user;
  const voted = data?.hasVoted || false;
  const votedCandidate = profile?.votedCandidate || null;

  const fields = [
    { icon: User,     label: 'Full Name',        value: data?.name },
    { icon: Hash,     label: 'Voter ID',          value: data?.voterId,  mono: true },
    { icon: Mail,     label: 'Email Address',     value: data?.email },
    { icon: MapPin,   label: 'State',             value: data?.state },
    { icon: Calendar, label: 'Date of Birth',     value: data?.dob },
  ];

  return (
    <div className="page-enter max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="card p-8">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 bg-gradient-to-br from-navy-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-display font-bold text-3xl shadow-lg flex-shrink-0">
            {data?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1">
            <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white">{data?.name}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-0.5 font-mono text-sm">{data?.voterId}</p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Badge color={data?.role === 'admin' ? 'purple' : 'blue'}>
                {data?.role === 'admin' ? 'Administrator' : 'Registered Voter'}
              </Badge>
              <Badge color={voted ? 'green' : 'yellow'}>
                {voted ? '✓ Voted' : '⏳ Not Yet Voted'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Voting status */}
      {voted ? (
        <div className="card p-6 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/40 rounded-2xl flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-emerald-800 dark:text-emerald-300">Vote Successfully Recorded</h3>
              {votedCandidate && (
                <p className="text-emerald-700 dark:text-emerald-400 text-sm mt-1">
                  You voted for <strong>{votedCandidate.name}</strong> — {votedCandidate.party}
                </p>
              )}
              {profile?.transactionId && (
                <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1 font-mono">
                  TXN: {profile.transactionId}
                </p>
              )}
              <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-2 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" />
                Your vote is encrypted and secured in the database
              </p>
            </div>
          </div>
        </div>
      ) : (
        <Alert type="warning" title="You haven't voted yet" message="The election is still open. Visit the Voting page to cast your ballot." />
      )}

      {/* Personal Details */}
      <div className="card p-6">
        <h2 className="font-display font-bold text-lg text-gray-900 dark:text-white mb-5">Personal Information</h2>
        <div className="space-y-4">
          {fields.map(({ icon: Icon, label, value, mono }) => (
            <div key={label} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-navy-800 rounded-xl">
              <div className="w-10 h-10 bg-navy-100 dark:bg-navy-700 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-navy-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">{label}</p>
                <p className={`text-gray-900 dark:text-white font-medium ${mono ? 'font-mono text-sm' : ''}`}>
                  {value || '—'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity */}
      <div className="card p-6">
        <h2 className="font-display font-bold text-lg text-gray-900 dark:text-white mb-5">Activity Log</h2>
        <div className="space-y-3">
          {[
            { icon: Shield,   label: 'Account registered',            time: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A',         color: 'blue' },
            { icon: voted ? CheckCircle : Clock, label: voted ? 'Vote cast successfully' : 'Vote pending',  time: profile?.votedAt ? new Date(profile.votedAt).toLocaleDateString() : 'Not yet', color: voted ? 'green' : 'amber' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-navy-800 transition-colors">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0
                ${item.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' : item.color === 'green' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                <item.icon className={`w-4 h-4 ${item.color === 'blue' ? 'text-blue-600 dark:text-blue-400' : item.color === 'green' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
              </div>
              <span className="text-xs text-gray-400">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
