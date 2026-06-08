import React, { useEffect, useState, useRef } from 'react';
import { Search, FileText } from 'lucide-react';
import { useWorkspaceStore, useContentStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const { pages } = useWorkspaceStore();
  const { pageContents } = useContentStore();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const results = Object.values(pages)
    .filter((p) => !p.isDeleted)
    .filter((p) => {
      if (!query) return false;
      const lowerQuery = query.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(lowerQuery);

      const contentBlocks = pageContents[p.id] || [];
      const contentText = JSON.stringify(contentBlocks).toLowerCase();
      const matchContent = contentText.includes(lowerQuery);

      return matchTitle || matchContent;
    });

  const handleSelect = (id: string) => {
    navigate(`/${id}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[200] flex items-start justify-center pt-[10vh] px-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-[#202020] w-full max-w-2xl rounded-xl shadow-2xl border dark:border-neutral-800 flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center p-3 border-b dark:border-neutral-800">
          <Search size={20} className="text-gray-400 mr-3 ml-2" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search pages and content..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-grow bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400"
          />
          <div className="text-xs text-gray-400 border dark:border-neutral-700 px-1.5 py-0.5 rounded ml-2">ESC</div>
        </div>

        {query && (
          <div className="max-h-[50vh] overflow-y-auto p-2">
            {results.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">No results found for "{query}"</div>
            ) : (
              results.map(p => (
                <div
                  key={p.id}
                  onClick={() => handleSelect(p.id)}
                  className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg cursor-pointer group"
                >
                  <span className="mr-3 text-2xl">{p.icon || <FileText size={20} className="text-gray-400" />}</span>
                  <div className="flex-grow min-w-0">
                    <div className="text-sm font-medium dark:text-gray-200 truncate">{p.title || 'Untitled'}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
