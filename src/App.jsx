import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotesProvider } from './context/NotesContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';

import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import GraphView from './pages/GraphView';
import NotesManager from './pages/NotesManager';
import NoteDetail from './pages/NoteDetail';
import Login from './pages/Login';
import Signup from './pages/Signup';

function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" />;
  return children;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
      <NotesProvider>
        <BrowserRouter>
          <Toaster 
            position="bottom-right" 
            toastOptions={{
              style: {
                background: '#1a1f2e',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(8px)',
              }
            }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            <Route 
              path="/" 
              element={
                <PrivateRoute>
                  <AppLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="graph" element={<GraphView />} />
              <Route path="notes" element={<NotesManager />} />
              <Route path="notes/:id" element={<NoteDetail />} />
              <Route path="settings" element={
                <div className="p-8"><h1 className="text-3xl font-bold text-textPrimary">Settings</h1><p className="text-textSecondary mt-2">Coming soon...</p></div>
              } />
            </Route>
          </Routes>
        </BrowserRouter>
      </NotesProvider>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
