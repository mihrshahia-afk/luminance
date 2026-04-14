import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import type { Annotation } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { type Language, type TranslationStrings, translations } from '../locales/translations';

export type Theme = 'blue' | 'black' | 'cream';
export type { Language };

export interface BookProgress {
  lastChapterId: string;
  chaptersRead: string[]; // chapter IDs that have been visited
  totalChapters: number;
}

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
  readingProgress: Record<string, BookProgress>;
  markChapterRead: (bookId: string, chapterId: string, totalChapters: number) => void;
  getBookProgress: (bookId: string) => BookProgress | null;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationStrings;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [annotations, setAnnotations] = useState<Annotation[]>(() => {
    const saved = localStorage.getItem('luminance-annotations');
    return saved ? JSON.parse(saved) : [];
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('luminance-favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const [readingProgress, setReadingProgress] = useState<Record<string, BookProgress>>(() => {
    const saved = localStorage.getItem('luminance-reading-progress');
    return saved ? JSON.parse(saved) : {};
  });

  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = (localStorage.getItem('luminance-theme') as Theme) || 'blue';
    document.documentElement.setAttribute('data-theme', saved);
    return saved;
  });

  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('luminance-language') as Language;
    const lang = saved && translations[saved] ? saved : 'en';
    document.documentElement.lang = lang;
    // App layout always LTR — only reading content uses RTL
    return lang;
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    document.documentElement.lang = lang;
    localStorage.setItem('luminance-language', lang);
    if (user && supabase) {
      supabase.from('profiles').update({ language: lang }).eq('id', user.id).then(() => {});
    }
  };

  const t = translations[language];

  const setTheme = (tt: Theme) => {
    setThemeState(tt);
    document.documentElement.setAttribute('data-theme', tt);
    localStorage.setItem('luminance-theme', tt);
    // Sync theme to Supabase
    if (user && supabase) {
      supabase.from('profiles').update({ theme: tt }).eq('id', user.id).then(() => {});
    }
  };

  // ─── Sync from Supabase when user logs in ─────────────────────────────────

  // Track whether we've done initial migration from localStorage to Supabase
  const hasMigrated = useRef(false);

  const syncFromSupabase = useCallback(async () => {
    if (!user || !supabase) return;

    // ── Favorites: Supabase is source of truth ──
    const { data: favData } = await supabase
      .from('favorites')
      .select('item_id')
      .eq('user_id', user.id);

    if (favData) {
      const remoteFavs = favData.map(f => f.item_id);

      // One-time migration: push local-only favorites to Supabase on first sync
      if (!hasMigrated.current) {
        const localFavs: string[] = JSON.parse(localStorage.getItem('luminance-favorites') || '[]');
        const newFavs = localFavs.filter(id => !remoteFavs.includes(id));
        if (newFavs.length > 0) {
          await supabase.from('favorites').insert(
            newFavs.map(id => ({ user_id: user.id, item_id: id, item_type: 'unknown' }))
          );
          remoteFavs.push(...newFavs);
        }
      }

      // Always use Supabase as truth
      setFavorites(remoteFavs);
      localStorage.setItem('luminance-favorites', JSON.stringify(remoteFavs));
    }

    // ── Annotations: Supabase is source of truth ──
    const { data: annData } = await supabase
      .from('annotations')
      .select('*')
      .eq('user_id', user.id);

    if (annData) {
      const remoteAnns: Annotation[] = annData.map(a => ({
        id: a.id,
        documentId: a.document_id,
        documentType: a.document_type,
        chapterId: a.chapter_id || undefined,
        selectedText: a.selected_text || '',
        note: a.note || '',
        color: a.color || 'gold',
        createdAt: a.created_at,
      }));

      // One-time migration: push local-only annotations to Supabase on first sync
      if (!hasMigrated.current) {
        const localAnns: Annotation[] = JSON.parse(localStorage.getItem('luminance-annotations') || '[]');
        const remoteIds = new Set(remoteAnns.map(a => a.id));
        const newLocalAnns = localAnns.filter(a => !remoteIds.has(a.id));
        if (newLocalAnns.length > 0) {
          await supabase.from('annotations').insert(
            newLocalAnns.map(a => ({
              id: a.id,
              user_id: user.id,
              document_id: a.documentId,
              document_type: a.documentType,
              chapter_id: a.chapterId || null,
              selected_text: a.selectedText,
              note: a.note,
              color: a.color,
              created_at: a.createdAt,
            }))
          );
          remoteAnns.push(...newLocalAnns);
        }
      }

      // Always use Supabase as truth — deletions on other devices are respected
      setAnnotations(remoteAnns);
      localStorage.setItem('luminance-annotations', JSON.stringify(remoteAnns));
    }

    hasMigrated.current = true;

    // Fetch theme and language
    const { data: profile } = await supabase
      .from('profiles')
      .select('theme, language')
      .eq('id', user.id)
      .single();

    if (profile?.theme) {
      setThemeState(profile.theme as Theme);
      document.documentElement.setAttribute('data-theme', profile.theme);
      localStorage.setItem('luminance-theme', profile.theme);
    }
    if (profile?.language && translations[profile.language as Language]) {
      setLanguageState(profile.language as Language);
      document.documentElement.lang = profile.language;
      localStorage.setItem('luminance-language', profile.language);
    }

    // Fetch reading progress
    const { data: rpData } = await supabase
      .from('reading_progress')
      .select('*')
      .eq('user_id', user.id);

    if (rpData && rpData.length > 0) {
      const localProgress: Record<string, BookProgress> = JSON.parse(localStorage.getItem('luminance-reading-progress') || '{}');
      const remoteProgress: Record<string, BookProgress> = {};
      rpData.forEach((rp: { book_id: string; last_chapter_id: string; chapters_read: string[]; total_chapters: number }) => {
        remoteProgress[rp.book_id] = {
          lastChapterId: rp.last_chapter_id,
          chaptersRead: rp.chapters_read || [],
          totalChapters: rp.total_chapters,
        };
      });

      // Merge: take whichever has more chapters read per book
      const merged: Record<string, BookProgress> = { ...localProgress };
      for (const [bookId, remote] of Object.entries(remoteProgress)) {
        const local = merged[bookId];
        if (!local || remote.chaptersRead.length >= local.chaptersRead.length) {
          merged[bookId] = remote;
        }
      }

      // Push any local-only progress to Supabase
      for (const [bookId, local] of Object.entries(localProgress)) {
        if (!remoteProgress[bookId]) {
          await supabase.from('reading_progress').upsert({
            user_id: user.id,
            book_id: bookId,
            last_chapter_id: local.lastChapterId,
            chapters_read: local.chaptersRead,
            total_chapters: local.totalChapters,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id,book_id' });
        }
      }

      setReadingProgress(merged);
      localStorage.setItem('luminance-reading-progress', JSON.stringify(merged));
    }
  }, [user]);

  // Sync on login
  useEffect(() => {
    syncFromSupabase();
  }, [syncFromSupabase]);

  // Re-sync when user returns to the app (tab becomes visible again)
  useEffect(() => {
    if (!user || !supabase) return;

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        syncFromSupabase();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    // Also sync every 30 seconds while app is open
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        syncFromSupabase();
      }
    }, 30000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(interval);
    };
  }, [user, syncFromSupabase]);

  // ─── Persist to localStorage (always) ──────────────────────────────────────

  useEffect(() => {
    localStorage.setItem('luminance-annotations', JSON.stringify(annotations));
  }, [annotations]);

  useEffect(() => {
    localStorage.setItem('luminance-favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('luminance-reading-progress', JSON.stringify(readingProgress));
  }, [readingProgress]);

  // ─── Reading progress ─────────────────────────────────────────────────────

  const markChapterRead = useCallback((bookId: string, chapterId: string, totalChapters: number) => {
    setReadingProgress(prev => {
      const existing = prev[bookId];
      const chaptersRead = existing
        ? [...new Set([...existing.chaptersRead, chapterId])]
        : [chapterId];
      const updated = {
        ...prev,
        [bookId]: { lastChapterId: chapterId, chaptersRead, totalChapters },
      };

      // Sync to Supabase
      if (user && supabase) {
        supabase.from('reading_progress').upsert({
          user_id: user.id,
          book_id: bookId,
          last_chapter_id: chapterId,
          chapters_read: chaptersRead,
          total_chapters: totalChapters,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,book_id' }).then(() => {});
      }

      return updated;
    });
  }, [user]);

  const getBookProgress = useCallback((bookId: string): BookProgress | null => {
    return readingProgress[bookId] || null;
  }, [readingProgress]);

  // ─── CRUD operations ──────────────────────────────────────────────────────

  const addAnnotation = (annotation: Omit<Annotation, 'id' | 'createdAt'>) => {
    const newAnnotation: Annotation = {
      ...annotation,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setAnnotations(prev => [newAnnotation, ...prev]);

    // Sync to Supabase
    if (user && supabase) {
      supabase.from('annotations').insert({
        id: newAnnotation.id,
        user_id: user.id,
        document_id: newAnnotation.documentId,
        document_type: newAnnotation.documentType,
        chapter_id: newAnnotation.chapterId || null,
        selected_text: newAnnotation.selectedText,
        note: newAnnotation.note,
        color: newAnnotation.color,
        created_at: newAnnotation.createdAt,
      }).then(({ error }) => { if (error) console.error('Annotation save error:', error); });
    }
  };

  const deleteAnnotation = (id: string) => {
    setAnnotations(prev => prev.filter(a => a.id !== id));
    if (user && supabase) {
      supabase.from('annotations').delete().eq('id', id).eq('user_id', user.id)
        .then(({ error }) => { if (error) console.error('Delete annotation error:', error); });
    }
  };

  const updateAnnotation = (id: string, note: string) => {
    setAnnotations(prev => prev.map(a => a.id === id ? { ...a, note } : a));
    if (user && supabase) {
      supabase.from('annotations').update({ note }).eq('id', id).eq('user_id', user.id)
        .then(({ error }) => { if (error) console.error('Update annotation error:', error); });
    }
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const isFav = prev.includes(id);
      const next = isFav ? prev.filter(f => f !== id) : [...prev, id];

      // Sync to Supabase
      if (user && supabase) {
        if (isFav) {
          supabase.from('favorites').delete().eq('item_id', id).eq('user_id', user.id).then(() => {});
        } else {
          supabase.from('favorites').insert({ user_id: user.id, item_id: id, item_type: 'item' }).then(() => {});
        }
      }

      return next;
    });
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
      readingProgress, markChapterRead, getBookProgress,
      language, setLanguage, t,
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
