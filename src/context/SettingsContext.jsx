import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('neuro_settings');
    return saved ? JSON.parse(saved) : {
      showLabels: true,
      enableHighlight: true,
      aiEnabled: true,
      autoSummary: false,
    };
  });

  const [resetLayoutSignal, setResetLayoutSignal] = useState(0);

  useEffect(() => {
    localStorage.setItem('neuro_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetLayout = () => {
    setResetLayoutSignal(prev => prev + 1);
  };

  return (
    <SettingsContext.Provider value={{ ...settings, updateSettings, resetLayout, resetLayoutSignal }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
