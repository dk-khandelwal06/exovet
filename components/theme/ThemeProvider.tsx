"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeMode = "light" | "twilight" | "dark";

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  setTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeMode>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("exovet_theme") as ThemeMode | null;
      if (saved && (saved === "light" || saved === "twilight" || saved === "dark")) {
        setThemeState(saved);
        document.documentElement.setAttribute("data-theme", saved);
      } else {
        document.documentElement.setAttribute("data-theme", "dark");
      }
    } catch {
      document.documentElement.setAttribute("data-theme", "dark");
    }
    setMounted(true);
  }, []);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem("exovet_theme", newTheme);
      document.documentElement.setAttribute("data-theme", newTheme);
    } catch {}
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

