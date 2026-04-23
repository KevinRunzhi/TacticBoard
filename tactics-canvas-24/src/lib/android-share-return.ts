const ANDROID_SHARE_RETURN_STORAGE_KEY = 'tactics-canvas:android-share-return:v1';
export const ANDROID_SHARE_RETURN_MAX_AGE_MS = 15_000;

export interface PendingAndroidShareReturn {
  route: string;
  startedAt: number;
}

function getSessionStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function parsePendingAndroidShareReturn(raw: string | null): PendingAndroidShareReturn | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PendingAndroidShareReturn>;
    if (
      typeof parsed.route === 'string' &&
      parsed.route.startsWith('/editor') &&
      typeof parsed.startedAt === 'number'
    ) {
      return {
        route: parsed.route,
        startedAt: parsed.startedAt,
      };
    }
  } catch {
    return null;
  }

  return null;
}

export function rememberAndroidShareReturnRoute(
  route: string,
  options?: { startedAt?: number },
) {
  if (!route.startsWith('/editor')) {
    return;
  }

  const storage = getSessionStorage();
  if (!storage) {
    return;
  }

  storage.setItem(
    ANDROID_SHARE_RETURN_STORAGE_KEY,
    JSON.stringify({
      route,
      startedAt: options?.startedAt ?? Date.now(),
    } satisfies PendingAndroidShareReturn),
  );
}

export function clearPendingAndroidShareReturn() {
  const storage = getSessionStorage();
  if (!storage) {
    return;
  }

  storage.removeItem(ANDROID_SHARE_RETURN_STORAGE_KEY);
}

export function readPendingAndroidShareReturn(options?: {
  now?: number;
}): PendingAndroidShareReturn | null {
  const storage = getSessionStorage();
  if (!storage) {
    return null;
  }

  const pending = parsePendingAndroidShareReturn(
    storage.getItem(ANDROID_SHARE_RETURN_STORAGE_KEY),
  );
  if (!pending) {
    storage.removeItem(ANDROID_SHARE_RETURN_STORAGE_KEY);
    return null;
  }

  const now = options?.now ?? Date.now();
  if (now - pending.startedAt > ANDROID_SHARE_RETURN_MAX_AGE_MS) {
    storage.removeItem(ANDROID_SHARE_RETURN_STORAGE_KEY);
    return null;
  }

  return pending;
}
