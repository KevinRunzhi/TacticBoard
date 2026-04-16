import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Route, Routes, useLocation } from "react-router-dom";
import { createAppRouter, getRuntimePlatform } from "@/lib/platform";

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

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

afterEach(() => {
  cleanup();
  setTauriWindow(false);
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
    expect(screen.getByTestId("location")).toHaveTextContent("/settings");
  });
});
