import { createContext } from 'react';
import type { Workspace } from '@/types/workspace';

export interface WorkspaceContextValue {
  workspace: Workspace;
  setWorkspace: (workspace: Workspace) => void;
}

export const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);
