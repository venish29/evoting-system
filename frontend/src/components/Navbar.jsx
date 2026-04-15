// src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Shield, Sun, Moon, Menu, X, ChevronDown,
  User, LogOut, BarChart2, Vote, LayoutDashboard, Settings
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/vote', label: 'Vote', icon: Vote },
    { to: '/results', label: 'Results', icon: BarChart2 },
    ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Admin', icon: Settings }] : []),
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-navy-950/90 backdrop-blur-md border-b border-gray-200 dark:border-navy-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-navy-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="font-display font-bold text-lg text-navy-800 dark:text-white">eVote</span>
              <span className="text-xs text-gray-400 block leading-none -mt-0.5">Secure Voting System</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          {user && (
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                    ${location.pathname === to
                      ? 'bg-navy-600 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-navy-800 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
            </nav>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Dark Mode */}
            <button
              onClick={toggle}
              className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-navy-800 transition-all duration-200"
              aria-label="Toggle dark mode"
            >
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {user ? (
              /* User dropdown */
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-navy-800 transition-all duration-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-navy-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300 max-w-24 truncate">
                    {user.name?.split(' ')[0]}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-navy-900 rounded-2xl shadow-xl border border-gray-100 dark:border-navy-700 py-2 animate-fade-in">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-navy-700">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.voterId}</p>
                    </div>
                    <Link
                      to="/profile"
                      onMouseDown={() => navigate("/profile")}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-navy-800 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      My Profile
                    </Link>
                    <button
                      onMouseDown={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn-primary text-sm px-4 py-2">Sign In</Link>
            )}

            {/* Mobile menu toggle */}
            {user && (
              <button
                className="md:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-navy-800 transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileOpen && user && (
        <div className="md:hidden border-t border-gray-200 dark:border-navy-800 bg-white dark:bg-navy-950 animate-slide-up">
          <nav className="px-4 py-3 space-y-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                  ${location.pathname === to
                    ? 'bg-navy-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-navy-800'
                  }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
