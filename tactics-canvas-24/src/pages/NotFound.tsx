import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-6">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-xl">
        <div className="text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground">404</div>
        <h1 className="mt-3 text-3xl font-semibold text-foreground">页面不存在</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          当前链接没有对应的页面内容。你可以返回工作台继续新建项目，或者去项目页打开已有项目。
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            返回工作台
          </Link>
          <Link
            to="/projects"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            查看项目页
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
