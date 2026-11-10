import { useState, useEffect } from 'react';

export interface CropSeasonOption {
  id: string;
  season_code: string;
  season_name: string;
  year: number;
  status: 'PLANNING' | 'ACTIVE' | 'HARVESTING' | 'COMPLETED';
}

const STORAGE_KEY = 'htx_selected_crop_season';
const EVENT_NAME = 'htx_crop_season_changed';

export function useCropSeasonContextStore() {
  const [selectedSeasonId, setSelectedSeasonIdState] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'dx2025';
    } catch {
      return 'dx2025';
    }
  });

  useEffect(() => {
    const handleSeasonChanged = (e: any) => {
      const newSeasonId = e?.detail?.seasonId;
      if (newSeasonId && newSeasonId !== selectedSeasonId) {
        setSelectedSeasonIdState(newSeasonId);
      }
    };

    window.addEventListener(EVENT_NAME, handleSeasonChanged);
    return () => window.removeEventListener(EVENT_NAME, handleSeasonChanged);
  }, [selectedSeasonId]);

  const setSelectedSeasonId = (seasonId: string) => {
    try {
      localStorage.setItem(STORAGE_KEY, seasonId);
    } catch {}
    setSelectedSeasonIdState(seasonId);
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { seasonId } }));
  };

  return {
    selectedSeasonId,
    setSelectedSeasonId,
  };
}
