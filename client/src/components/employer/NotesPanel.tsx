import React, { useState, useEffect, useRef } from 'react';
import { Save, Check, RefreshCw } from 'lucide-react';

interface NotesPanelProps {
  candidateId: string;
  initialNotes?: string;
  onSave?: (notes: string) => void;
}

export const NotesPanel: React.FC<NotesPanelProps> = ({
  candidateId,
  initialNotes = '',
  onSave,
}) => {
  const [notes, setNotes] = useState(initialNotes);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync state when candidate changes
  useEffect(() => {
    setNotes(initialNotes);
    setSaveStatus('idle');
  }, [candidateId, initialNotes]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNotes(val);
    setSaveStatus('saving');

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      if (onSave) {
        onSave(val);
      }
      setSaveStatus('saved');
      // Reset indicator back to idle after a delay
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    }, 800); // 800ms debounce
  };

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <div className="bg-[#F7FAF8] border border-[#E2ECE5] rounded-2xl p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold text-[#2F4F46]">Internal Candidate Notes</h4>
        <div className="flex items-center gap-1.5 text-xs">
          {saveStatus === 'saving' && (
            <span className="text-[#659287] flex items-center gap-1 animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-emerald-600 flex items-center gap-1 font-semibold">
              <Check className="w-3.5 h-3.5" /> Auto-saved
            </span>
          )}
          {saveStatus === 'idle' && (
            <span className="text-gray-400 flex items-center gap-1">
              <Save className="w-3.5 h-3.5" /> Saved
            </span>
          )}
        </div>
      </div>

      <textarea
        value={notes}
        onChange={handleChange}
        placeholder="Type evaluation notes here... (auto-saved)"
        className="w-full flex-1 min-h-[160px] p-3 text-sm rounded-xl border border-[#E2ECE5] bg-white text-[#2F4F46] placeholder:text-[#4A6A60]/60 focus:ring-2 focus:ring-[#659287]/50 focus:border-[#659287] outline-none resize-none transition-all duration-200"
      />
    </div>
  );
};

export default NotesPanel;
