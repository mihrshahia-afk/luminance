import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Annotation } from '../types';

export type Theme = 'blue' | 'black' | 'cream';

interface AppContextType {
  annotations: Annotation[];
  favorites: string[];
  theme: Theme;
  setTheme: (theme: Theme) => void;
  addAnnotation: (annotation: Omit<Annotation, 'id' | 'createdAt'>) => void;
  deleteAnnotation: (id: string) => void;
  updateAnnotation: (id: string, note: string) => void;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  getAnnotationsForDocument: (documentId: string, chapterId?: string) => Annotation[];
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [annotations, setAnnotations] = useState<Annotation[]>(() => {
    const saved = localStorage.getItem('luminance-annotations');
    return saved ? JSON.parse(saved) : [];
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('luminance-favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = (localStorage.getItem('luminance-theme') as Theme) || 'blue';
    // Apply immediately to avoid flash
    document.documentElement.setAttribute('data-theme', saved);
    return saved;
  });

  const setTheme = (t: Theme) => {
    setThemeState(t);
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('luminance-theme', t);
  };

  useEffect(() => {
    localStorage.setItem('luminance-annotations', JSON.stringify(annotations));
  }, [annotations]);

  useEffect(() => {
    localStorage.setItem('luminance-favorites', JSON.stringify(favorites));
  }, [favorites]);

  const addAnnotation = (annotation: Omit<Annotation, 'id' | 'createdAt'>) => {
    const newAnnotation: Annotation = {
      ...annotation,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setAnnotations(prev => [newAnnotation, ...prev]);
  };

  const deleteAnnotation = (id: string) => {
    setAnnotations(prev => prev.filter(a => a.id !== id));
  };

  const updateAnnotation = (id: string, note: string) => {
    setAnnotations(prev => prev.map(a => a.id === id ? { ...a, note } : a));
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const isFavorite = (id: string) => favorites.includes(id);

  const getAnnotationsForDocument = (documentId: string, chapterId?: string) => {
    return annotations.filter(a =>
      a.documentId === documentId && (!chapterId || a.chapterId === chapterId)
    );
  };

  return (
    <AppContext.Provider value={{
      annotations, favorites, theme, setTheme,
      addAnnotation, deleteAnnotation, updateAnnotation,
      toggleFavorite, isFavorite, getAnnotationsForDocument,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
