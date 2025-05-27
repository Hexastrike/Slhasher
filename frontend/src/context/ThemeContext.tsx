
import React, { createContext, useContext, useState, useEffect } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialize with a default theme
  const [theme, setTheme] = useState<Theme>(() => {
    // this runs once, on mount, even on a reload
    try {
      const saved = localStorage.getItem("theme") as Theme | null;
      if (saved === "light" || saved === "dark") return saved;
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
    } catch {/* ignore */}
    return "light";
  });
  
  useEffect(() => {
    // Get theme from localStorage or use system preference
    const getInitialTheme = (): Theme => {
      try {
        const savedTheme = localStorage.getItem("theme") as Theme | null;
        
        if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
          return savedTheme;
        }
        
        if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
          return "dark";
        }
        
        return "light";
      } catch (error) {
        console.error("Error getting initial theme:", error);
        return "light";
      }
    };
    
    setTheme(getInitialTheme());
  }, []);

  useEffect(() => {
    try {
      // Apply theme class to document
      if (typeof window !== 'undefined') {
        const root = window.document.documentElement;
        
        root.classList.remove("light", "dark");
        root.classList.add(theme);
        
        // Save preference to localStorage
        localStorage.setItem("theme", theme);
      }
    } catch (error) {
      console.error("Error applying theme:", error);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use the theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  
  return context;
}
