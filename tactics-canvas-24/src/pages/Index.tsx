import { TacticsEditor } from '@/components/tactics/TacticsEditor';
import { Button } from '@/components/ui/button';
import { getMockProjectById } from '@/data/mockProjects';
import type { EditorEntryMode } from '@/hooks/useEditorState';
import { markNewEditorSessionActive, NEW_EDITOR_SESSION_PARAM, resolveEditorEntryMode } from '@/lib/editor-entry';
import { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';

const Index = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [searchParams] = useSearchParams();
  const project = projectId ? getMockProjectById(projectId) : null;
  const presetId = searchParams.get('presetId');
  const rawMode = searchParams.get('mode');
  const sessionToken = searchParams.get(NEW_EDITOR_SESSION_PARAM);
  const mode: EditorEntryMode = resolveEditorEntryMode({
    projectId,
    rawMode,
    presetId,
    sessionToken,
  });

  useEffect(() => {
    if (projectId || rawMode !== 'new' || !sessionToken) {
      return;
    }

    markNewEditorSessionActive(sessionToken);
  }, [projectId, rawMode, sessionToken]);

  if (projectId && !project) {
    return (
      <div className="app-screen flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-xl">
          <h1 className="text-xl font-semibold text-foreground">项目不存在或已失效</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            当前链接没有对应的项目内容，请返回项目页重新选择。
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button asChild variant="secondary">
              <Link to="/">返回工作台</Link>
            </Button>
            <Button asChild>
              <Link to="/projects">查看项目</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TacticsEditor
      projectId={projectId}
      presetId={presetId}
      mode={mode}
    />
  );
};

export default Index;
