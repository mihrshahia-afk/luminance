import { useState } from 'react';
import { X, Trash2, MessageSquare } from 'lucide-react';
import { useApp } from '../context/AppContext';

const COLORS = [
  { name: 'gold', class: 'bg-[#C9A84C]/30', value: 'gold' },
  { name: 'teal', class: 'bg-[#0B4F6C]/20', value: 'teal' },
  { name: 'sage', class: 'bg-[#7D9B8A]/30', value: 'sage' },
  { name: 'rose', class: 'bg-[#C87878]/25', value: 'rose' },
  { name: 'lavender', class: 'bg-[#9682BE]/25', value: 'lavender' },
];

interface AnnotationPanelProps {
  documentId: string;
  documentType: 'book' | 'prayer' | 'letter';
  chapterId?: string;
  selectedText?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function AnnotationPanel({
  documentId, documentType, chapterId, selectedText, isOpen, onClose,
}: AnnotationPanelProps) {
  const { addAnnotation, deleteAnnotation, getAnnotationsForDocument } = useApp();
  const [note, setNote] = useState('');
  const [color, setColor] = useState('gold');

  const annotations = getAnnotationsForDocument(documentId, chapterId);

  const handleSave = () => {
    if (!note.trim() && !selectedText) return;
    addAnnotation({
      documentId,
      documentType,
      chapterId,
      selectedText: selectedText || '',
      note: note.trim(),
      color,
    });
    setNote('');
  };

  if (!isOpen) return null;

  return (
    <div className="w-[340px] bg-white border-l border-[#E5DDD0] h-full overflow-y-auto shrink-0">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5DDD0] bg-[#F8F5EE]">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-[#0B4F6C]" />
          <h3 className="text-sm font-semibold text-[#2D2D2D] m-0">Notes</h3>
        </div>
        <button onClick={onClose} className="text-[#6B7280] hover:text-[#2D2D2D] bg-transparent border-none cursor-pointer p-1">
          <X size={16} />
        </button>
      </div>

      {/* New annotation */}
      <div className="p-4 border-b border-[#E5DDD0]">
        {selectedText && (
          <div className="mb-3 p-2.5 bg-[#F8F5EE] rounded-lg border-l-3 border-[#C9A84C]">
            <p className="text-xs text-[#6B7280] mb-1 m-0">Selected text:</p>
            <p className="text-sm text-[#2D2D2D] m-0 italic leading-relaxed">"{selectedText}"</p>
          </div>
        )}

        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Write your thoughts..."
          className="w-full p-3 border border-[#E5DDD0] rounded-lg text-sm resize-none focus:outline-none focus:border-[#C9A84C] bg-white text-[#2D2D2D] placeholder-[#9CA3AF]"
          rows={3}
        />

        <div className="flex items-center justify-between mt-3">
          <div className="flex gap-2">
            {COLORS.map(c => (
              <button
                key={c.value}
                onClick={() => setColor(c.value)}
                className={`w-6 h-6 rounded-full border-2 cursor-pointer ${c.class} ${
                  color === c.value ? 'border-[#2D2D2D]' : 'border-transparent'
                }`}
              />
            ))}
          </div>
          <button
            onClick={handleSave}
            disabled={!note.trim() && !selectedText}
            className="px-3 py-1.5 bg-[#0B4F6C] text-white text-xs font-medium rounded-lg border-none cursor-pointer hover:bg-[#083D54] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Save
          </button>
        </div>
      </div>

      {/* Existing annotations */}
      <div className="p-4">
        <p className="text-xs text-[#6B7280] mb-3 m-0 font-medium uppercase tracking-wider">
          {annotations.length} note{annotations.length !== 1 ? 's' : ''}
        </p>
        <div className="flex flex-col gap-3">
          {annotations.map(a => (
            <div key={a.id} className={`p-3 rounded-lg border border-[#E5DDD0] highlight-${a.color}`}>
              {a.selectedText && (
                <p className="text-xs text-[#6B7280] italic mb-1.5 m-0">"{a.selectedText}"</p>
              )}
              <p className="text-sm text-[#2D2D2D] m-0 leading-relaxed">{a.note}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-[#9CA3AF]">
                  {new Date(a.createdAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => deleteAnnotation(a.id)}
                  className="text-[#9CA3AF] hover:text-red-500 bg-transparent border-none cursor-pointer p-0.5 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
