export const DEFAULT_PROJECT_NAME = '新建战术板';

const LEGACY_CORRUPTED_DEFAULT_PROJECT_NAMES = new Set([
  '閺傛澘缂?',
  '鏂板缓鎴樻湳鏉?',
  '鏂板缓鎴樻湳鏉�',
]);

export function normalizeProjectNameValue(name?: string | null) {
  const trimmed = name?.trim() ?? '';

  if (!trimmed) {
    return DEFAULT_PROJECT_NAME;
  }

  if (LEGACY_CORRUPTED_DEFAULT_PROJECT_NAMES.has(trimmed)) {
    return DEFAULT_PROJECT_NAME;
  }

  return trimmed;
}
