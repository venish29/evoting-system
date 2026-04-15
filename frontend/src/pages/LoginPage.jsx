// src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Eye, EyeOff, Lock, Hash, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Spinner } from '../components/UI';

const LoginPage = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [form, setForm] = useState({ voterId: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const addActivity = (user) => {
  const activity = JSON.parse(localStorage.getItem("activity")) || [];

  activity.unshift({
    action: "User logged in",
    user: user?.voterId || "USER",
    time: new Date().toLocaleTimeString(),
    status: "success"
  });

  localStorage.setItem("activity", JSON.stringify(activity));
  };

  useEffect(() => { if (user) navigate(from, { replace: true }); }, [user, navigate, from]);

  const validate = () => {
    const e = {};
    if (!form.voterId.trim()) e.voterId = 'Voter ID is required';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(form.voterId.trim().toUpperCase(), form.password);
      toast.success('Welcome back! Login successful.', { icon: '🗳️' });
      const userData = {
      voterId: form.voterId.trim().toUpperCase()
    };

      addActivity(userData);   // ✅ ADD THIS LINE
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Login failed');
      setErrors({ general: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-navy-900 via-navy-800 to-indigo-900 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-navy-400/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="font-display font-bold text-xl text-white">eVote</div>
              <div className="text-xs text-white/60">Secure Voting System</div>
            </div>
          </div>
        </div>

        <div className="relative space-y-6">
          <div>
            <h1 className="font-display text-4xl font-bold text-white leading-tight">
              Your Voice,<br />Your Choice.
            </h1>
            <p className="text-white/70 mt-4 text-lg leading-relaxed">
              Participate in a secure, transparent, and accessible democratic process from anywhere.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Registered Voters', value: '248,750' },
              { label: 'Candidates', value: '5' },
              { label: 'Days Remaining', value: '3' },
            ].map(s => (
              <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <div className="text-2xl font-display font-bold text-white">{s.value}</div>
                <div className="text-xs text-white/60 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="flex items-center gap-2 text-white/50 text-sm">
            <Lock className="w-4 h-4" />
            256-bit SSL encryption · One voter, one vote · Fully auditable
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-gray-50 dark:bg-navy-950">
        <div className="w-full max-w-md animate-slide-up">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-navy-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="card p-8">
            <div className="mb-8">
              <h2 className="font-display font-bold text-2xl text-gray-900 dark:text-white">Sign in to vote</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1.5">Enter your credentials to access the ballot.</p>
            </div>

            {/* Demo credentials hint */}
            <div className="mb-6 p-3.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">Demo Credentials</p>
              <p className="text-xs text-blue-600 dark:text-blue-500">Voter: <span className="font-mono font-semibold">VOTER001</span> / <span className="font-mono font-semibold">password123</span></p>
              
            </div>

            {errors.general && (
              <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-800 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <label className="form-label">Voter ID</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="e.g. VOTER001"
                    className={`input-field pl-10 uppercase font-mono tracking-wider ${errors.voterId ? 'border-red-400 focus:ring-red-400' : ''}`}
                    value={form.voterId}
                    onChange={e => { setForm(f => ({ ...f, voterId: e.target.value })); setErrors(er => ({ ...er, voterId: '' })); }}
                    autoComplete="username"
                  />
                </div>
                {errors.voterId && <p className="mt-1.5 text-xs text-red-500">{errors.voterId}</p>}
              </div>

              <div>
                <label className="form-label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-400 focus:ring-red-400' : ''}`}
                    value={form.password}
                    onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setErrors(er => ({ ...er, password: '' })); }}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1.5 text-xs text-red-500">{errors.password}</p>}
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center text-base py-3.5">
                {loading ? <><Spinner size="sm" color="white" /> Authenticating...</> : <><Shield className="w-5 h-5" /> Sign In</>}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Not registered?{' '}
                <Link to="/register" className="text-navy-600 dark:text-indigo-400 font-semibold hover:underline">
                  Create an account
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-6">
            This is a secure government voting portal. All actions are logged.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
