'use client';

import { useEffect, useState } from 'react';
import { SessionsService, SessionResponse } from '@/src/src2/api';
import { getStoredSeller } from '@/src/api/session';
import { SellerRole } from '@/src/api/models/UpdatedSellerResponse';

/**
 * Owners and agency managers always have full document access. A seller or
 * POS seller only gets it while they have an active (OPEN) SALES session —
 * otherwise they're restricted to viewing whatever documents they already
 * have permission on.
 */
export function useCanEditDocuments(): { canEdit: boolean; isChecking: boolean } {
  const [canEdit, setCanEdit] = useState(true);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const seller = getStoredSeller();
    if (!seller) {
      setCanEdit(false);
      setIsChecking(false);
      return;
    }
    if (seller.role === SellerRole.OWNER || seller.role === SellerRole.AGENCY_MANAGER) {
      setCanEdit(true);
      setIsChecking(false);
      return;
    }
    if (!seller.Id) {
      setCanEdit(false);
      setIsChecking(false);
      return;
    }
    setIsChecking(true);
    SessionsService.getAll(undefined, seller.Id)
      .then((sessions) => {
        const hasActiveSalesSession = sessions.some(
          (s) => s.status === SessionResponse.status.OPEN && s.type === SessionResponse.type.SALES
        );
        setCanEdit(hasActiveSalesSession);
      })
      .catch(() => setCanEdit(false))
      .finally(() => setIsChecking(false));
  }, []);

  return { canEdit, isChecking };
}
