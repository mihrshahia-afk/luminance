import { useState, useCallback, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, MessageSquare, List, Star, Loader2, ExternalLink, X } from 'lucide-react';
import { getBookConfig } from '../data/bookConfig';
import type { BookChapter } from '../data/bookConfig';
import { discoverChapters, fetchChapter, getCachedChapter, isChapterCached } from '../data/bookFetcher';
import { useApp } from '../context/AppContext';
import AnnotationPanel from '../components/AnnotationPanel';

function renderContent(text: string): string {
  return text
    .split('\n\n')
    .map(para => {
      if (para.startsWith('**') && para.endsWith('**')) {
        return `<h3 style="font-family:'Crimson Pro',serif;font-size:1.2rem;font-weight:600;color:#0B4F6C;margin:1.5rem 0 0.5rem">${para.slice(2, -2)}</h3>`;
      }
      return `<p>${para}</p>`;
    })
    .join('');
}

export default function BookReaderPage() {
  const { bookId, chapterId } = useParams();
  const { toggleFavorite, isFavorite } = useApp();

  const [chapters, setChapters] = useState<BookChapter[]>([]);
  const [discoveringChapters, setDiscoveringChapters] = useState(true);
  const [content, setContent] = useState<string>('');
  const [loadingContent, setLoadingContent] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showAnnotations, setShowAnnotations] = useState(false);
  const [showChapterList, setShowChapterList] = useState(false);
  const [selectedText, setSelectedText] = useState('');

  const config = getBookConfig(bookId || '');

  useEffect(() => {
    if (!config) return;
    setDiscoveringChapters(true);
    setChapters(config.seedChapters);
    discoverChapters(config)
      .then(discovered => setChapters(discovered))
      .finally(() => setDiscoveringChapters(false));
  }, [config?.id]);

  const currentChapter = chapters.find(c => c.id === chapterId) ?? chapters[0];
  const chapterIndex = chapters.findIndex(c => c.id === currentChapter?.id);
  const prevChapter = chapterIndex > 0 ? chapters[chapterIndex - 1] : null;
  const nextChapter = chapterIndex < chapters.length - 1 ? chapters[chapterIndex + 1] : null;

  useEffect(() => {
    if (!config || !currentChapter) return;

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
  }, [config?.id, currentChapter?.id]);

  const handleTextSelect = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.toString().trim().length > 0) {
      setSelectedText(sel.toString().trim());
      setShowAnnotations(true);
    }
  }, []);

  if (!config) return <div className="p-10 text-[#6B7280]">Book not found.</div>;

  const fav = isFavorite(config.id);
  const bahaiOrgUrl = `https://www.bahai.org/library/authoritative-texts/${config.urlPath}/`;

  return (
    <div className="flex h-screen relative">
      {/* Chapter sidebar — desktop: fixed left panel, mobile: overlay */}
      {showChapterList && (
        <>
          {/* Mobile backdrop */}
          <div
            className="fixed inset-0 bg-black/40 z-30 md:hidden"
            onClick={() => setShowChapterList(false)}
          />
          <div className="fixed md:static top-0 left-0 h-full w-[280px] md:w-[240px] bg-white border-r border-[#E5DDD0] overflow-y-auto shrink-0 flex flex-col z-40">
            <div className="p-4 border-b border-[#E5DDD0] flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <Link to="/books" className="text-xs text-[#6B7280] no-underline hover:text-[#0B4F6C] transition-colors">
                  ← All Books
                </Link>
                <h3 className="text-sm font-semibold text-[#2D2D2D] m-0 mt-2 leading-snug">{config.title}</h3>
                <p className="text-xs text-[#C9A84C] m-0 mt-1">{config.author}</p>
                {discoveringChapters && (
                  <p className="text-[10px] text-[#9CA3AF] m-0 mt-2 flex items-center gap-1">
                    <Loader2 size={10} className="animate-spin" /> Loading chapters…
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowChapterList(false)}
                className="md:hidden p-1.5 rounded text-[#9CA3AF] hover:text-[#6B7280] bg-transparent border-none cursor-pointer shrink-0"
              >
                <X size={16} />
              </button>
            </div>
            <nav className="p-2 flex-1">
              {chapters.map(ch => (
                <Link
                  key={ch.id}
                  to={`/books/${config.id}/${ch.id}`}
                  onClick={() => setShowChapterList(false)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm no-underline transition-colors ${
                    ch.id === currentChapter?.id
                      ? 'bg-[#0B4F6C]/8 text-[#0B4F6C] font-medium'
                      : 'text-[#6B7280] hover:bg-[#F8F5EE]'
                  }`}
                >
                  <span className="flex-1">{ch.title}</span>
                  {isChapterCached(config.urlPath, ch.urlSegment) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]/40 shrink-0" />
                  )}
                </Link>
              ))}
            </nav>
          </div>
        </>
      )}

      {/* Reading pane */}
      <div className="flex-1 overflow-y-auto min-w-0">
        {/* Toolbar */}
        <div className="sticky top-0 bg-[#FAF7F0]/95 backdrop-blur-sm border-b border-[#E5DDD0] px-4 md:px-6 py-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setShowChapterList(!showChapterList)}
              className="p-2 rounded-lg hover:bg-[#E5DDD0]/50 bg-transparent border-none cursor-pointer text-[#6B7280] transition-colors shrink-0"
              title="Toggle chapters"
            >
              <List size={16} />
            </button>
            <span className="text-sm text-[#6B7280] truncate hidden sm:block">{currentChapter?.title}</span>
          </div>
          <div className="flex items-center gap-1">
            <a
              href={bahaiOrgUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-[#E5DDD0]/50 text-[#6B7280] hover:text-[#0B4F6C] transition-colors"
            >
              <ExternalLink size={16} />
            </a>
            <button
              onClick={() => toggleFavorite(config.id)}
              className={`p-2 rounded-lg hover:bg-[#E5DDD0]/50 bg-transparent border-none cursor-pointer transition-colors ${
                fav ? 'text-[#C9A84C]' : 'text-[#6B7280]'
              }`}
            >
              <Star size={16} fill={fav ? '#C9A84C' : 'none'} />
            </button>
            <button
              onClick={() => setShowAnnotations(!showAnnotations)}
              className={`p-2 rounded-lg hover:bg-[#E5DDD0]/50 bg-transparent border-none cursor-pointer transition-colors ${
                showAnnotations ? 'text-[#0B4F6C]' : 'text-[#6B7280]'
              }`}
            >
              <MessageSquare size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8 md:py-10">
          <h2 className="text-xl sm:text-2xl font-semibold text-[#0B4F6C] mb-6" style={{ fontFamily: 'Crimson Pro, serif' }}>
            {currentChapter?.title}
          </h2>

          {loadingContent && (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-[#6B7280]">
              <Loader2 size={28} className="animate-spin text-[#C9A84C]" />
              <p className="text-sm m-0">Fetching from the Bahá'í Reference Library…</p>
            </div>
          )}

          {fetchError && (
            <div className="bg-[#FDF6EC] border border-[#C9A84C]/30 rounded-xl p-6 text-center">
              <p className="text-sm text-[#6B7280] m-0 mb-4">{fetchError}</p>
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
                  className="px-4 py-2 text-sm bg-[#0B4F6C] text-white rounded-lg cursor-pointer border-none hover:bg-[#083D54] transition-colors"
                >
                  Retry
                </button>
                <a
                  href={`${bahaiOrgUrl}${currentChapter?.urlSegment}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-sm border border-[#E5DDD0] text-[#6B7280] rounded-lg no-underline hover:border-[#C9A84C] transition-colors"
                >
                  Open on bahai.org
                </a>
              </div>
            </div>
          )}

          {!loadingContent && !fetchError && content && (
            <div
              className="reading-text text-[#2D2D2D]"
              onMouseUp={handleTextSelect}
              dangerouslySetInnerHTML={{ __html: renderContent(content) }}
            />
          )}

          {/* Navigation */}
          {!loadingContent && !fetchError && (
            <div className="flex justify-between mt-12 pt-6 border-t border-[#E5DDD0] gap-4">
              {prevChapter ? (
                <Link
                  to={`/books/${config.id}/${prevChapter.id}`}
                  className="flex items-center gap-2 text-sm text-[#0B4F6C] no-underline hover:text-[#C9A84C] transition-colors"
                >
                  <ChevronLeft size={16} />
                  <span className="line-clamp-1">{prevChapter.title}</span>
                </Link>
              ) : <div />}
              {nextChapter ? (
                <Link
                  to={`/books/${config.id}/${nextChapter.id}`}
                  className="flex items-center gap-2 text-sm text-[#0B4F6C] no-underline hover:text-[#C9A84C] transition-colors text-right"
                >
                  <span className="line-clamp-1">{nextChapter.title}</span>
                  <ChevronRight size={16} />
                </Link>
              ) : <div />}
            </div>
          )}
        </div>
      </div>

      {/* Annotations */}
      <AnnotationPanel
        documentId={config.id}
        documentType="book"
        chapterId={currentChapter?.id}
        selectedText={selectedText}
        isOpen={showAnnotations}
        onClose={() => { setShowAnnotations(false); setSelectedText(''); }}
      />
    </div>
  );
}
