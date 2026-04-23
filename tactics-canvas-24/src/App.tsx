import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AndroidShareReturnGuard } from "@/components/app/AndroidShareReturnGuard";
import { AppShellV2 } from "@/components/v2/AppShellV2";
import { WorkspaceProvider } from "@/context/workspace-context.tsx";
import { createAppRouter } from "@/lib/platform";
import Dashboard from "./pages/DashboardV2";
import Projects from "./pages/ProjectsV2";
import Settings from "./pages/SettingsV2";
import Editor from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <WorkspaceProvider>
        {createAppRouter(
          <>
            <AndroidShareReturnGuard />
            <Routes>
              <Route element={<AppShellV2 />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
              <Route path="/editor" element={<Editor />} />
              <Route path="/editor/:projectId" element={<Editor />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </>
        )}
      </WorkspaceProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
