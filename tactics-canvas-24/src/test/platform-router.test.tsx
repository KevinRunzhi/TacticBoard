import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Route, Routes, useLocation } from "react-router-dom";
import {
  createAppRouter,
  getRuntimePlatform,
  isAndroidTauri,
  isWindowsTauri,
} from "@/lib/platform";

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

const defaultUserAgent = window.navigator.userAgent;
const androidUserAgent =
  "Mozilla/5.0 (Linux; Android 14; Pixel 7 Build/UP1A.231005.007) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/113.0.0.0 Mobile Safari/537.36";

function setTauriWindow(enabled: boolean) {
  if (enabled) {
    Object.defineProperty(window, "__TAURI_INTERNALS__", {
      configurable: true,
      value: {},
    });
    return;
  }

  Reflect.deleteProperty(window, "__TAURI_INTERNALS__");
}

function setUserAgent(userAgent: string) {
  Object.defineProperty(window.navigator, "userAgent", {
    configurable: true,
    value: userAgent,
  });
}

afterEach(() => {
  cleanup();
  setTauriWindow(false);
  setUserAgent(defaultUserAgent);
  window.history.replaceState({}, "", "/");
  window.location.hash = "";
});

describe("platform router", () => {
  it("detects web by default", () => {
    expect(getRuntimePlatform()).toBe("web");
  });

  it("uses BrowserRouter semantics on web", () => {
    window.history.replaceState({}, "", "/projects");

    render(
      createAppRouter(
        <Routes>
          <Route path="/projects" element={<LocationProbe />} />
        </Routes>,
      ),
    );

    expect(screen.getByTestId("location")).toHaveTextContent("/projects");
  });

  it("uses HashRouter semantics on windows-tauri", () => {
    setTauriWindow(true);
    setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
    window.history.replaceState({}, "", "/");
    window.location.hash = "#/settings";

    render(
      createAppRouter(
        <Routes>
          <Route path="/settings" element={<LocationProbe />} />
        </Routes>,
      ),
    );

    expect(getRuntimePlatform()).toBe("windows-tauri");
    expect(isWindowsTauri()).toBe(true);
    expect(isAndroidTauri()).toBe(false);
    expect(screen.getByTestId("location")).toHaveTextContent("/settings");
  });

  it("detects android-tauri from tauri internals and Android user agent", () => {
    setTauriWindow(true);
    setUserAgent(androidUserAgent);

    expect(getRuntimePlatform()).toBe("android-tauri");
    expect(isAndroidTauri()).toBe(true);
    expect(isWindowsTauri()).toBe(false);
  });

  it("uses HashRouter semantics on android-tauri", () => {
    setTauriWindow(true);
    setUserAgent(androidUserAgent);
    window.history.replaceState({}, "", "/");
    window.location.hash = "#/editor/demo-project";

    render(
      createAppRouter(
        <Routes>
          <Route path="/editor/:projectId" element={<LocationProbe />} />
        </Routes>,
      ),
    );

    expect(screen.getByTestId("location")).toHaveTextContent("/editor/demo-project");
  });

  it("keeps unmatched android-tauri routes inside the controlled router tree", () => {
    setTauriWindow(true);
    setUserAgent(androidUserAgent);
    window.history.replaceState({}, "", "/");
    window.location.hash = "#/route-that-does-not-exist";

    render(
      createAppRouter(
        <Routes>
          <Route path="/settings" element={<LocationProbe />} />
          <Route path="*" element={<div data-testid="fallback">fallback-route</div>} />
        </Routes>,
      ),
    );

    expect(screen.getByTestId("fallback")).toHaveTextContent("fallback-route");
  });
});
