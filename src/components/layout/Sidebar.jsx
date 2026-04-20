import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Network, FileText, Settings, X, Brain } from 'lucide-react';

export default function Sidebar({ onClose }) {
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Network, label: 'Graph View', path: '/graph' },
    { icon: FileText, label: 'Notes', path: '/notes' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <aside className="w-64 h-full bg-surface border-r border-surfaceBorder flex flex-col md:rounded-none md:h-[calc(100vh)] overflow-hidden">

      <div className="flex items-center justify-between px-5 py-4 border-b border-surfaceBorder md:hidden">
        <div className="flex items-center gap-2">
          <div className="bg-primary/20 p-1.5 rounded-lg">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <span className="font-bold text-textPrimary">NeuroNote</span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-surfaceBorder transition-colors text-textSecondary"
        >
          <X className="w-5 h-5" />
        </button>
      </div>


      <div className="hidden md:block p-4 border-b border-surfaceBorder">
        <h2 className="text-sm font-semibold text-textSecondary uppercase tracking-wider">Menu</h2>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive
                  ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(96,165,250,0.1)]'
                  : 'text-textSecondary hover:bg-surfaceBorder hover:text-textPrimary'
              }`
            }
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
