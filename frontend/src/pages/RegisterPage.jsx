// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, User, Mail, Lock, Eye, EyeOff, MapPin, Calendar, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { Spinner } from '../components/UI';
import { generateVoterId, validatePassword } from '../utils/helpers';

const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware',
  'Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky',
  'Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi',
  'Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico',
  'New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania',
  'Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont',
  'Virginia','Washington','West Virginia','Wisconsin','Wyoming','Washington DC',
];

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    voterId: generateVoterId(),
    name: '', email: '', dob: '', state: '', password: '', confirm: '',
  });
  const [errors, setErrors] = useState({});

  const update = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const validateStep1 = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Full name required (min 2 chars)';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Valid email required';
    if (!form.dob) e.dob = 'Date of birth required';
    else if (new Date().getFullYear() - new Date(form.dob).getFullYear() < 18) e.dob = 'You must be 18 or older';
    if (!form.state) e.state = 'State is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    const pw = validatePassword(form.password);
    if (!pw.strong) e.password = 'Password must be 8+ chars with uppercase, lowercase and number';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;
    setLoading(true);
    try {
      await register(form);
      toast.success('Registration successful! Welcome to eVote 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
      setErrors({ general: err.message });
    } finally {
      setLoading(false);
    }
  };

  const pw = validatePassword(form.password);
  const strength = Object.values(pw).filter(Boolean).length - 1;
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', 'bg-red-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-950 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-navy-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white">Voter Registration</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Register to participate in the 2024 General Election</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-6">
          {[1, 2].map(s => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-2 flex-1 ${s <= step ? 'text-navy-600 dark:text-indigo-400' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all
                  ${s < step ? 'bg-navy-600 border-navy-600 text-white' : s === step ? 'border-navy-600 text-navy-600 dark:border-indigo-400 dark:text-indigo-400' : 'border-gray-300 text-gray-400'}`}>
                  {s < step ? '✓' : s}
                </div>
                <span className="text-sm font-medium hidden sm:block">
                  {s === 1 ? 'Personal Info' : 'Security'}
                </span>
              </div>
              {s < 2 && <div className={`h-0.5 flex-1 transition-all ${step > 1 ? 'bg-navy-600' : 'bg-gray-200 dark:bg-navy-700'}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="card p-8">
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="font-display font-bold text-lg text-gray-900 dark:text-white mb-6">Personal Information</h2>

              {/* Voter ID (auto-generated) */}
              <div>
                <label className="form-label">Your Voter ID (auto-generated)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.voterId}
                    readOnly
                    className="input-field font-mono font-semibold text-navy-700 dark:text-indigo-400 bg-navy-50 dark:bg-navy-900 flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => update('voterId', generateVoterId())}
                    className="btn-secondary px-3 py-3"
                    title="Generate new ID"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">Save this ID — you'll use it to log in</p>
              </div>

              <div>
                <label className="form-label">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="" className={`input-field pl-10 ${errors.name ? 'border-red-400' : ''}`}
                    value={form.name} onChange={e => update('name', e.target.value)} />
                </div>
                {errors.name && <p className="mt-1.5 text-xs text-red-500">{errors.name}</p>}
              </div>

              <div>
                <label className="form-label">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email"  className={`input-field pl-10 ${errors.email ? 'border-red-400' : ''}`}
                    value={form.email} onChange={e => update('email', e.target.value)} />
                </div>
                {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Date of Birth</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="date" className={`input-field pl-10 ${errors.dob ? 'border-red-400' : ''}`}
                      value={form.dob} onChange={e => update('dob', e.target.value)} max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]} />
                  </div>
                  {errors.dob && <p className="mt-1.5 text-xs text-red-500">{errors.dob}</p>}
                </div>
                <div>
                  <label className="form-label">State</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select className={`input-field pl-10 ${errors.state ? 'border-red-400' : ''}`}
                      value={form.state} onChange={e => update('state', e.target.value)}>
                      <option value="">Select...</option>
                      {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  {errors.state && <p className="mt-1.5 text-xs text-red-500">{errors.state}</p>}
                </div>
              </div>

              <button type="button" onClick={() => validateStep1() && setStep(2)} className="btn-primary w-full justify-center py-3.5">
                Continue to Security Setup →
              </button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in" noValidate>
              <h2 className="font-display font-bold text-lg text-gray-900 dark:text-white mb-6">Set Your Password</h2>

              {errors.general && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm border border-red-100 dark:border-red-800">
                  {errors.general}
                </div>
              )}

              <div>
                <label className="form-label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type={showPass ? 'text' : 'password'} placeholder="Create a strong password"
                    className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-400' : ''}`}
                    value={form.password} onChange={e => update('password', e.target.value)} />
                  <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Strength bar */}
                {form.password && (
                  <div className="mt-2 space-y-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= strength ? strengthColors[strength] : 'bg-gray-200 dark:bg-navy-700'}`} />
                      ))}
                    </div>
                    <p className={`text-xs font-medium ${strength >= 3 ? 'text-emerald-600' : strength >= 2 ? 'text-blue-500' : 'text-amber-500'}`}>
                      {strengthLabels[strength] || ''}
                    </p>
                    <div className="grid grid-cols-2 gap-1">
                      {[
                        { label: '8+ characters', ok: pw.length },
                        { label: 'Uppercase letter', ok: pw.upper },
                        { label: 'Lowercase letter', ok: pw.lower },
                        { label: 'Number', ok: pw.number },
                      ].map(r => (
                        <p key={r.label} className={`text-xs flex items-center gap-1 ${r.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
                          <span>{r.ok ? '✓' : '○'}</span> {r.label}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
                {errors.password && <p className="mt-1.5 text-xs text-red-500">{errors.password}</p>}
              </div>

              <div>
                <label className="form-label">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="password" placeholder="Repeat your password"
                    className={`input-field pl-10 ${errors.confirm ? 'border-red-400' : ''}`}
                    value={form.confirm} onChange={e => update('confirm', e.target.value)} />
                </div>
                {errors.confirm && <p className="mt-1.5 text-xs text-red-500">{errors.confirm}</p>}
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 justify-center">← Back</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center py-3.5">
                  {loading ? <><Spinner size="sm" color="white" /> Registering...</> : 'Complete Registration'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center border-t border-gray-100 dark:border-navy-700 pt-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Already registered?{' '}
              <Link to="/login" className="text-navy-600 dark:text-indigo-400 font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
