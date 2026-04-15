// src/utils/helpers.js

/** Format large numbers with commas */
export const formatNumber = (n) =>
  n?.toLocaleString('en-US') ?? '0';

/** Format percentage */
export const formatPct = (n, total) =>
  total > 0 ? ((n / total) * 100).toFixed(1) : '0.0';

/** Countdown from ISO date string → { days, hours, minutes, seconds } */
export const getCountdown = (isoDate) => {
  const diff = new Date(isoDate) - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  const seconds = Math.floor((diff / 1000) % 60);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return { days, hours, minutes, seconds, expired: false };
};

/** Simple class name joiner */
export const cx = (...classes) => classes.filter(Boolean).join(' ');

/** Validate Voter ID format */
export const validateVoterId = (id) => /^[A-Z0-9]{6,12}$/.test(id.toUpperCase());

/** Validate password strength */
export const validatePassword = (pw) => ({
  length: pw.length >= 8,
  upper: /[A-Z]/.test(pw),
  lower: /[a-z]/.test(pw),
  number: /\d/.test(pw),
  strong: pw.length >= 8 && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /\d/.test(pw),
});

/** Generate a voter ID */
export const generateVoterId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return 'V' + Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};
