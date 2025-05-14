import React, { createContext, useContext, useState } from 'react';

const defaultCup = {
  id: '300',
  label: '300 mL',
  image: require('../../assets/images/cupsizes/300ml.png'),
};

const CupSizeContext = createContext({
  cup: defaultCup,
  setCup: (cup: any) => {},
});

export const useCupSize = () => useContext(CupSizeContext);

export const CupSizeProvider = ({ children }: { children: React.ReactNode }) => {
  const [cup, setCup] = useState(defaultCup);
  return (
    <CupSizeContext.Provider value={{ cup, setCup }}>
      {children}
    </CupSizeContext.Provider>
  );
}; 