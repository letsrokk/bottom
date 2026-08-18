export type ThemePreference = "system" | "light" | "dark";
export type EffectiveTheme = Exclude<ThemePreference, "system">;

export const THEME_PREFERENCE_KEY = "theme-preference";
export const THEME_PREFERENCES = ["system", "light", "dark"] as const;

export function getThemeControlState(preference: ThemePreference) {
  return THEME_PREFERENCES.map(value => ({
    preference: value,
    pressed: value === preference,
  }));
}

export function getStoredThemePreference(
  storage: Pick<Storage, "getItem">
): ThemePreference {
  try {
    return parseThemePreference(storage.getItem(THEME_PREFERENCE_KEY));
  } catch {
    return "system";
  }
}

export function parseThemePreference(value: string | null): ThemePreference {
  return value === "light" || value === "dark" || value === "system"
    ? value
    : "system";
}

export function getEffectiveTheme(
  preference: ThemePreference,
  systemPrefersDark: boolean
): EffectiveTheme {
  if (preference === "system") {
    return systemPrefersDark ? "dark" : "light";
  }

  return preference;
}

export function getNextThemePreference(
  preference: ThemePreference
): ThemePreference {
  if (preference === "system") return "light";
  if (preference === "light") return "dark";
  return "system";
}
