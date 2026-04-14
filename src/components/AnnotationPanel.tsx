import { useState } from 'react';
import { X, Trash2, MessageSquare, Pencil, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

const COLORS = [
  { name: 'gold', bg: '#D4B44C', value: 'gold' },
  { name: 'teal', bg: '#2898C8', value: 'teal' },
  { name: 'sage', bg: '#5CB888', value: 'sage' },
  { name: 'rose', bg: '#D87070', value: 'rose' },
  { name: 'lavender', bg: '#9878C8', value: 'lavender' },
];

interface AnnotationPanelProps {
  documentId: string;
  documentType: 'book' | 'prayer' | 'letter';
  chapterId?: string;
  selectedText?: string;
  isOpen: boolean;
  onClose: () => void;
  focusAnnotationId?: string | null;
  onClearFocus?: () => void;
}

export default function AnnotationPanel({
  documentId, documentType, chapterId, selectedText, isOpen, onClose,
  focusAnnotationId, onClearFocus,
}: AnnotationPanelProps) {
  const { addAnnotation, deleteAnnotation, updateAnnotation, getAnnotationsForDocument, t } = useApp();
  const [note, setNote] = useState('');
  const [color, setColor] = useState('gold');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const allAnnotations = getAnnotationsForDocument(documentId, chapterId);
  const annotations = focusAnnotationId
    ? allAnnotations.filter(a => a.id === focusAnnotationId)
    : allAnnotations;

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

  const startEdit = (id: string, currentNote: string) => {
    setEditingId(id);
    setEditText(currentNote);
  };

  const saveEdit = (id: string) => {
    updateAnnotation(id, editText.trim());
    setEditingId(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={onClose} />

      {/* Panel */}
      <div className={`
        fixed inset-x-0 bottom-0 max-h-[75vh] rounded-t-2xl z-50
        md:static md:inset-auto md:max-h-none md:rounded-none md:z-auto
        md:w-[340px] md:h-full md:shrink-0
        bg-card border-t md:border-t-0 md:border-l border-border overflow-y-auto
        animate-[slideUp_0.3s_ease-out]
        md:animate-none
      `}>
        {/* Mobile drag handle */}
        <div className="md:hidden flex justify-center py-2">
          <div className="w-10 h-1 rounded-full bg-muted/40" />
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-border-inner/50">
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-heading" />
            <h3 className="text-sm font-semibold text-primary m-0 font-body">{t.annotNotes}</h3>
          </div>
          <button onClick={onClose} className="icon-btn">
            <X size={16} />
          </button>
        </div>

        {/* New annotation */}
        <div className="p-4 border-b border-border">
          {selectedText && (
            <div className="mb-3 p-2.5 bg-border-inner/50 rounded-lg border-l-[3px] border-gold">
              <p className="text-xs text-secondary mb-1 m-0 font-body">{t.annotSelectedText}</p>
              <p className="text-sm text-primary m-0 italic leading-relaxed font-reading">&ldquo;{selectedText}&rdquo;</p>
            </div>
          )}

          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder={t.annotPlaceholder}
            className="w-full p-3 border border-border rounded-lg text-sm resize-none focus:outline-none focus:border-gold bg-input-bg font-body"
            rows={3}
          />

          <div className="flex items-center justify-between mt-3">
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  className={`w-7 h-7 md:w-6 md:h-6 rounded-full border-2 cursor-pointer transition-transform duration-150 ${
                    color === c.value ? 'border-white scale-110' : 'border-transparent'
                  }`}
                  style={{ background: c.bg }}
                />
              ))}
            </div>
            <button
              onClick={handleSave}
              disabled={!note.trim() && !selectedText}
              className="px-3 py-1.5 bg-accent text-white text-xs font-medium rounded-lg border-none cursor-pointer hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity font-body"
            >
              {t.annotSave}
            </button>
          </div>
        </div>

        {/* Existing annotations */}
        <div className="p-4">
          {focusAnnotationId && onClearFocus && (
            <button
              onClick={onClearFocus}
              className="w-full mb-3 px-3 py-2 text-xs font-body font-medium text-gold bg-transparent border border-gold/25 rounded-lg cursor-pointer hover:bg-gold/5 transition-colors"
            >
              &larr; Show all {allAnnotations.length} notes
            </button>
          )}
          <p className="text-xs text-secondary mb-3 m-0 font-medium uppercase tracking-wider font-body">
            {focusAnnotationId ? '1' : annotations.length} {annotations.length !== 1 ? t.annotNotes.toLowerCase() : t.annotNotes.toLowerCase().replace(/s$/, '')}
          </p>
          <div className="flex flex-col gap-3">
            {annotations.map(a => (
              <div key={a.id} className={`p-3 rounded-lg border border-border highlight-${a.color}`}>
                {a.selectedText && (
                  <p className="text-xs text-secondary italic mb-1.5 m-0 font-reading">&ldquo;{a.selectedText}&rdquo;</p>
                )}

                {editingId === a.id ? (
                  /* Editing mode */
                  <div>
                    <textarea
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      className="w-full p-2 border border-gold/40 rounded-lg text-sm resize-none focus:outline-none focus:border-gold bg-input-bg font-body"
                      rows={3}
                      autoFocus
                    />
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => saveEdit(a.id)}
                        className="flex items-center gap-1 px-2.5 py-1 bg-accent text-white text-xs font-medium rounded-md border-none cursor-pointer hover:opacity-90 transition-opacity font-body"
                      >
                        <Check size={12} /> {t.annotSave}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-2.5 py-1 text-xs text-muted bg-transparent border border-border rounded-md cursor-pointer hover:text-primary transition-colors font-body"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Display mode */
                  <>
                    <p className="text-sm text-primary m-0 leading-relaxed font-body">{a.note}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted font-body">
                        {new Date(a.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEdit(a.id, a.note)}
                          className="text-muted hover:text-gold bg-transparent border-none cursor-pointer p-0.5 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => deleteAnnotation(a.id)}
                          className="text-muted hover:text-red-500 bg-transparent border-none cursor-pointer p-0.5 transition-colors"
                          title={t.annotDelete}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
