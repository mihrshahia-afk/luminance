import { useState, useCallback, useRef, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, MessageSquare } from 'lucide-react';
import { prayers } from '../data/prayers';
import { useApp } from '../context/AppContext';
import AnnotationPanel from '../components/AnnotationPanel';
import ReadingProgress from '../components/ReadingProgress';

function applyHighlightsToPrayer(fullText: string, highlights: { text: string; color: string; id: string }[]): string {
  if (!highlights.length) return fullText;

  interface Range { start: number; end: number; color: string; id: string; }
  const ranges: Range[] = [];

  for (const h of highlights) {
    if (h.text.length < 3) continue;
    let searchFrom = 0;
    while (searchFrom < fullText.length) {
      const idx = fullText.indexOf(h.text, searchFrom);
      if (idx === -1) break;
      ranges.push({ start: idx, end: idx + h.text.length, color: h.color, id: h.id });
      searchFrom = idx + h.text.length;
    }
  }

  if (!ranges.length) return fullText;

  ranges.sort((a, b) => a.start - b.start || (b.end - b.start) - (a.end - a.start));

  const final: Range[] = [];
  let lastEnd = -1;
  for (const r of ranges) {
    if (r.start >= lastEnd) { final.push(r); lastEnd = r.end; }
  }

  let result = '';
  let cursor = 0;
  for (const r of final) {
    result += fullText.slice(cursor, r.start);
    result += `<mark class="annot-highlight annot-${r.color}" data-annot-id="${r.id}">`;
    result += fullText.slice(r.start, r.end);
    result += '</mark>';
    cursor = r.end;
  }
  result += fullText.slice(cursor);
  return result;
}

export default function PrayerReaderPage() {
  const { prayerId } = useParams();
  const { toggleFavorite, isFavorite, getAnnotationsForDocument, annotations: allAnnotations, t } = useApp();
  const [showAnnotations, setShowAnnotations] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [focusAnnotationId, setFocusAnnotationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const prayer = prayers.find(p => p.id === prayerId);
  if (!prayer) return <div className="p-10 text-secondary font-body">Prayer not found.</div>;

  const fav = isFavorite(prayer.id);

  const handleTextSelect = useCallback(() => {
    setTimeout(() => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        setSelectedText(selection.toString().trim());
        setShowAnnotations(true);
      }
    }, 10);
  }, []);

  // Highlight the FULL prayer text first, then split into paragraphs
  const highlightedHtml = useMemo(() => {
    const prayerAnnotations = getAnnotationsForDocument(prayer.id);
    const highlights = prayerAnnotations
      .filter(a => a.selectedText && a.selectedText.length >= 3)
      .map(a => ({ text: a.selectedText, color: a.color, id: a.id }));

    // Apply highlights to the full text (so multi-line selections match)
    const highlighted = applyHighlightsToPrayer(prayer.text, highlights);
    // Italicize rubrics (movement instructions); mark first non-rubric para for drop-cap
    let dropCapAssigned = false;
    return highlighted.split('\n').map(line => {
      const plain = line.replace(/<[^>]+>/g, '').trim();
      if (!plain) return `<p>${line}</p>`;
      const isRubric =
        plain.endsWith(':') ||
        (plain === plain.toUpperCase() && /[A-Z]/.test(plain));
      if (isRubric) return `<p class="rubric">${line}</p>`;
      if (!dropCapAssigned) {
        dropCapAssigned = true;
        return `<p class="drop-cap">${line}</p>`;
      }
      return `<p>${line}</p>`;
    }).join('');
  }, [prayer.id, prayer.text, allAnnotations, getAnnotationsForDocument]);

  return (
    <div className="flex h-screen" style={{ height: '100dvh' }}>
      <ReadingProgress containerRef={scrollRef} />
      <div className="flex-1 overflow-y-auto" ref={scrollRef}>
        <div className="max-w-2xl mx-auto px-4 sm:px-8 py-6 sm:py-10 paper-texture">
          <div className="flex items-center justify-between mb-8">
            <Link to="/prayers" className="flex items-center gap-2 text-sm text-secondary no-underline hover:text-heading transition-colors font-body">
              <ArrowLeft size={16} /> {t.prayersAll}
            </Link>
            <div className="flex items-center gap-1">
              <button
                onClick={() => toggleFavorite(prayer.id)}
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

          <span className="inline-block px-3 py-1 rounded-full text-xs bg-accent/[0.08] text-heading font-medium mb-6 font-body">
            {prayer.topic}
          </span>

          <div
            className="reading-text text-lg sm:text-xl !leading-relaxed sm:!leading-loose"
            onMouseUp={handleTextSelect}
            onTouchEnd={handleTextSelect}
            onClick={(e) => {
              const mark = (e.target as HTMLElement).closest('mark[data-annot-id]');
              if (mark) { e.preventDefault(); setFocusAnnotationId(mark.getAttribute('data-annot-id')!); setShowAnnotations(true); }
            }}
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />

          <div className="mt-10 pt-6 border-t border-border text-center">
            <p className="text-sm text-gold m-0 font-reading">&mdash; {prayer.author}</p>
          </div>
        </div>
      </div>

      <AnnotationPanel
        documentId={prayer.id}
        documentType="prayer"
        selectedText={selectedText}
        isOpen={showAnnotations}
        onClose={() => { setShowAnnotations(false); setSelectedText(''); setFocusAnnotationId(null); }}
        focusAnnotationId={focusAnnotationId}
        onClearFocus={() => setFocusAnnotationId(null)}
      />
    </div>
  );
}
