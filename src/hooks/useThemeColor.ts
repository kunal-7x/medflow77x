import { useEffect, useState } from "react";

export type ThemeMode = "dark" | "light";

export interface ThemePreset {
  label: string;
  primary: string;
  primaryGlow: string;
  ring: string;
}

export const themePresets: ThemePreset[] = [
  { label: "Gold", primary: "45 93% 58%", primaryGlow: "45 85% 68%", ring: "45 93% 58%" },
  { label: "Blue", primary: "217 91% 60%", primaryGlow: "217 85% 70%", ring: "217 91% 60%" },
  { label: "Emerald", primary: "160 84% 39%", primaryGlow: "160 70% 50%", ring: "160 84% 39%" },
  { label: "Rose", primary: "346 77% 50%", primaryGlow: "346 70% 62%", ring: "346 77% 50%" },
  { label: "Violet", primary: "263 70% 50%", primaryGlow: "263 60% 62%", ring: "263 70% 50%" },
  { label: "Orange", primary: "25 95% 53%", primaryGlow: "25 85% 65%", ring: "25 95% 53%" },
];

const presetColors: Record<string, string> = {
  Gold: "#EAB308",
  Blue: "#3B82F6",
  Emerald: "#10B981",
  Rose: "#E11D48",
  Violet: "#7C3AED",
  Orange: "#F97316",
};

export function getPresetColor(label: string) {
  return presetColors[label] || "#EAB308";
}

const THEME_MODE_KEY = "medflow-theme-mode";
const THEME_COLOR_KEY = "medflow-theme-color";

const lightOverrides: Record<string, string> = {
  "--background": "0 0% 98%",
  "--foreground": "228 14% 12%",
  "--card": "0 0% 100%",
  "--card-foreground": "228 14% 12%",
  "--popover": "0 0% 100%",
  "--popover-foreground": "228 14% 12%",
  "--secondary": "228 10% 92%",
  "--secondary-foreground": "228 14% 20%",
  "--muted": "228 10% 94%",
  "--muted-foreground": "228 8% 46%",
  "--accent": "35 70% 50%",
  "--accent-foreground": "0 0% 100%",
  "--border": "228 10% 88%",
  "--input": "228 10% 90%",
  "--sidebar-background": "0 0% 97%",
  "--sidebar-foreground": "228 14% 30%",
  "--sidebar-accent": "228 10% 94%",
  "--sidebar-accent-foreground": "228 14% 12%",
  "--sidebar-border": "228 10% 90%",
};

const darkDefaults: Record<string, string> = {
  "--background": "228 14% 6%",
  "--foreground": "40 10% 92%",
  "--card": "228 12% 9%",
  "--card-foreground": "40 10% 92%",
  "--popover": "228 14% 10%",
  "--popover-foreground": "40 10% 92%",
  "--secondary": "228 10% 13%",
  "--secondary-foreground": "40 10% 80%",
  "--muted": "228 10% 12%",
  "--muted-foreground": "228 8% 48%",
  "--accent": "35 70% 50%",
  "--accent-foreground": "228 14% 6%",
  "--border": "228 10% 14%",
  "--input": "228 10% 12%",
  "--sidebar-background": "228 14% 7%",
  "--sidebar-foreground": "40 10% 70%",
  "--sidebar-accent": "228 10% 12%",
  "--sidebar-accent-foreground": "40 10% 92%",
  "--sidebar-border": "228 10% 12%",
};

function applyMode(mode: ThemeMode) {
  const root = document.documentElement;
  const overrides = mode === "light" ? lightOverrides : darkDefaults;
  Object.entries(overrides).forEach(([k, v]) => root.style.setProperty(k, v));
  root.style.colorScheme = mode;
}

function applyAccent(preset: ThemePreset) {
  const root = document.documentElement;
  root.style.setProperty("--primary", preset.primary);
  root.style.setProperty("--primary-glow", preset.primaryGlow);
  root.style.setProperty("--ring", preset.ring);
  root.style.setProperty("--chart-1", preset.primary);
  root.style.setProperty("--sidebar-primary", preset.primary);
  root.style.setProperty("--sidebar-ring", preset.ring);
}

export function useThemeColor() {
  const [mode, setMode] = useState<ThemeMode>(() =>
    (localStorage.getItem(THEME_MODE_KEY) as ThemeMode) || "dark"
  );
  const [accentIndex, setAccentIndex] = useState<number>(() => {
    const saved = localStorage.getItem(THEME_COLOR_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });

  useEffect(() => {
    applyMode(mode);
    localStorage.setItem(THEME_MODE_KEY, mode);
  }, [mode]);

  useEffect(() => {
    applyAccent(themePresets[accentIndex]);
    localStorage.setItem(THEME_COLOR_KEY, String(accentIndex));
  }, [accentIndex]);

  const toggleMode = () => setMode((m) => (m === "dark" ? "light" : "dark"));

  return { mode, toggleMode, accentIndex, setAccentIndex, presets: themePresets };
}
