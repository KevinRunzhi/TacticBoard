import { Outlet } from 'react-router-dom';
import { TopNavV2 } from './TopNavV2';

export function AppShellV2() {
  return (
    <div className="app-screen flex flex-col overflow-hidden bg-background">
      <TopNavV2 />
      <main className="flex-1 overflow-y-auto pb-[calc(4rem+env(safe-area-inset-bottom,0px))] md:pb-0">
        <Outlet />
      </main>
    </div>
  );
}
