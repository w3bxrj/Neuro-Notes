import React, { useState } from 'react';
import { Brain, LogOut, Sun, Moon, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ onMenuClick }) {
  const { currentUser, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  async function handleLogout() {
    setError('');
    try {
      await logout();
      navigate('/login');
    } catch {
      setError('Failed to log out');
    }
  }

  return (
    <nav className="glass sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-surfaceBorder transition-colors md:hidden"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5 text-textSecondary" />
        </button>

        <div className="flex items-center gap-2">
          <div className="bg-primary/20 p-2 rounded-lg">
            <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            NeuroNote
          </h1>
        </div>
      </div>

      {currentUser && (
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-surfaceBorder rounded-lg transition-colors group"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-textSecondary group-hover:text-amber-400 transition-colors" />
            ) : (
              <Moon className="w-5 h-5 text-textSecondary group-hover:text-blue-400 transition-colors" />
            )}
          </button>

          {error && <span className="text-red-400 text-sm hidden md:block">{error}</span>}
          <span className="text-xs sm:text-sm text-textSecondary hidden sm:inline truncate max-w-[140px]">
            {currentUser.email}
          </span>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-surfaceBorder rounded-lg transition-colors group"
            title="Log out"
          >
            <LogOut className="w-5 h-5 text-textSecondary group-hover:text-red-400 transition-colors" />
          </button>
        </div>
      )}
    </nav>
  );
}
