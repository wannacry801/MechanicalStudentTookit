
import React, { createContext, useContext, useState } from 'react';

const UnitContext = createContext();

export const UnitProvider = ({ children }) => {
  
  const [unit, setUnit] = useState('SI'); 

  const toggleUnit = () => {
    setUnit((prev) => (prev === 'SI' ? 'English' : 'SI'));
  };

  return (
    <UnitContext.Provider value={{ unit, setUnit, toggleUnit }}>
      {children}
    </UnitContext.Provider>
  );
};

export const useUnit = () => useContext(UnitContext);