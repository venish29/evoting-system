// src/components/UI.jsx
// Reusable UI primitives

import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCountdown } from '../utils/helpers';
import { X, CheckCircle, AlertCircle, Info, Clock } from 'lucide-react';

/* ────────────────────────────────────────────
   Loading Spinner
──────────────────────────────────────────── */
export const Spinner = ({ size = 'md', color = 'navy' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  const colors = { navy: 'border-navy-600', white: 'border-white', gray: 'border-gray-400' };
  return (
    <div className={`${sizes[size]} rounded-full border-2 border-gray-200 ${colors[color]} border-t-transparent animate-spin`} />
  );
};

/* ────────────────────────────────────────────
   Full-page loading overlay
──────────────────────────────────────────── */
export const PageLoader = ({ text = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 animate-fade-in">
    <div className="relative">
      <div className="w-16 h-16 rounded-full border-4 border-navy-100 dark:border-navy-800" />
      <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-navy-600 border-t-transparent animate-spin" />
    </div>
    <p className="text-gray-500 dark:text-gray-400 font-medium">{text}</p>
  </div>
);

/* ────────────────────────────────────────────
   Modal
──────────────────────────────────────────── */
export const Modal = ({ open, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;
  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${widths[size]} card p-6 animate-slide-up`}>
        {title && (
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100 dark:border-navy-700">
            <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white">{title}</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-navy-800 text-gray-400 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────
   Alert / Banner
──────────────────────────────────────────── */
export const Alert = ({ type = 'info', title, message, onClose }) => {
  const styles = {
    success: { bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800', icon: CheckCircle, iconColor: 'text-emerald-600', textColor: 'text-emerald-800 dark:text-emerald-200' },
    error: { bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800', icon: AlertCircle, iconColor: 'text-red-600', textColor: 'text-red-800 dark:text-red-200' },
    info: { bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800', icon: Info, iconColor: 'text-blue-600', textColor: 'text-blue-800 dark:text-blue-200' },
    warning: { bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800', icon: AlertCircle, iconColor: 'text-amber-600', textColor: 'text-amber-800 dark:text-amber-200' },
  };
  const s = styles[type];
  const Icon = s.icon;
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${s.bg} animate-fade-in`}>
      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${s.iconColor}`} />
      <div className="flex-1">
        {title && <p className={`font-semibold text-sm ${s.textColor}`}>{title}</p>}
        {message && <p className={`text-sm mt-0.5 ${s.textColor}`}>{message}</p>}
      </div>
      {onClose && (
        <button onClick={onClose} className={`${s.iconColor} hover:opacity-70 transition-opacity`}>
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

/* ────────────────────────────────────────────
   Protected Route
──────────────────────────────────────────── */
export const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

/* ────────────────────────────────────────────
   Countdown Timer
──────────────────────────────────────────── */
export const CountdownTimer = ({ deadline }) => {
  const [time, setTime] = useState(() => getCountdown(deadline));

  useEffect(() => {
    const id = setInterval(() => setTime(getCountdown(deadline)), 1000);
    return () => clearInterval(id);
  }, [deadline]);

  if (time.expired) return (
    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-semibold">
      <Clock className="w-5 h-5" />
      <span>Voting has ended</span>
    </div>
  );

  const units = [
    { label: 'Days', value: time.days },
    { label: 'Hours', value: time.hours },
    { label: 'Mins', value: time.minutes },
    { label: 'Secs', value: time.seconds },
  ];

  return (
    <div className="flex items-center gap-2">
      {units.map(({ label, value }, i) => (
        <React.Fragment key={label}>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-navy-600 dark:bg-navy-700 text-white rounded-xl flex items-center justify-center font-mono font-bold text-lg shadow-md">
              {String(value).padStart(2, '0')}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</span>
          </div>
          {i < 3 && <span className="text-navy-600 font-bold text-xl mb-4">:</span>}
        </React.Fragment>
      ))}
    </div>
  );
};

/* ────────────────────────────────────────────
   Skeleton loader
──────────────────────────────────────────── */
export const SkeletonCard = () => (
  <div className="card p-6 space-y-4 animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 skeleton rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="h-4 skeleton rounded w-2/3" />
        <div className="h-3 skeleton rounded w-1/2" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-3 skeleton rounded" />
      <div className="h-3 skeleton rounded w-4/5" />
    </div>
    <div className="h-10 skeleton rounded-xl" />
  </div>
);

/* ────────────────────────────────────────────
   Badge
──────────────────────────────────────────── */
export const Badge = ({ children, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    yellow: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    gray: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  };
  return (
    <span className={`badge ${colors[color]}`}>{children}</span>
  );
};

/* ────────────────────────────────────────────
   Stats Card
──────────────────────────────────────────── */
export const StatCard = ({ icon: Icon, label, value, sub, color = 'blue', trend }) => {
  const colors = {
    blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
    green: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400' },
    amber: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400' },
  };
  const c = colors[color];
  return (
    <div className="stat-card hover:shadow-card-hover transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 ${c.bg} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${c.text}`} />
        </div>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${trend > 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-display font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{sub}</p>}
      </div>
    </div>
  );
};
