import { createElement, type ReactNode } from "react";
import { BrowserRouter, HashRouter } from "react-router-dom";

export type RuntimePlatform = "web" | "windows-tauri";

export const routerFutureFlags = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
} as const;

export function isWindowsTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export function getRuntimePlatform(): RuntimePlatform {
  return isWindowsTauri() ? "windows-tauri" : "web";
}

export function createAppRouter(children: ReactNode): ReactNode {
  return getRuntimePlatform() === "windows-tauri"
    ? createElement(HashRouter, { future: routerFutureFlags }, children)
    : createElement(BrowserRouter, { future: routerFutureFlags }, children);
}
