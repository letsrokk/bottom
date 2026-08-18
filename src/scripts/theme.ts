import {
  getEffectiveTheme,
  getStoredThemePreference,
  parseThemePreference,
  THEME_PREFERENCE_KEY,
  type ThemePreference,
} from "@/utils/theme-preference";

const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
const inlineTheme = (
  window as unknown as {
    __theme?: { preference: ThemePreference };
  }
).__theme;
let preference =
  inlineTheme?.preference ?? getStoredThemePreference(localStorage);

function reflect(): void {
  const themeValue = getEffectiveTheme(preference, mediaQuery.matches);
  const root = document.firstElementChild;
  root?.setAttribute("data-theme", themeValue);
  root?.classList.toggle("dark", themeValue === "dark");
  const select = document.querySelector<HTMLSelectElement>("#theme-select");
  if (select) select.value = preference;

  // Fill <meta name="theme-color"> with the computed background colour so
  // Android's browser chrome matches the page background.
  const bg = window.getComputedStyle(document.body).backgroundColor;
  document
    .querySelector("meta[name='theme-color']")
    ?.setAttribute("content", bg);
}

function setup(): void {
  reflect();
  const select = document.querySelector<HTMLSelectElement>("#theme-select");
  if (!select) return;
  select.onchange = () => {
    preference = parseThemePreference(select.value);
    try {
      localStorage.setItem(THEME_PREFERENCE_KEY, preference);
    } catch {
      // The selected theme still applies when browser storage is unavailable.
    }
    reflect();
  };
}

setup();

// Re-run after View Transitions navigation.
document.addEventListener("astro:after-swap", setup);

// Carry the theme-color value across View Transitions to prevent the
// Android navigation bar from flashing during page transitions.
document.addEventListener("astro:before-swap", event => {
  const color = document
    .querySelector("meta[name='theme-color']")
    ?.getAttribute("content");
  if (color) {
    (event as { newDocument: Document }).newDocument
      .querySelector("meta[name='theme-color']")
      ?.setAttribute("content", color);
  }
});

// Sync with OS-level dark/light preference changes.
mediaQuery.addEventListener("change", () => {
  if (preference === "system") reflect();
});
