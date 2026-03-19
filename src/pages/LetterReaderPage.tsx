import { useState, useCallback, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, MessageSquare, Loader2, RefreshCw } from 'lucide-react';
import { letterIndex } from '../data/letterIndex';
import { fetchLetterContent } from '../data/letterFetcher';
import { useApp } from '../context/AppContext';
import AnnotationPanel from '../components/AnnotationPanel';

export default function LetterReaderPage() {
  const { letterId } = useParams(); // This is now the urlCode
  const { toggleFavorite, isFavorite } = useApp();
  const [showAnnotations, setShowAnnotations] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  if (!letter) return <div className="p-10 text-[#6B7280]">Letter not found.</div>;

  const fav = isFavorite(letter.id);

  const formatDate = (date: string) => {
    return new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  const handleTextSelect = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      setSelectedText(selection.toString().trim());
      setShowAnnotations(true);
    }
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

  return (
    <div className="flex h-screen">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-8 py-10">
          <div className="flex items-center justify-between mb-8">
            <Link to="/letters" className="flex items-center gap-2 text-sm text-[#6B7280] no-underline hover:text-[#0B4F6C] transition-colors">
              <ArrowLeft size={16} /> Back to Letters
            </Link>
            <div className="flex items-center gap-1">
              <button
                onClick={() => toggleFavorite(letter.id)}
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

          {/* Header */}
          <div className="mb-8 pb-6 border-b border-[#E5DDD0]">
            <h1 className="text-2xl font-semibold text-[#0B4F6C] m-0 mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
              {letter.title}
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-[#C9A84C]">{formatDate(letter.date)}</span>
              <span className="text-sm text-[#6B7280]">{letter.recipient}</span>
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 size={32} className="text-[#C9A84C] animate-spin mb-4" />
              <p className="text-sm text-[#6B7280]">Fetching from Bahá'í Reference Library...</p>
            </div>
          )}

          {/* Error state */}
          {error && !loading && (
            <div className="text-center py-16">
              <p className="text-[#6B7280] mb-4">{error}</p>
              <button
                onClick={handleRetry}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B4F6C] text-white text-sm rounded-lg border-none cursor-pointer hover:bg-[#083D54] transition-colors"
              >
                <RefreshCw size={14} /> Try Again
              </button>
              <p className="text-xs text-[#9CA3AF] mt-4">
                You can also read this letter directly at{' '}
                <a
                  href={`https://www.bahai.org/library/authoritative-texts/the-universal-house-of-justice/messages/${letter.urlCode}/1`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0B4F6C] underline"
                >
                  bahai.org
                </a>
              </p>
            </div>
          )}

          {/* Content */}
          {content && !loading && (
            <div
              className="reading-text text-[#2D2D2D]"
              onMouseUp={handleTextSelect}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}
        </div>
      </div>

      <AnnotationPanel
        documentId={letter.id}
        documentType="letter"
        selectedText={selectedText}
        isOpen={showAnnotations}
        onClose={() => { setShowAnnotations(false); setSelectedText(''); }}
      />
    </div>
  );
}
