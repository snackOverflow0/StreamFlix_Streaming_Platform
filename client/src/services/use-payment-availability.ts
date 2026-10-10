import { useCallback, useEffect, useRef, useState } from 'react';
import { apiRequest } from './api-client';

type PaymentConfig = { card: boolean; unavailableReason?: string | null };

export function usePaymentAvailability() {
  const [state, setState] = useState({ card: false, loading: true, error: '', unavailableReason: null as string | null });
  const mounted = useRef(false);
  const request = useRef(0);
  const refresh = useCallback(async () => {
    const current = ++request.current;
    setState(previous => ({ ...previous, card: false, loading: true, error: '' }));
    try {
      const config = await apiRequest<PaymentConfig>('/payments/config');
      if (mounted.current && current === request.current) {
        setState({ card: config.card === true, loading: false, error: '', unavailableReason: config.unavailableReason ?? null });
      }
    } catch {
      if (mounted.current && current === request.current) {
        setState({ card: false, loading: false, error: 'Unable to check payment availability. Make sure StreamFlix is connected and try again.', unavailableReason: null });
      }
    }
  }, []);
  useEffect(() => {
    mounted.current = true;
    void refresh();
    const onFocus = () => { void refresh(); };
    window.addEventListener('focus', onFocus);
    return () => { mounted.current = false; request.current++; window.removeEventListener('focus', onFocus); };
  }, [refresh]);
  return { ...state, refresh };
}
