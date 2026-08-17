import React, { createContext, useContext, useState, useEffect } from 'react';

const ModeContext = createContext();

export const ModeProvider = ({ children }) => {
  // mode can be 'casual' or 'luxury'
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('akario_app_mode') || 'luxury';
  });

  const [showModeModal, setShowModeModal] = useState(false);

  useEffect(() => {
    localStorage.setItem('akario_app_mode', mode);
  }, [mode]);

  const selectMode = (newMode) => {
    setMode(newMode);
    setShowModeModal(false);
  };

  const openModeModal = () => {
    setShowModeModal(true);
  };

  return (
    <ModeContext.Provider value={{ mode, setMode: selectMode, selectMode, showModeModal, setShowModeModal, openModeModal }}>
      {children}
    </ModeContext.Provider>
  );
};

export const useMode = () => {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context;
};

export default ModeContext;
