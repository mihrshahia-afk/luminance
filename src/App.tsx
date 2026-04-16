import { Component, Suspense, lazy, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
// Auth and Splash are NOT lazy — they're the first pages users see
import AuthPage from './pages/AuthPage';
import SplashPage from './pages/SplashPage';

// Lazy-load all other pages for code splitting.
// On chunk-load failure (stale deploy), reload the page once to pick up the new build.
function lazyRetry<T extends { default: React.ComponentType }>(loader: () => Promise<T>) {
  return lazy(() =>
    loader().catch(() => {
      // Chunk hash mismatch after a redeploy — reload to get fresh index.html
      const key = 'luminance-reload';
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, '1');
        window.location.reload();
      }
      return loader(); // fallback (won't reach if reload fires)
    })
  );
}

const HomePage = lazyRetry(() => import('./pages/HomePage'));
const BooksPage = lazyRetry(() => import('./pages/BooksPage'));
const BookReaderPage = lazyRetry(() => import('./pages/BookReaderPage'));
const PrayersPage = lazyRetry(() => import('./pages/PrayersPage'));
const PrayerReaderPage = lazyRetry(() => import('./pages/PrayerReaderPage'));
const LettersPage = lazyRetry(() => import('./pages/LettersPage'));
const LetterReaderPage = lazyRetry(() => import('./pages/LetterReaderPage'));
const SearchPage = lazyRetry(() => import('./pages/SearchPage'));
const FavoritesPage = lazyRetry(() => import('./pages/FavoritesPage'));
const QiblihPage = lazyRetry(() => import('./pages/QiblihPage'));
const SettingsPage = lazyRetry(() => import('./pages/SettingsPage'));

function LoadingFallback() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', width: '100%' }}>
      <div style={{ width: 24, height: 24, border: '2px solid #C9A84C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );
}

class ErrorBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null as string | null };
  static getDerivedStateFromError(error: Error) {
    return { error: error.message + '\n' + error.stack };
  }
  render() {
    if (this.state.error) {
      return <pre style={{ padding: 40, color: 'red', whiteSpace: 'pre-wrap' }}>{this.state.error}</pre>;
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppProvider>
          <BrowserRouter>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<AuthPage />} />
                <Route path="/splash" element={<SplashPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route element={<Layout />}>
                  <Route path="/home" element={<HomePage />} />
                  <Route path="/books" element={<BooksPage />} />
                  <Route path="/books/:bookId" element={<BookReaderPage />} />
                  <Route path="/books/:bookId/:chapterId" element={<BookReaderPage />} />
                  <Route path="/prayers" element={<PrayersPage />} />
                  <Route path="/prayers/:prayerId" element={<PrayerReaderPage />} />
                  <Route path="/letters" element={<LettersPage />} />
                  <Route path="/letters/:letterId" element={<LetterReaderPage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/favorites" element={<FavoritesPage />} />
                  <Route path="/qiblih" element={<QiblihPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
