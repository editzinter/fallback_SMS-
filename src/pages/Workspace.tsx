import React, { useEffect, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Editor } from '../components/Editor';
import { Database } from '../components/Database';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkspaceStore } from '../store/useStore';
import { MoreHorizontal, Database as DatabaseIcon, FileText } from 'lucide-react';

export const Workspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { pages, activePageId, setActivePage, addPage, updatePageMeta } = useWorkspaceStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
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
    <div className="flex h-screen overflow-hidden bg-white dark:bg-[#191919] font-sans">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Top Navigation Bar */}
        <div className="h-12 flex items-center justify-between px-3 md:px-4 shrink-0 absolute top-0 left-0 right-0 z-10">
          <div className="flex items-center space-x-2 text-sm text-gray-500 overflow-hidden">
            {currentPage && (
              <div className="flex items-center bg-white/80 dark:bg-[#191919]/80 backdrop-blur-md px-2 py-1 rounded">
                <span className="truncate max-w-[200px]">{currentPage.icon || <FileText size={14} className="inline mr-1" />} {currentPage.title || 'Untitled'}</span>
              </div>
            )}
          </div>

          {currentPage && (
            <div className="flex items-center space-x-2 bg-white/80 dark:bg-[#191919]/80 backdrop-blur-md rounded px-1">
              <button
                onClick={togglePageType}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-sm text-gray-500 flex items-center text-xs"
                title={currentPage.isDatabase ? "Switch to Document" : "Switch to Database"}
              >
                {currentPage.isDatabase ? <FileText size={16} /> : <DatabaseIcon size={16} />}
              </button>
              <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-sm text-gray-500">
                <MoreHorizontal size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {currentPage ? (
            currentPage.isDatabase ? (
              <div className="h-full flex flex-col pt-12 px-6 md:px-12 max-w-[1200px] mx-auto w-full">
                <input
                  type="text"
                  value={currentPage.title}
                  onChange={(e) => updatePageMeta(currentPage.id, { title: e.target.value })}
                  placeholder="Untitled Database"
                  className="text-4xl font-bold bg-transparent border-none outline-none mt-12 mb-4 placeholder-gray-300 dark:placeholder-neutral-700 resize-none w-full text-gray-900 dark:text-white"
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
