import { useState } from 'react';
import { Cooperative } from '@/types/tenant';
import { tokenStorage } from '@/services/tokenStorage';

export function useTenantContextStore() {
  const [activeCooperative, setActiveCooperativeState] = useState<Cooperative | null>(() =>
    tokenStorage.getCooperative()
  );

  const setCooperative = (coop: Cooperative | null) => {
    if (coop) {
      tokenStorage.setCooperative(coop);
    } else {
      tokenStorage.removeCooperative();
    }
    setActiveCooperativeState(coop);
  };

  return {
    activeCooperative,
    activeCooperativeId: activeCooperative?.id || null,
    setCooperative,
  };
}
