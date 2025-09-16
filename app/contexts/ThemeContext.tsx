'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'purple';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  getThemeClasses: (component: string) => string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>('purple');

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('taghaus-theme') as Theme;
    if (savedTheme && ['light', 'dark', 'purple'].includes(savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  // Save theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('taghaus-theme', theme);
  }, [theme]);

  const getThemeClasses = (component: string): string => {
    const themes = {
      light: {
        background: 'bg-slate-50',
        header: 'bg-white/95 backdrop-blur-xl border-b border-slate-200/50',
        card: 'bg-white/90 backdrop-blur-sm border border-slate-200/60 shadow-sm',
        cardHover: 'hover:bg-white hover:border-slate-300/70 hover:shadow-md',
        section: 'bg-white/70 backdrop-blur-sm border border-slate-200/50 shadow-sm',
        text: {
          primary: 'text-slate-900',
          secondary: 'text-slate-600',
          accent: 'text-blue-600',
          muted: 'text-slate-500'
        },
        button: {
          primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md',
          secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 shadow-sm hover:shadow-md',
          accent: 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm hover:shadow-md'
        },
        input: 'bg-white border border-slate-300 text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
        nav: {
          active: 'bg-blue-600 text-white border-blue-600 shadow-sm',
          inactive: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 hover:border-slate-300'
        }
      },
      dark: {
        background: 'bg-gradient-to-br from-black via-gray-950 to-gray-900',
        header: 'bg-gradient-to-r from-black/95 via-gray-950/95 to-gray-900/95 backdrop-blur-xl border-b border-gray-800/30',
        card: 'bg-gradient-to-br from-gray-950/60 to-gray-900/60 backdrop-blur-md border border-gray-800/30 shadow-lg',
        cardHover: 'hover:from-gray-950/80 hover:to-gray-900/80 hover:border-gray-700/50 hover:shadow-xl',
        section: 'bg-gradient-to-br from-gray-950/40 via-gray-900/40 to-black/40 backdrop-blur-xl border border-gray-800/30 shadow-2xl',
        text: {
          primary: 'text-white',
          secondary: 'text-gray-300',
          accent: 'text-gray-300',
          muted: 'text-gray-400/80'
        },
        button: {
          primary: 'bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white shadow-lg hover:shadow-xl',
          secondary: 'bg-gradient-to-r from-gray-900/60 to-gray-800/60 hover:from-gray-900/80 hover:to-gray-800/80 text-gray-200 border border-gray-800/40 shadow-lg hover:shadow-xl',
          accent: 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl'
        },
        input: 'bg-gray-950/80 backdrop-blur-md border border-gray-800/50 text-white placeholder-gray-400/70 focus:ring-2 focus:ring-gray-400',
        nav: {
          active: 'bg-gradient-to-r from-gray-800/50 to-gray-900/50 text-white border-gray-700/70 shadow-lg',
          inactive: 'text-gray-300/70 hover:text-white hover:bg-gradient-to-r hover:from-gray-800/25 hover:to-gray-900/25 hover:border-gray-700/50'
        }
      },
      purple: {
        background: 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900',
        header: 'bg-gradient-to-r from-slate-900/95 via-purple-900/95 to-slate-900/95 backdrop-blur-xl border-b border-purple-500/30',
        card: 'bg-gradient-to-br from-slate-800/50 to-purple-900/50 backdrop-blur-md border border-purple-500/30 shadow-lg',
        cardHover: 'hover:from-slate-800/70 hover:to-purple-900/70 hover:border-purple-400/50 hover:shadow-xl',
        section: 'bg-gradient-to-br from-slate-800/30 via-purple-900/30 to-slate-800/30 backdrop-blur-xl border border-purple-500/30 shadow-2xl',
        text: {
          primary: 'text-white',
          secondary: 'text-purple-300',
          accent: 'text-purple-400',
          muted: 'text-purple-300/80'
        },
        button: {
          primary: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl',
          secondary: 'bg-gradient-to-r from-slate-700/50 to-purple-800/50 hover:from-slate-700/70 hover:to-purple-800/70 text-purple-200 border border-purple-500/40 shadow-lg hover:shadow-xl',
          accent: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl'
        },
        input: 'bg-slate-900/80 backdrop-blur-md border border-purple-500/50 text-white placeholder-purple-200/70 focus:ring-2 focus:ring-purple-400',
        nav: {
          active: 'bg-gradient-to-r from-purple-500/50 to-pink-500/50 text-white border-purple-400/70 shadow-lg',
          inactive: 'text-white/70 hover:text-white hover:bg-gradient-to-r hover:from-purple-500/25 hover:to-pink-500/25 hover:border-purple-400/50'
        }
      }
    };

    // Handle nested property access (e.g., "text.primary")
    const keys = component.split('.');
    let result = themes[theme];
    
    for (const key of keys) {
      if (result && typeof result === 'object' && key in result) {
        result = result[key];
      } else {
        return '';
      }
    }
    
    return typeof result === 'string' ? result : '';
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, getThemeClasses }}>
      {children}
    </ThemeContext.Provider>
  );
}
