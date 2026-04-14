import { useEffect, useMemo, type ReactNode } from 'react';
import { WorkspaceContext } from '@/context/workspace-context';
import { WORKSPACE_STORAGE_KEY, type Workspace } from '@/types/workspace';

const FIXED_WORKSPACE: Workspace = 'personal';

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(WORKSPACE_STORAGE_KEY, FIXED_WORKSPACE);
  }, []);

  const value = useMemo(
    () => ({
      workspace: FIXED_WORKSPACE,
      setWorkspace: () => {},
    }),
    [],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}
