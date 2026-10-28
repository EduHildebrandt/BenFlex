'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { LocationState } from '@/types';

interface LocationContextType {
  location: LocationState;
  setLocation: (loc: LocationState) => void;
  updateByPostalCode: (cp: string) => void;
  isModalOpen: boolean;
  setModalOpen: (open: boolean) => void;
}

const DEFAULT_LOCATION: LocationState = {
  postalCode: '5425',
  city: 'Villa Krause',
  province: 'San Juan',
  isSanJuan: true,
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocationState] = useState<LocationState>(DEFAULT_LOCATION);
  const [isModalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('benflex_location');
      if (saved) {
        setLocationState(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Could not read location from storage', e);
    }
  }, []);

  const setLocation = (loc: LocationState) => {
    setLocationState(loc);
    try {
      localStorage.setItem('benflex_location', JSON.stringify(loc));
    } catch (e) {
      console.warn('Could not persist location', e);
    }
  };

  const updateByPostalCode = (cpInput: string) => {
    const clean = cpInput.trim().toUpperCase();
    const num = parseInt(clean.replace(/\D/g, ''), 10);

    let city = 'Ciudad';
    let province = 'Argentina';
    let isSanJuan = false;

    if (num >= 5400 && num <= 5499) {
      province = 'San Juan';
      isSanJuan = true;
      if (num === 5425) city = 'Villa Krause';
      else if (num === 5400) city = 'San Juan Capital';
      else if (num === 5413) city = 'Chimbas';
      else if (num === 5411) city = 'Santa Lucía';
      else if (num === 5429) city = 'Pocito';
      else if (num === 5407) city = 'Rivadavia';
      else city = 'Gran San Juan';
    } else if (num >= 5500 && num <= 5699) {
      province = 'Mendoza';
      city = 'Mendoza';
    } else if (num >= 5000 && num <= 5199) {
      province = 'Córdoba';
      city = 'Córdoba Capital';
    } else if (num >= 2000 && num <= 2999) {
      province = 'Santa Fe';
      city = 'Rosario / Santa Fe';
    } else if (num >= 1000 && num <= 1499) {
      province = 'CABA';
      city = 'Buenos Aires';
    } else if (num >= 1600 && num <= 1999) {
      province = 'Buenos Aires';
      city = 'Gran Buenos Aires';
    } else if (num >= 5700 && num <= 5799) {
      province = 'San Luis';
      city = 'San Luis';
    } else if (num >= 5300 && num <= 5399) {
      province = 'La Rioja';
      city = 'La Rioja';
    } else {
      province = 'Argentina';
      city = 'Tu Localidad';
    }

    const newLoc: LocationState = {
      postalCode: clean || '5425',
      city,
      province,
      isSanJuan,
    };
    setLocation(newLoc);
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        setLocation,
        updateByPostalCode,
        isModalOpen,
        setModalOpen,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
