import { useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, MessageSquare } from 'lucide-react';
import { prayers } from '../data/prayers';
import { useApp } from '../context/AppContext';
import AnnotationPanel from '../components/AnnotationPanel';

export default function PrayerReaderPage() {
  const { prayerId } = useParams();
  const { toggleFavorite, isFavorite } = useApp();
  const [showAnnotations, setShowAnnotations] = useState(false);
  const [selectedText, setSelectedText] = useState('');

  const prayer = prayers.find(p => p.id === prayerId);
  if (!prayer) return <div className="p-10 text-[#6B7280]">Prayer not found.</div>;

  const fav = isFavorite(prayer.id);

  const handleTextSelect = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      setSelectedText(selection.toString().trim());
      setShowAnnotations(true);
    }
  }, []);

  return (
    <div className="flex h-screen">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-8 py-10">
          <div className="flex items-center justify-between mb-8">
            <Link to="/prayers" className="flex items-center gap-2 text-sm text-[#6B7280] no-underline hover:text-[#0B4F6C] transition-colors">
              <ArrowLeft size={16} /> Back to Prayers
            </Link>
            <div className="flex items-center gap-1">
              <button
                onClick={() => toggleFavorite(prayer.id)}
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

          <span className="inline-block px-3 py-1 rounded-full text-xs bg-[#0B4F6C]/8 text-[#0B4F6C] font-medium mb-6">
            {prayer.topic}
          </span>

          <div className="reading-text text-[#2D2D2D]" style={{ fontSize: '1.25rem', lineHeight: 2 }} onMouseUp={handleTextSelect}>
            {prayer.text.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>

          <div className="mt-10 pt-6 border-t border-[#E5DDD0] text-center">
            <p className="text-sm text-[#C9A84C] m-0">— {prayer.author}</p>
          </div>
        </div>
      </div>

      <AnnotationPanel
        documentId={prayer.id}
        documentType="prayer"
        selectedText={selectedText}
        isOpen={showAnnotations}
        onClose={() => { setShowAnnotations(false); setSelectedText(''); }}
      />
    </div>
  );
}
