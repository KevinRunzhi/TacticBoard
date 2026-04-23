import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  clearPendingAndroidShareReturn,
  readPendingAndroidShareReturn,
} from '@/lib/android-share-return';
import { isAndroidTauri } from '@/lib/platform';

function buildCurrentRoute(pathname: string, search: string) {
  return `${pathname}${search}`;
}

export function AndroidShareReturnGuard() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationRef = useRef(location);

  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  useEffect(() => {
    const restoreEditorRouteIfNeeded = () => {
      if (!isAndroidTauri()) {
        return;
      }

      const pending = readPendingAndroidShareReturn();
      if (!pending) {
        return;
      }

      const currentRoute = buildCurrentRoute(
        locationRef.current.pathname,
        locationRef.current.search,
      );

      if (currentRoute === pending.route || currentRoute.startsWith('/editor')) {
        clearPendingAndroidShareReturn();
        return;
      }

      if (currentRoute === '/' && pending.route.startsWith('/editor')) {
        clearPendingAndroidShareReturn();
        navigate(pending.route, { replace: true });
      }
    };

    const handleFocus = () => {
      restoreEditorRouteIfNeeded();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        restoreEditorRouteIfNeeded();
      }
    };

    restoreEditorRouteIfNeeded();
    window.addEventListener('focus', handleFocus);
    window.addEventListener('pageshow', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('pageshow', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [navigate]);

  return null;
}
