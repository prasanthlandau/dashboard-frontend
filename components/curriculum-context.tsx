'use client';
import { createContext, useState, useContext } from 'react';

interface CurriculumContextType {
  curriculum: string;
  setCurriculum: (value: string) => void;
  getCurriculumId: () => string | undefined;
}

const CurriculumContext = createContext<CurriculumContextType>({
  curriculum: 'Default',
  setCurriculum: () => {},
  getCurriculumId: () => undefined
});

export function CurriculumProvider({ children }) {
  const [curriculum, setCurriculum] = useState('Default');

  const getCurriculumId = () => {
    switch(curriculum) {
      case 'BP': return '2';
      case 'MoSE': return '1';
      default: return undefined;
    }
  };

  return (
    <CurriculumContext.Provider value={{ curriculum, setCurriculum, getCurriculumId }}>
      {children}
    </CurriculumContext.Provider>
  );
}

export const useCurriculum = () => useContext(CurriculumContext);
