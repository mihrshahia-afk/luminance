import { Component, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import BooksPage from './pages/BooksPage';
import BookReaderPage from './pages/BookReaderPage';
import PrayersPage from './pages/PrayersPage';
import PrayerReaderPage from './pages/PrayerReaderPage';
import LettersPage from './pages/LettersPage';
import LetterReaderPage from './pages/LetterReaderPage';
import SearchPage from './pages/SearchPage';
import FavoritesPage from './pages/FavoritesPage';
import SplashPage from './pages/SplashPage';

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
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<SplashPage />} />
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
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </ErrorBoundary>
  );
}
