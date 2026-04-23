import { useLocation, useNavigate } from 'react-router-dom';
import {
  FolderOpen,
  Home,
  Settings,
} from 'lucide-react';

const navLinks = [
  { path: '/', label: '工作台', icon: Home, exact: true },
  { path: '/projects', label: '项目', icon: FolderOpen },
  { path: '/settings', label: '设置', icon: Settings },
] as const;

export function TopNavV2() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <>
      {/* Desktop / tablet top bar */}
      <header className="safe-top sticky top-0 z-50 flex min-h-12 shrink-0 items-center gap-3 border-b border-border/30 bg-panel/80 px-4 backdrop-blur-xl sm:px-5">
        <button
          onClick={() => navigate('/')}
          className="mr-2 flex shrink-0 items-center gap-2"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-primary to-accent shadow-sm shadow-primary/20">
            <span className="text-[10px] font-bold leading-none text-primary-foreground">T</span>
          </div>
          <span className="hidden text-[13px] font-medium tracking-tight text-foreground/90 sm:inline">
            TacticBoard战术板
          </span>
        </button>

        <nav className="ml-1 hidden items-center gap-0.5 md:flex">
          {navLinks.map((link) => {
            const isActive = ('exact' in link && link.exact)
              ? pathname === link.path
              : pathname.startsWith(link.path);

            return (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`h-7 rounded-md px-2.5 text-[12px] font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-secondary text-foreground/95'
                    : 'text-muted-foreground/60 hover:bg-secondary/50 hover:text-foreground/70'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        <div className="ml-auto" />
      </header>

      {/* Mobile bottom nav */}
      <nav className="safe-bottom fixed bottom-0 left-0 right-0 z-50 flex min-h-14 items-center justify-around border-t border-border/30 bg-panel/95 backdrop-blur-xl md:hidden">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = ('exact' in link && link.exact)
            ? pathname === link.path
            : pathname.startsWith(link.path);

          return (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground/40 active:text-foreground/60'
              }`}
            >
              <Icon className="size-4" />
              <span className="text-[10px] font-medium">{link.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
