import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function AppLayout() {
  return (
    <div className="h-screen bg-background p-4 flex gap-6 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 relative glass overflow-hidden rounded-xl">
          <div className="absolute inset-0 overflow-y-auto min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
