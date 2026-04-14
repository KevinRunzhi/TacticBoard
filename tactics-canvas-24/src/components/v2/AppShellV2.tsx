import { Outlet } from 'react-router-dom';
import { TopNavV2 } from './TopNavV2';

export function AppShellV2() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNavV2 />
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        <Outlet />
      </main>
    </div>
  );
}
