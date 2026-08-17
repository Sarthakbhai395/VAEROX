import React from 'react';
import { useMode } from '../contexts/ModeContext';
import { LuxuryHome } from '../components/homepage/LuxuryHome';
import { CasualHome } from '../components/homepage/CasualHome';

const NewHome = () => {
  const { mode } = useMode();

  return mode === 'casual' ? <CasualHome /> : <LuxuryHome />;
};

export default NewHome;
