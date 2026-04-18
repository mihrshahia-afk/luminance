import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MessageSquare, List, Star, Loader2, ExternalLink, X, CornerDownRight, CornerDownLeft, ChevronDown } from 'lucide-react';
import { getBookConfig } from '../data/bookConfig';
import type { BookChapter } from '../data/bookConfig';
import { discoverChapters, fetchChapter, getCachedChapter } from '../data/bookFetcher';
import { bookCovers } from '../data/bookCovers';
import { useApp } from '../context/AppContext';
import AnnotationPanel from '../components/AnnotationPanel';
import ReadingProgress from '../components/ReadingProgress';
import { SkeletonReader } from '../components/Skeleton';

interface HighlightInfo {
  text: string;
  color: string;
  id: string;
}

function applyHighlights(html: string, highlights: HighlightInfo[]): string {
  if (!highlights.length) return html;

  // Simple approach: for each highlight, find its text in the HTML and wrap it.
  // Process one at a time. Use a placeholder to prevent re-matching.
  let result = html;
  const placeholders: { ph: string; replacement: string }[] = [];

  // Sort longest first so longer selections get matched before shorter substrings
  const sorted = [...highlights].sort((a, b) => b.text.length - a.text.length);

  for (const h of sorted) {
    if (h.text.length < 3) continue;

    // The selected text from getSelection() may have newlines where <p> boundaries are.
    // We need to match even if HTML tags appear between the characters.
    // Strategy: build a regex that allows optional HTML tags between each character group.

    // Split the search text into words/chunks and look for them with optional tags between
    const searchText = h.text;

    // First try: direct match in the HTML (works for single-paragraph selections)
    let idx = result.indexOf(searchText);
    if (idx !== -1) {
      // Check we're not inside an existing <mark> tag
      const beforeSlice = result.slice(Math.max(0, idx - 200), idx);
      const lastMarkOpen = beforeSlice.lastIndexOf('<mark');
      const lastMarkClose = beforeSlice.lastIndexOf('</mark>');
      if (lastMarkOpen <= lastMarkClose || lastMarkOpen === -1) {
        // Safe to replace
        const ph = `\x00PH${placeholders.length}\x00`;
        const replacement = `<mark class="annot-highlight annot-${h.color}" data-annot-id="${h.id}">${searchText}</mark>`;
        placeholders.push({ ph, replacement });
        result = result.slice(0, idx) + ph + result.slice(idx + searchText.length);
        continue;
      }
    }

    // Second try: the selection spans HTML tags (e.g. across </p><p>).
    // Remove newlines from the search text and try to find it allowing tags in between.
    const textNoNewlines = searchText.replace(/\n/g, '');
    if (textNoNewlines !== searchText) {
      idx = result.indexOf(textNoNewlines);
      if (idx !== -1) {
        const beforeSlice = result.slice(Math.max(0, idx - 200), idx);
        const lastMarkOpen = beforeSlice.lastIndexOf('<mark');
        const lastMarkClose = beforeSlice.lastIndexOf('</mark>');
        if (lastMarkOpen <= lastMarkClose || lastMarkOpen === -1) {
          const ph = `\x00PH${placeholders.length}\x00`;
          const replacement = `<mark class="annot-highlight annot-${h.color}" data-annot-id="${h.id}">${textNoNewlines}</mark>`;
          placeholders.push({ ph, replacement });
          result = result.slice(0, idx) + ph + result.slice(idx + textNoNewlines.length);
          continue;
        }
      }
    }

    // Third try: build a flexible regex that allows HTML tags between chunks of the text
    // Split by newlines (paragraph boundaries) and join with a pattern that matches tags
    const chunks = searchText.split(/\n+/).map(c => c.trim()).filter(Boolean);
    if (chunks.length > 1) {
      const escaped = chunks.map(c => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      const pattern = new RegExp(escaped.join('[\\s\\S]{0,50}'), 'g');
      const match = pattern.exec(result);
      if (match) {
        const matchIdx = match.index;
        const matchLen = match[0].length;
        const beforeSlice = result.slice(Math.max(0, matchIdx - 200), matchIdx);
        const lastMarkOpen = beforeSlice.lastIndexOf('<mark');
        const lastMarkClose = beforeSlice.lastIndexOf('</mark>');
        if (lastMarkOpen <= lastMarkClose || lastMarkOpen === -1) {
          const ph = `\x00PH${placeholders.length}\x00`;
          const replacement = `<mark class="annot-highlight annot-${h.color}" data-annot-id="${h.id}">${match[0]}</mark>`;
          placeholders.push({ ph, replacement });
          result = result.slice(0, matchIdx) + ph + result.slice(matchIdx + matchLen);
        }
      }
    }
  }

  // Restore placeholders with actual mark tags
  for (const { ph, replacement } of placeholders) {
    result = result.replace(ph, replacement);
  }

  return result;
}

function renderContent(text: string, chapterTitle?: string, highlights?: HighlightInfo[]): string {
  const paras = text.split('\n\n');

  if (paras.length > 0 && chapterTitle) {
    const first = paras[0].replace(/^\*\*/, '').replace(/\*\*$/, '').trim();
    const titleClean = chapterTitle.replace(/^\d+\.\s*/, '').trim();
    if (first === titleClean || first === chapterTitle) {
      paras.shift();
    }
  }

  let html = paras
    .map(para => {
      if (para.startsWith('**') && para.endsWith('**')) {
        return `<h3>${para.slice(2, -2)}</h3>`;
      }
      return `<p>${para}</p>`;
    })
    .join('');

  if (highlights?.length) {
    html = applyHighlights(html, highlights);
  }

  return html;
}

// Separate component that re-renders when annotations change
function HighlightedContent({ content, chapterTitle, documentId, chapterId, onTextSelect, onHighlightClick }: {
  content: string;
  chapterTitle?: string;
  documentId: string;
  chapterId?: string;
  onTextSelect: () => void;
  onHighlightClick?: (annotId: string) => void;
}) {
  const { getAnnotationsForDocument, annotations } = useApp();

  const html = useMemo(() => {
    const chapterAnnotations = getAnnotationsForDocument(documentId, chapterId);
    const highlights: HighlightInfo[] = chapterAnnotations
      .filter(a => a.selectedText && a.selectedText.length >= 3)
      .map(a => ({ text: a.selectedText, color: a.color, id: a.id }));
    return renderContent(content, chapterTitle, highlights);
  }, [content, chapterTitle, documentId, chapterId, annotations, getAnnotationsForDocument]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const mark = (e.target as HTMLElement).closest('mark[data-annot-id]');
    if (mark && onHighlightClick) {
      e.preventDefault();
      onHighlightClick(mark.getAttribute('data-annot-id')!);
    }
  }, [onHighlightClick]);

  return (
    <div
      className="reading-text"
      onMouseUp={onTextSelect}
      onTouchEnd={onTextSelect}
      onClick={handleClick}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default function BookReaderPage() {
  const { bookId, chapterId } = useParams();
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite, markChapterRead, getBookProgress, getAnnotationsForDocument, t } = useApp();
  const scrollRef = useRef<HTMLDivElement>(null);
  const chapterNavRef = useRef<HTMLElement>(null);
  const hasRedirected = useRef(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const [chapters, setChapters] = useState<BookChapter[]>([]);
  const [discoveringChapters, setDiscoveringChapters] = useState(true);
  const [content, setContent] = useState<string>('');
  const [loadingContent, setLoadingContent] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showAnnotations, setShowAnnotations] = useState(false);
  const [focusAnnotationId, setFocusAnnotationId] = useState<string | null>(null);
  const [mobileChapterOpen, setMobileChapterOpen] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [chaptersReady, setChaptersReady] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const [showCover, setShowCover] = useState(true);
  const [pageTransition, setPageTransition] = useState<'none' | 'next' | 'prev'>('none');
  const [coverOpening, setCoverOpening] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);

  const config = getBookConfig(bookId || '');

  // Show cover only when first entering a book without a specific chapter
  useEffect(() => {
    setShowCover(!chapterId);
  }, [bookId]);

  useEffect(() => {
    if (!config) return;
    setDiscoveringChapters(true);
    setChaptersReady(false);
    setChapters(config.seedChapters);
    discoverChapters(config)
      .then(discovered => setChapters(discovered))
      .finally(() => {
        setDiscoveringChapters(false);
        requestAnimationFrame(() => setChaptersReady(true));
      });
  }, [config?.id]);

  // Auto-navigate to last read chapter if no chapterId in URL
  useEffect(() => {
    if (!config || !chapters.length || chapterId || hasRedirected.current) return;
    const progress = getBookProgress(config.id);
    if (progress?.lastChapterId) {
      const exists = chapters.find(c => c.id === progress.lastChapterId);
      if (exists) {
        hasRedirected.current = true;
        // Don't auto-navigate — show cover first, user can tap to continue
      }
    }
  }, [config?.id, chapters, chapterId, getBookProgress]);

  const currentChapter = chapters.find(c => c.id === chapterId) ?? chapters[0];
  const chapterIndex = chapters.findIndex(c => c.id === currentChapter?.id);
  const prevChapter = chapterIndex > 0 ? chapters[chapterIndex - 1] : null;
  const nextChapter = chapterIndex < chapters.length - 1 ? chapters[chapterIndex + 1] : null;

  // Track current chapter as read
  useEffect(() => {
    if (!config || !currentChapter || !chapters.length || showCover) return;
    markChapterRead(config.id, currentChapter.id, chapters.length);
  }, [config?.id, currentChapter?.id, chapters.length, markChapterRead, showCover]);

  // Scroll active chapter into view in sidebar
  useEffect(() => {
    if (!currentChapter || !chapterNavRef.current) return;
    const activeEl = chapterNavRef.current.querySelector('[data-active="true"]');
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [currentChapter?.id]);

  // Track reading progress within current chapter
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const pct = scrollHeight <= clientHeight ? 0 : Math.min(100, (scrollTop / (scrollHeight - clientHeight)) * 100);
      setReadProgress(pct);
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch content
  useEffect(() => {
    if (!config || !currentChapter || showCover) return;

    const cached = getCachedChapter(config.urlPath, currentChapter.urlSegment);
    if (cached) {
      setContent(cached);
      setFetchError(null);
      return;
    }

    setContent('');
    setFetchError(null);
    setLoadingContent(true);

    fetchChapter(config.urlPath, currentChapter.urlSegment, config.id)
      .then(text => {
        setContent(text);
        setFetchError(null);
      })
      .catch(err => {
        setFetchError(err.message || 'Failed to load chapter.');
      })
      .finally(() => setLoadingContent(false));
  }, [config?.id, currentChapter?.id, showCover]);

  // Navigate with page-turn animation
  const goToChapter = useCallback((chapter: BookChapter, direction: 'next' | 'prev') => {
    if (!config) return;
    setPageTransition(direction);
    setTimeout(() => {
      navigate(`/books/${config.id}/${chapter.id}`);
      setShowCover(false);
      scrollRef.current?.scrollTo({ top: 0 });
      setTimeout(() => setPageTransition('none'), 50);
    }, 350);
  }, [config, navigate]);

  // Mobile swipe navigation
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      const dy = e.changedTouches[0].clientY - touchStartY.current;
      // Only trigger on horizontal swipes (dx > 80px, and more horizontal than vertical)
      if (Math.abs(dx) > 80 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        if (dx < 0 && nextChapter) {
          goToChapter(nextChapter, 'next');
        } else if (dx > 0 && prevChapter) {
          goToChapter(prevChapter, 'prev');
        }
      }
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [nextChapter, prevChapter, goToChapter]);

  const handleTextSelect = useCallback(() => {
    // Small delay to let mobile browsers finalize selection
    setTimeout(() => {
      const sel = window.getSelection();
      if (sel && sel.toString().trim().length > 0) {
        setSelectedText(sel.toString().trim());
        setShowAnnotations(true);
      }
    }, 10);
  }, []);

  // Open cover with page-flip animation
  const handleCoverOpen = () => {
    if (!config || !chapters.length) return;
    const progress = getBookProgress(config.id);
    const targetChapter = progress?.lastChapterId
      ? chapters.find(c => c.id === progress.lastChapterId) || chapters[0]
      : chapters[0];

    // Start the flip animation
    setCoverOpening(true);

    // After animation completes, switch to chapter view
    setTimeout(() => {
      setShowCover(false);
      setCoverOpening(false);
      navigate(`/books/${config.id}/${targetChapter.id}`);
    }, 2200);
  };

  if (!config) return <div className="p-10 text-secondary">Book not found.</div>;

  const fav = isFavorite(config.id);
  const bahaiOrgUrl = `https://www.bahai.org/library/authoritative-texts/${config.urlPath}/`;
  const progress = getBookProgress(config.id);

  const chapterList = (
    <>
      <div className="p-4 border-b border-border flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <Link to="/books" className="text-xs text-secondary no-underline hover:text-heading transition-colors font-body">
            {t.booksAllBooks}
          </Link>
          <h3 className="text-sm font-semibold text-primary m-0 mt-2 leading-snug font-body">{config.title}</h3>
          <p className="text-xs text-gold m-0 mt-1 font-body">{config.author}</p>
          <p className="text-[10px] text-muted m-0 mt-2 font-body">
            {discoveringChapters ? (
              <span className="flex items-center gap-1">
                <Loader2 size={10} className="animate-spin" /> Discovering chapters&hellip;
              </span>
            ) : (
              `${chapters.length} ${chapters.length === 1 ? 'chapter' : 'chapters'}`
            )}
          </p>
        </div>
        <button
          onClick={() => setMobileChapterOpen(false)}
          className="md:hidden icon-btn shrink-0"
        >
          <X size={16} />
        </button>
      </div>
      <nav ref={chapterNavRef} className="p-2 flex-1 overflow-y-auto">
        {/* Cover entry */}
        <button
          onClick={() => { setShowCover(true); setMobileChapterOpen(false); navigate(`/books/${config.id}`); }}
          className={`w-full text-left flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-body transition-all duration-200 border-none cursor-pointer ${
            showCover ? 'bg-accent/[0.08] text-heading font-medium' : 'text-secondary hover:bg-border-inner hover:text-primary'
          }`}
          style={{ background: showCover ? undefined : 'transparent' }}
        >
          <span className="text-[0.65rem] text-gold font-body w-5 shrink-0">&#9733;</span>
          <span className="flex-1 leading-snug">{t.booksCover}</span>
        </button>
        {chapters.map((ch, i) => {
          const isActive = !showCover && ch.id === currentChapter?.id;
          return (
            <Link
              key={ch.id}
              to={`/books/${config.id}/${ch.id}`}
              onClick={() => { setMobileChapterOpen(false); setShowCover(false); }}
              data-active={isActive}
              className={`chapter-item flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm no-underline font-body transition-all duration-200 ${
                isActive
                  ? 'chapter-progress bg-accent/[0.08] text-heading font-medium pl-2.5'
                  : 'text-secondary hover:bg-border-inner hover:text-primary border-l-2 border-transparent pl-2.5'
              }`}
              style={{
                ...(chaptersReady ? { animation: `chapterSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.04}s both` } : { opacity: 0 }),
                ...(isActive ? { '--progress': `${readProgress}%` } as React.CSSProperties : {}),
              }}
            >
              <span className="text-[0.65rem] text-muted font-body w-5 shrink-0">{i + 1}</span>
              <span className="flex-1 leading-snug">{ch.title}</span>
              {/* Annotation dot — shows if chapter has notes, click opens panel */}
              {getAnnotationsForDocument(config.id, ch.id).length > 0 && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowAnnotations(true);
                    setMobileChapterOpen(false);
                    // Navigate to that chapter first if not already on it
                    if (ch.id !== currentChapter?.id) {
                      setShowCover(false);
                      navigate(`/books/${config.id}/${ch.id}`);
                    }
                  }}
                  className="w-4 h-4 rounded-full bg-gold/20 border border-gold/40 shrink-0 flex items-center justify-center cursor-pointer hover:bg-gold/40 transition-colors p-0"
                  title={`${getAnnotationsForDocument(config.id, ch.id).length} ${t.annotNotes.toLowerCase()}`}
                >
                  <span className="text-[0.5rem] text-gold font-bold">{getAnnotationsForDocument(config.id, ch.id).length}</span>
                </button>
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );

  // Page transition classes
  const pageClass = pageTransition === 'next'
    ? 'page-turn-out-next'
    : pageTransition === 'prev'
    ? 'page-turn-out-prev'
    : 'page-turn-in';

  return (
    <div className="flex h-screen relative" style={{ height: '100dvh' }}>
      <ReadingProgress containerRef={scrollRef} />

      {/* Chapter sidebar */}
      {mobileChapterOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setMobileChapterOpen(false)} />
      )}
      <div className={`
        fixed md:static top-0 left-0 h-full w-[280px] max-w-[85vw] md:w-[250px] md:max-w-none bg-card border-r border-border shrink-0 flex flex-col z-40
        transition-transform duration-300 ease-in-out
        md:translate-x-0
        ${mobileChapterOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {chapterList}
      </div>

      {/* Reading pane */}
      <div className="flex-1 overflow-y-auto min-w-0" ref={scrollRef}>
        {/* Toolbar */}
        <div className="reader-toolbar px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <button onClick={() => setMobileChapterOpen(!mobileChapterOpen)} className="icon-btn shrink-0 md:hidden" title="Toggle chapters">
              <List size={16} />
            </button>
            <span className="text-sm text-secondary truncate hidden sm:block font-body">
              {showCover ? config.title : currentChapter?.title}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <a href={bahaiOrgUrl} target="_blank" rel="noopener noreferrer" className="icon-btn">
              <ExternalLink size={16} />
            </a>
            <button onClick={() => toggleFavorite(config.id)} className={`icon-btn ${fav ? 'active' : ''}`}>
              <Star size={16} fill={fav ? 'currentColor' : 'none'} style={fav ? { color: '#C9A84C' } : undefined} />
            </button>
            <button onClick={() => setShowAnnotations(!showAnnotations)} className={`icon-btn ${showAnnotations ? 'active' : ''}`}>
              <MessageSquare size={16} />
            </button>
          </div>
        </div>

        {/* ─── Cover / Book Opening ─── */}
        {showCover && (
          <div className={`flex flex-col items-center justify-center px-4 py-8 sm:py-12 min-h-[70vh] ${coverOpening ? 'book-opening-zoom' : ''}`}>
            {/* Book container with 3D perspective */}
            <div
              className={`book-3d-container relative ${coverOpening ? 'cover-opening' : 'group cursor-pointer'}`}
              onClick={!coverOpening ? handleCoverOpen : undefined}
              style={{ width: 'min(300px, 65vw)', aspectRatio: '2/3' }}
            >
              {/* Back page — visible after all pages flip */}
              <div className="absolute inset-0 rounded-sm" style={{
                background: 'var(--bg-card)',
                border: '2px solid rgba(201,168,76,0.2)',
              }}>
                <div className="absolute" style={{
                  top: '10%', left: '12%', right: '12%', bottom: '12%',
                  background: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 9px, rgba(201,168,76,0.07) 9px, rgba(201,168,76,0.07) 10px)',
                }} />
              </div>

              {/* Flipping pages — hinge on LEFT (spine), flip right-to-left */}
              <div className="cover-flip-page cover-flip-1" />
              <div className="cover-flip-page cover-flip-2" />
              <div className="cover-flip-page cover-flip-3" />
              <div className="cover-flip-page cover-flip-4" />
              <div className="cover-flip-page cover-flip-5" />
              <div className="cover-flip-page cover-flip-6" />
              <div className="cover-flip-page cover-flip-7" />
              <div className="cover-flip-page cover-flip-8" />
              <div className="cover-flip-page cover-flip-9" />
              <div className="cover-flip-page cover-flip-10" />

              {/* Cover image — on top of everything, flips first */}
              <div className={`absolute inset-0 z-20 rounded-sm overflow-hidden ${coverOpening ? 'book-cover-flip' : ''}`}
                style={{
                  transformOrigin: 'left center',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                  backfaceVisibility: 'visible',
                }}>
                {bookCovers[config.id] ? (
                  <img
                    src={bookCovers[config.id]}
                    alt={config.title}
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-6"
                    style={{
                      background: 'linear-gradient(145deg, var(--bg-card), rgba(201,168,76,0.04))',
                      border: '2px solid rgba(201,168,76,0.3)',
                    }}>
                    <p className="text-[0.6rem] tracking-[0.3em] uppercase text-gold/50 font-body m-0 mb-4">{config.author}</p>
                    <h2 className="font-display text-xl sm:text-2xl font-semibold text-heading leading-snug m-0">{config.title}</h2>
                  </div>
                )}
                {/* Hover glow */}
                {!coverOpening && (
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ boxShadow: 'inset 0 0 30px rgba(201,168,76,0.1), 0 0 40px rgba(201,168,76,0.15)' }} />
                )}
              </div>
            </div>

            {!coverOpening && (
              <>
                <button
                  onClick={handleCoverOpen}
                  className="mt-8 px-6 py-3 font-body text-sm font-medium text-gold border border-gold/30 rounded-lg bg-transparent cursor-pointer hover:bg-gold/5 hover:border-gold/50 transition-all duration-300"
                >
                  {progress?.lastChapterId ? t.booksContinueReading : t.booksBeginReading}
                </button>
                <p className="text-[0.65rem] text-muted/40 font-body mt-3">
                  {chapters.length} {chapters.length === 1 ? 'chapter' : 'chapters'}
                  {progress ? ` · ${progress.chaptersRead.length} read` : ''}
                </p>

                {/* Description — visible immediately, truncated, expandable */}
                {config.description && (
                  <div className="mt-5 max-w-sm mx-auto w-full text-center">
                    <p className={`text-xs sm:text-sm text-secondary/70 font-reading leading-relaxed m-0 px-1 transition-all duration-400 ${descExpanded ? '' : 'line-clamp-2'}`}>
                      {config.description}
                    </p>
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDescExpanded(!descExpanded); }}
                      className="inline-flex items-center gap-0.5 mt-1.5 px-2 py-1 text-[0.6rem] text-muted/50 font-body bg-transparent border-none cursor-pointer hover:text-gold transition-colors"
                    >
                      <span>{descExpanded ? 'Less' : 'More'}</span>
                      <ChevronDown size={10} style={{
                        transform: descExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease',
                      }} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ─── Chapter Content ─── */}
        {!showCover && (
          <div className={`max-w-5xl mx-auto px-3 sm:px-6 md:px-8 py-6 md:py-10 ${pageClass}`}>
            <div className="book-page book-page-spine px-4 sm:px-8 md:px-12 lg:px-16 py-6 sm:py-8 md:py-12">
              <h2 className="font-display text-xl sm:text-2xl font-semibold text-heading mb-6">
                {currentChapter?.title}
              </h2>

              {loadingContent && <SkeletonReader />}

              {fetchError && (
                <div className="bg-card border border-gold/30 rounded-xl p-6 text-center">
                  <p className="text-sm text-secondary m-0 mb-4">{fetchError}</p>
                  <div className="flex gap-3 justify-center flex-wrap">
                    <button
                      onClick={() => {
                        setFetchError(null);
                        setLoadingContent(true);
                        fetchChapter(config.urlPath, currentChapter?.urlSegment || '1', config.id)
                          .then(setContent)
                          .catch(e => setFetchError(e.message))
                          .finally(() => setLoadingContent(false));
                      }}
                      className="px-4 py-2 text-sm bg-accent text-white rounded-lg cursor-pointer border-none hover:opacity-90 transition-opacity font-body"
                    >
                      Retry
                    </button>
                    <a
                      href={`${bahaiOrgUrl}${currentChapter?.urlSegment}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 text-sm border border-border text-secondary rounded-lg no-underline hover:border-gold transition-colors font-body"
                    >
                      Open on bahai.org
                    </a>
                  </div>
                </div>
              )}

              {!loadingContent && !fetchError && content && (
                <HighlightedContent
                  content={content}
                  chapterTitle={currentChapter?.title}
                  documentId={config.id}
                  chapterId={currentChapter?.id}
                  onTextSelect={handleTextSelect}
                  onHighlightClick={(id) => {
                    setFocusAnnotationId(id);
                    setShowAnnotations(true);
                  }}
                />
              )}

              {/* Page turn navigation at bottom */}
              {!loadingContent && !fetchError && (
                <div className="flex justify-between items-center mt-12 pt-6 gap-4" style={{ borderTop: '1px solid rgba(201,168,76,0.15)' }}>
                  {prevChapter ? (
                    <button
                      onClick={() => goToChapter(prevChapter, 'prev')}
                      className="flex items-center gap-2 text-sm text-heading bg-transparent border-none cursor-pointer hover:text-gold transition-colors font-body group p-0"
                    >
                      <CornerDownLeft size={16} className="text-gold/50 group-hover:text-gold transition-colors" />
                      <span className="line-clamp-1">{prevChapter.title}</span>
                    </button>
                  ) : <div />}
                  <span className="text-[0.6rem] text-muted/40 font-body shrink-0">
                    {chapterIndex + 1} / {chapters.length}
                  </span>
                  {nextChapter ? (
                    <button
                      onClick={() => goToChapter(nextChapter, 'next')}
                      className="flex items-center gap-2 text-sm text-heading bg-transparent border-none cursor-pointer hover:text-gold transition-colors text-right font-body group p-0"
                    >
                      <span className="line-clamp-1">{nextChapter.title}</span>
                      <CornerDownRight size={16} className="text-gold/50 group-hover:text-gold transition-colors" />
                    </button>
                  ) : <div />}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Annotations */}
      <AnnotationPanel
        documentId={config.id}
        documentType="book"
        chapterId={currentChapter?.id}
        selectedText={selectedText}
        isOpen={showAnnotations}
        onClose={() => { setShowAnnotations(false); setSelectedText(''); setFocusAnnotationId(null); }}
        focusAnnotationId={focusAnnotationId}
        onClearFocus={() => setFocusAnnotationId(null)}
      />
    </div>
  );
}
