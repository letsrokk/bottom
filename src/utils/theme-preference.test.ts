import { describe, expect, it } from "vitest";
import {
  getEffectiveTheme,
  getNextThemePreference,
  getStoredThemePreference,
  getThemeControlState,
  parseThemePreference,
} from "./theme-preference";

describe("theme preference", () => {
  it("defaults invalid or missing stored values to system", () => {
    expect(parseThemePreference(null)).toBe("system");
    expect(parseThemePreference("sepia")).toBe("system");
  });

  it("defaults to system when browser storage is unavailable", () => {
    const storage = {
      getItem: () => {
        throw new Error("Storage disabled");
      },
    };

    expect(getStoredThemePreference(storage)).toBe("system");
  });

  it("resolves system from the operating-system preference", () => {
    expect(getEffectiveTheme("system", true)).toBe("dark");
    expect(getEffectiveTheme("system", false)).toBe("light");
  });

  it("keeps explicit light and dark preferences", () => {
    expect(getEffectiveTheme("light", true)).toBe("light");
    expect(getEffectiveTheme("dark", false)).toBe("dark");
  });

  it("cycles through system, light, and dark", () => {
    expect(getNextThemePreference("system")).toBe("light");
    expect(getNextThemePreference("light")).toBe("dark");
    expect(getNextThemePreference("dark")).toBe("system");
  });

  it.each(["system", "light", "dark"] as const)(
    "marks only the stored %s preference as selected",
    preference => {
      expect(getThemeControlState(preference)).toEqual([
        { preference: "system", pressed: preference === "system" },
        { preference: "light", pressed: preference === "light" },
        { preference: "dark", pressed: preference === "dark" },
      ]);
    }
  );
});
