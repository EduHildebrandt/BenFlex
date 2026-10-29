'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { LocationState } from '@/types';

interface LocationContextType {
  location: LocationState;
  setLocation: (loc: LocationState) => void;
  updateByPostalCode: (cp: string) => LocationState;
  isModalOpen: boolean;
  setModalOpen: (open: boolean) => void;
}

export const DEFAULT_LOCATION: LocationState = {
  postalCode: '5425',
  city: 'Villa Krause',
  province: 'San Juan',
  isSanJuan: true,
};

export function isSanJuanPostalCode(cpInput?: string): boolean {
  if (!cpInput) return false;
  const num = parseInt(cpInput.replace(/\D/g, ''), 10);
  return !Number.isNaN(num) && num >= 5400 && num <= 5499;
}

export function resolvePostalCode(cpInput: string): LocationState {
  const clean = cpInput.trim().toUpperCase();
  const num = parseInt(clean.replace(/\D/g, ''), 10);

  let city = 'Tu Localidad';
  let province = 'Argentina';
  let isSanJuan = false;

  if (!Number.isNaN(num) && num >= 5400 && num <= 5499) {
    province = 'San Juan';
    isSanJuan = true;
    if (num === 5425) city = 'Villa Krause (Rawson)';
    else if (num === 5400) city = 'San Juan Capital';
    else if (num === 5407) city = 'Rivadavia';
    else if (num === 5411) city = 'Santa Lucía';
    else if (num === 5413) city = 'Chimbas';
    else if (num === 5415) city = 'Albardón';
    else if (num === 5417) city = 'Angaco';
    else if (num === 5419) city = 'San Martín';
    else if (num === 5421) city = 'Caucete';
    else if (num === 5427 || num === 5429) city = 'Pocito';
    else if (num === 5435) city = 'Sarmiento';
    else if (num === 5439) city = '25 de Mayo';
    else if (num === 5442) city = 'Ullum / Zonda';
    else if (num === 5447 || num === 5405) city = 'Calingasta';
    else if (num === 5460) city = 'Jáchal';
    else if (num === 5465) city = 'Iglesia / Rodeo';
    else if (num === 5467) city = 'Valle Fértil';
    else city = 'San Juan';
  } else if (!Number.isNaN(num) && num >= 5500 && num <= 5699) {
    province = 'Mendoza';
    city = 'Mendoza';
  } else if (!Number.isNaN(num) && num >= 5700 && num <= 5799) {
    province = 'San Luis';
    city = 'San Luis';
  } else if (!Number.isNaN(num) && num >= 5300 && num <= 5399) {
    province = 'La Rioja';
    city = 'La Rioja';
  } else if (!Number.isNaN(num) && num >= 5000 && num <= 5299) {
    province = 'Córdoba';
    city = 'Córdoba';
  } else if (!Number.isNaN(num) && num >= 2000 && num <= 3099) {
    province = 'Santa Fe';
    city = 'Rosario / Santa Fe';
  } else if (!Number.isNaN(num) && num >= 1000 && num <= 1499) {
    province = 'CABA';
    city = 'Buenos Aires (CABA)';
  } else if (!Number.isNaN(num) && num >= 1600 && num <= 1999) {
    province = 'Buenos Aires';
    city = 'Gran Buenos Aires';
  } else if (!Number.isNaN(num) && num >= 4000 && num <= 4199) {
    province = 'Tucumán';
    city = 'San Miguel de Tucumán';
  } else if (!Number.isNaN(num) && num >= 8300 && num <= 8399) {
    province = 'Neuquén';
    city = 'Neuquén';
  }

  return {
    postalCode: clean || '5425',
    city,
    province,
    isSanJuan,
  };
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocationState] = useState<LocationState>(DEFAULT_LOCATION);
  const [isModalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('benflex_location');
      if (saved) {
        const parsed = JSON.parse(saved) as LocationState;
        setLocationState({
          ...parsed,
          isSanJuan: isSanJuanPostalCode(parsed.postalCode),
        });
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

  const updateByPostalCode = (cpInput: string): LocationState => {
    const newLoc = resolvePostalCode(cpInput);
    setLocation(newLoc);
    return newLoc;
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
