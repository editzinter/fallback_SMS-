import React, { useEffect, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Editor } from '../components/Editor';
import { Database } from '../components/Database';
import { SearchModal } from '../components/SearchModal';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkspaceStore } from '../store/useStore';
import { MoreHorizontal, Database as DatabaseIcon, FileText } from 'lucide-react';

export const Workspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { pages, activePageId, setActivePage, addPage, updatePageMeta } = useWorkspaceStore();
  const [mounted, setMounted] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Auto-create a page if workspace is empty
    if (Object.keys(pages).length === 0) {
      const newId = addPage(null, "Getting Started");
      navigate(`/${newId}`);
    }
    // Redirect to active page if accessing root
    else if (!id && activePageId && pages[activePageId]) {
      navigate(`/${activePageId}`);
    }
    // Set active page when URL changes
    else if (id && pages[id]) {
      setActivePage(id);
    }
  }, [id, pages, activePageId, navigate, addPage, mounted, setActivePage]);

  if (!mounted) return null;

  const currentPage = id ? pages[id] : null;

  const togglePageType = () => {
    if (currentPage) {
      updatePageMeta(currentPage.id, { isDatabase: !currentPage.isDatabase });
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-notion-bg dark:bg-notion-bgDark font-sans">
      <Sidebar />
      <SearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} />

      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Top Navigation Bar */}
        <div className="h-[45px] flex items-center justify-between px-3 md:px-4 shrink-0 sticky top-0 left-0 right-0 z-[100] bg-white/80 dark:bg-[#191919]/80 backdrop-blur-sm">
          <div className="flex items-center space-x-2 text-sm text-notion-text dark:text-notion-textDark overflow-hidden opacity-80">
            {currentPage && (
              <div className="flex items-center bg-transparent backdrop-blur-md px-2 py-1 rounded cursor-pointer hover:bg-notion-hover dark:hover:bg-notion-hoverDark transition-colors">
                <span className="truncate max-w-[200px] flex items-center gap-1.5 font-medium">
                  {currentPage.icon || <FileText size={16} />} {currentPage.title || 'Untitled'}
                </span>
              </div>
            )}
          </div>

          {currentPage && (
            <div className="flex items-center space-x-1 bg-transparent backdrop-blur-md rounded px-1">
              <button
                onClick={togglePageType}
                className="px-2 py-1 hover:bg-notion-hover dark:hover:bg-notion-hoverDark rounded text-notion-text dark:text-notion-textDark opacity-70 hover:opacity-100 flex items-center text-sm transition-colors"
                title={currentPage.isDatabase ? "Switch to Document" : "Switch to Database"}
              >
                {currentPage.isDatabase ? <FileText size={16} /> : <DatabaseIcon size={16} />}
              </button>
              <button className="px-2 py-1 hover:bg-notion-hover dark:hover:bg-notion-hoverDark rounded text-notion-text dark:text-notion-textDark opacity-70 hover:opacity-100 transition-colors text-sm">
                Share
              </button>
              <button className="p-1 hover:bg-notion-hover dark:hover:bg-notion-hoverDark rounded text-notion-text dark:text-notion-textDark opacity-70 hover:opacity-100 transition-colors">
                <MoreHorizontal size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {currentPage ? (
            currentPage.isDatabase ? (
              <div className="h-full flex flex-col pt-4 px-12 md:px-24 max-w-[900px] mx-auto w-full">
                <input
                  type="text"
                  value={currentPage.title}
                  onChange={(e) => updatePageMeta(currentPage.id, { title: e.target.value })}
                  placeholder="Untitled Database"
                  className="text-[40px] font-bold bg-transparent border-none outline-none mt-12 mb-4 placeholder-notion-border dark:placeholder-notion-borderDark resize-none w-full text-notion-text dark:text-notion-textDark"
                />
                <Database pageId={currentPage.id} />
              </div>
            ) : (
              <Editor pageId={currentPage.id} />
            )
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              Select or create a page to begin
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
