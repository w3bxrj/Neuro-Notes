import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Sidebar — permanent on md+, drawer on mobile */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0 md:z-auto md:flex md:flex-shrink-0
          ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <Sidebar onClose={() => setDrawerOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden p-3 sm:p-4 gap-4">
        <Navbar onMenuClick={() => setDrawerOpen(true)} />
        <main className="flex-1 relative glass overflow-hidden rounded-xl">
          <div className="absolute inset-0 overflow-y-auto min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
