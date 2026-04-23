import { createElement, type ReactNode } from "react";
import { BrowserRouter, HashRouter } from "react-router-dom";

export type RuntimePlatform = "web" | "windows-tauri" | "android-tauri";

export const routerFutureFlags = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
} as const;

function hasTauriInternals(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

function isAndroidUserAgent(): boolean {
  return typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent);
}

export function isAndroidTauri(): boolean {
  return hasTauriInternals() && isAndroidUserAgent();
}

export function isWindowsTauri(): boolean {
  return hasTauriInternals() && !isAndroidUserAgent();
}

export function getRuntimePlatform(): RuntimePlatform {
  if (isAndroidTauri()) {
    return "android-tauri";
  }

  return isWindowsTauri() ? "windows-tauri" : "web";
}

export function createAppRouter(children: ReactNode): ReactNode {
  const runtimePlatform = getRuntimePlatform();

  return runtimePlatform === "web"
    ? createElement(BrowserRouter, { future: routerFutureFlags }, children)
    : createElement(HashRouter, { future: routerFutureFlags }, children);
}
