import { afterEach, describe, expect, it } from "vitest";
import {
  ANDROID_SHARE_RETURN_MAX_AGE_MS,
  clearPendingAndroidShareReturn,
  readPendingAndroidShareReturn,
  rememberAndroidShareReturnRoute,
} from "@/lib/android-share-return";

afterEach(() => {
  window.sessionStorage.clear();
});

describe("android share return helper", () => {
  it("stores and reads a pending editor route", () => {
    rememberAndroidShareReturnRoute("/editor/project-123?mode=review", {
      startedAt: 100,
    });

    expect(readPendingAndroidShareReturn({ now: 101 })).toEqual({
      route: "/editor/project-123?mode=review",
      startedAt: 100,
    });
  });

  it("ignores non-editor routes", () => {
    rememberAndroidShareReturnRoute("/projects");

    expect(readPendingAndroidShareReturn()).toBeNull();
  });

  it("expires stale pending routes", () => {
    rememberAndroidShareReturnRoute("/editor/project-456", {
      startedAt: 100,
    });

    expect(
      readPendingAndroidShareReturn({
        now: 100 + ANDROID_SHARE_RETURN_MAX_AGE_MS + 1,
      }),
    ).toBeNull();
  });

  it("clears the pending route", () => {
    rememberAndroidShareReturnRoute("/editor/project-789");
    clearPendingAndroidShareReturn();

    expect(readPendingAndroidShareReturn()).toBeNull();
  });
});
