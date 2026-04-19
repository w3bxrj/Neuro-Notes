import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Network, FileText, Settings } from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Network, label: 'Graph View', path: '/graph' },
    { icon: FileText, label: 'Notes', path: '/notes' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <aside className="w-64 glass h-[calc(100vh-2rem)] sticky top-4 flex-col hidden md:flex">
      <div className="p-4 border-b border-surfaceBorder">
        <h2 className="text-sm font-semibold text-textSecondary uppercase tracking-wider">Menu</h2>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(96,165,250,0.1)]' 
                  : 'text-textSecondary hover:bg-surfaceBorder hover:text-textPrimary'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
