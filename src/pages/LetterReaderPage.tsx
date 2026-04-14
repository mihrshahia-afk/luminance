import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, MessageSquare, RefreshCw } from 'lucide-react';
import { letterIndex } from '../data/letterIndex';
import { fetchLetterContent } from '../data/letterFetcher';
import { useApp } from '../context/AppContext';
import AnnotationPanel from '../components/AnnotationPanel';
import ReadingProgress from '../components/ReadingProgress';
import { SkeletonReader } from '../components/Skeleton';

function addParagraphNumbers(html: string): string {
  // Split into paragraphs to analyze content
  const parts = html.split(/(<p[\s>])/g);
  let paraNum = 0;
  let foundContentStart = false;

  // Greeting patterns that indicate the salutation (not a numbered paragraph)
  const greetingPatterns = [
    /^dear\s/i,
    /^dearly\s/i,
    /^to\s+the\s/i,
    /^the\s+universal/i,
    /^beloved\s/i,
    /^in\s+the\s+name/i,
    /^\d{1,2}\s+(january|february|march|april|may|june|july|august|september|october|november|december)/i,
    /^(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d/i,
    /^rid\u0327v[aá]n/i,
    /^naw-r[uú]z/i,
    /^\s*$/,
  ];

  return parts.map((part, i) => {
    if (!part.match(/^<p[\s>]/)) return part;

    // Get the text content of this paragraph (look ahead in parts)
    const nextParts = parts.slice(i + 1);
    const closingIdx = nextParts.findIndex(p => p.includes('</p>'));
    const innerContent = nextParts.slice(0, closingIdx >= 0 ? closingIdx + 1 : 1).join('');
    const textContent = innerContent.replace(/<[^>]*>/g, '').trim();

    // Skip empty paragraphs
    if (!textContent || textContent.length < 3) {
      return part.replace(/^<p/, '<p data-para=""');
    }

    // Check if this is still part of the greeting/salutation
    if (!foundContentStart) {
      const isGreeting = greetingPatterns.some(p => p.test(textContent));
      // Also skip very short lines (likely date or signature parts at the start)
      const isShortHeader = textContent.length < 60 && !textContent.includes('.');

      if (isGreeting || isShortHeader) {
        return part.replace(/^<p/, '<p data-para=""');
      }
      // First real content paragraph found
      foundContentStart = true;
    }

    paraNum++;
    return part.replace(/^<p/, `<p data-para="${paraNum}"`);
  }).join('');
}

function applyHighlightsToHtml(html: string, highlights: { text: string; color: string; id: string }[]): string {
  if (!highlights.length || !html) return html;

  let result = html;
  const placeholders: { ph: string; replacement: string }[] = [];
  const sorted = [...highlights].sort((a, b) => b.text.length - a.text.length);

  for (const h of sorted) {
    if (h.text.length < 3) continue;
    const searchText = h.text;

    // Try direct match
    let idx = result.indexOf(searchText);
    if (idx !== -1) {
      const ph = `\x00PH${placeholders.length}\x00`;
      placeholders.push({ ph, replacement: `<mark class="annot-highlight annot-${h.color}" data-annot-id="${h.id}">${searchText}</mark>` });
      result = result.slice(0, idx) + ph + result.slice(idx + searchText.length);
      continue;
    }

    // Try without newlines
    const noNL = searchText.replace(/\n/g, '');
    if (noNL !== searchText) {
      idx = result.indexOf(noNL);
      if (idx !== -1) {
        const ph = `\x00PH${placeholders.length}\x00`;
        placeholders.push({ ph, replacement: `<mark class="annot-highlight annot-${h.color}" data-annot-id="${h.id}">${noNL}</mark>` });
        result = result.slice(0, idx) + ph + result.slice(idx + noNL.length);
        continue;
      }
    }

    // Try flexible regex for cross-paragraph selections
    const chunks = searchText.split(/\n+/).map(c => c.trim()).filter(Boolean);
    if (chunks.length > 1) {
      const escaped = chunks.map(c => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      const match = new RegExp(escaped.join('[\\s\\S]{0,50}')).exec(result);
      if (match) {
        const ph = `\x00PH${placeholders.length}\x00`;
        placeholders.push({ ph, replacement: `<mark class="annot-highlight annot-${h.color}" data-annot-id="${h.id}">${match[0]}</mark>` });
        result = result.slice(0, match.index) + ph + result.slice(match.index + match[0].length);
      }
    }
  }

  for (const { ph, replacement } of placeholders) {
    result = result.replace(ph, replacement);
  }
  return result;
}

export default function LetterReaderPage() {
  const { letterId } = useParams();
  const { toggleFavorite, isFavorite, getAnnotationsForDocument, annotations: allAnnotations, t } = useApp();
  const [showAnnotations, setShowAnnotations] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [focusAnnotationId, setFocusAnnotationId] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const letter = letterIndex.find(l => l.urlCode === letterId);

  useEffect(() => {
    if (!letter) return;

    const loadContent = async () => {
      setLoading(true);
      setError('');
      try {
        const html = await fetchLetterContent(letter.urlCode);
        setContent(html);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load letter');
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [letter?.urlCode]);

  if (!letter) return <div className="p-10 text-secondary font-body">Letter not found.</div>;

  const fav = isFavorite(letter.id);

  const formatDate = (date: string) => {
    return new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  const handleTextSelect = useCallback(() => {
    setTimeout(() => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        setSelectedText(selection.toString().trim());
        setShowAnnotations(true);
      }
    }, 10);
  }, []);

  const handleRetry = async () => {
    setLoading(true);
    setError('');
    try {
      const html = await fetchLetterContent(letter.urlCode);
      setContent(html);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load letter');
    } finally {
      setLoading(false);
    }
  };

  // Get highlights — useMemo with allAnnotations as dep to re-render on change
  const highlightedContent = useMemo(() => {
    if (!content) return '';
    const letterAnnotations = getAnnotationsForDocument(letter.id);
    const highlights = letterAnnotations
      .filter(a => a.selectedText && a.selectedText.length >= 3)
      .map(a => ({ text: a.selectedText, color: a.color, id: a.id }));
    return applyHighlightsToHtml(content, highlights);
  }, [content, letter.id, allAnnotations, getAnnotationsForDocument]);

  return (
    <div className="flex h-screen" style={{ height: '100dvh' }}>
      <ReadingProgress containerRef={scrollRef} />
      <div className="flex-1 overflow-y-auto" ref={scrollRef}>
        <div className="max-w-2xl mx-auto px-4 sm:px-8 py-6 sm:py-10 paper-texture">
          <div className="flex items-center justify-between mb-8">
            <Link to="/letters" className="flex items-center gap-2 text-sm text-secondary no-underline hover:text-heading transition-colors font-body">
              <ArrowLeft size={16} /> {t.navLetters}
            </Link>
            <div className="flex items-center gap-1">
              <button
                onClick={() => toggleFavorite(letter.id)}
                className={`icon-btn ${fav ? 'active' : ''}`}
                style={fav ? { color: '#C9A84C' } : undefined}
              >
                <Star size={16} fill={fav ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={() => setShowAnnotations(!showAnnotations)}
                className={`icon-btn ${showAnnotations ? 'active' : ''}`}
              >
                <MessageSquare size={16} />
              </button>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8 pb-6 border-b border-border">
            <h1 className="font-display text-2xl font-semibold text-heading m-0 mb-2">
              {letter.title}
            </h1>
            <div className="flex items-center gap-4 font-body">
              <span className="text-sm text-gold">{formatDate(letter.date)}</span>
              <span className="text-sm text-secondary">{letter.recipient}</span>
            </div>
          </div>

          {/* Loading state */}
          {loading && <SkeletonReader />}

          {/* Error state */}
          {error && !loading && (
            <div className="text-center py-16">
              <p className="text-secondary mb-4 font-body">{error}</p>
              <button
                onClick={handleRetry}
                className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white text-sm rounded-lg border-none cursor-pointer hover:opacity-90 transition-opacity font-body"
              >
                <RefreshCw size={14} /> {t.commonRetry}
              </button>
              <p className="text-xs text-muted mt-4 font-body">
                You can also read this letter directly at{' '}
                <a
                  href={`https://www.bahai.org/library/authoritative-texts/the-universal-house-of-justice/messages/${letter.urlCode}/1`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-heading underline"
                >
                  bahai.org
                </a>
              </p>
            </div>
          )}

          {/* Content with paragraph numbers */}
          {highlightedContent && !loading && (
            <div
              className="reading-text letter-numbered"
              onMouseUp={handleTextSelect}
              onTouchEnd={handleTextSelect}
              onClick={(e) => {
                const mark = (e.target as HTMLElement).closest('mark[data-annot-id]');
                if (mark) { e.preventDefault(); setFocusAnnotationId(mark.getAttribute('data-annot-id')!); setShowAnnotations(true); }
              }}
              dangerouslySetInnerHTML={{
                __html: addParagraphNumbers(highlightedContent)
              }}
            />
          )}
        </div>
      </div>

      <AnnotationPanel
        documentId={letter.id}
        documentType="letter"
        selectedText={selectedText}
        isOpen={showAnnotations}
        onClose={() => { setShowAnnotations(false); setSelectedText(''); setFocusAnnotationId(null); }}
        focusAnnotationId={focusAnnotationId}
        onClearFocus={() => setFocusAnnotationId(null)}
      />
    </div>
  );
}
