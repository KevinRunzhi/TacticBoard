import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import App from "@/App";

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

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  window.localStorage.clear();
  setTauriWindow(false);
  setUserAgent(defaultUserAgent);
  window.history.replaceState({}, "", "/");
  window.location.hash = "";
});

describe("android app router", () => {
  it("renders the actual not-found screen for an invalid android-tauri hash route", async () => {
    setTauriWindow(true);
    setUserAgent(androidUserAgent);
    window.history.replaceState({}, "", "/");
    window.location.hash = "#/route-that-does-not-exist";

    render(<App />);

    expect(await screen.findByText("页面不存在")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "返回工作台" })).toHaveAttribute("href", "#/");
    expect(screen.getByRole("link", { name: "查看项目页" })).toHaveAttribute(
      "href",
      "#/projects",
    );
  });

  it("can return from the not-found screen back to the dashboard in android-tauri", async () => {
    setTauriWindow(true);
    setUserAgent(androidUserAgent);
    window.history.replaceState({}, "", "/");
    window.location.hash = "#/route-that-does-not-exist";

    render(<App />);

    fireEvent.click(await screen.findByRole("link", { name: "返回工作台" }));

    expect(await screen.findByText("战术工作台")).toBeInTheDocument();
    expect(window.location.hash).toBe("#/");
  });
});
