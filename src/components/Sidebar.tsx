import React, { useState, useMemo, useEffect } from 'react';
import { ChevronRight, ChevronDown, Plus, FileText, Trash2, Settings, Search, Menu, Moon, Sun, Monitor } from 'lucide-react';
import { useWorkspaceStore, useThemeStore } from '../store/useStore';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '../lib/utils';
import { PageMeta } from '../types';

interface PageItemProps {
  page: PageMeta;
  level?: number;
}

const PageItem: React.FC<PageItemProps> = ({ page, level = 0 }) => {
  const { pages, addPage, deletePage } = useWorkspaceStore();
  const navigate = useNavigate();
  const { id: activeId } = useParams();

  const [expanded, setExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const childPages = useMemo(() => {
    return Object.values(pages)
      .filter((p) => p.parentId === page.id && !p.isDeleted)
      .sort((a, b) => a.createdAt - b.createdAt);
  }, [pages, page.id]);

  const hasChildren = childPages.length > 0;
  const isActive = activeId === page.id;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  const handleNavigate = () => {
    navigate(`/${page.id}`);
  };

  const handleAddChild = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(true);
    const newId = addPage(page.id);
    navigate(`/${newId}`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deletePage(page.id);
    if (isActive) {
      navigate('/');
    }
  };

  return (
    <div>
      <div
        className={cn(
          "group flex items-center py-1 px-2 hover:bg-notion-hover dark:hover:bg-notion-hoverDark cursor-pointer text-sm text-notion-gray dark:text-notion-grayDark rounded-sm mx-2",
          isActive && "bg-notion-hover dark:bg-notion-hoverDark text-black dark:text-white font-medium"
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleNavigate}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className="w-5 h-5 flex items-center justify-center hover:bg-notion-hover dark:hover:bg-notion-hoverDark rounded-sm mr-1"
          onClick={handleToggle}
        >
          {hasChildren ? (
            expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
          )}
        </div>

        <span className="mr-2 flex-shrink-0">
          {page.icon || <FileText size={16} />}
        </span>

        <span className="truncate flex-grow">{page.title || 'Untitled'}</span>

        <div className={cn(
          "flex items-center opacity-0 transition-opacity",
          isHovered && "opacity-100"
        )}>
          <button onClick={handleDelete} className="p-1 hover:bg-notion-hover dark:hover:bg-notion-hoverDark rounded-sm mr-0.5" title="Delete">
            <Trash2 size={14} className="text-notion-gray" />
          </button>
          <button onClick={handleAddChild} className="p-1 hover:bg-notion-hover dark:hover:bg-notion-hoverDark rounded-sm" title="Add sub-page">
            <Plus size={14} className="text-notion-gray" />
          </button>
        </div>
      </div>

      {expanded && childPages.length > 0 && (
        <div className="flex flex-col">
          {childPages.map(child => (
            <PageItem key={child.id} page={child} level={level + 1} />
          ))}
        </div>
      )}

      {expanded && childPages.length === 0 && (
        <div
          className="py-1 text-xs text-notion-gray italic"
          style={{ paddingLeft: `${(level + 1) * 12 + 28}px` }}
        >
          No pages inside
        </div>
      )}
    </div>
  );
};

export const Sidebar: React.FC = () => {
  const { theme, setTheme } = useThemeStore();
  const [sidebarWidth, setSidebarWidth] = useState(parseInt(localStorage.getItem('sidebarWidth') || '256', 10));
  const [isResizing, setIsResizing] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const { restorePage, permanentlyDeletePage } = useWorkspaceStore();

  const { pages, addPage } = useWorkspaceStore();
  const deletedPages = useMemo(() => Object.values(pages).filter(p => p.isDeleted).sort((a,b) => b.updatedAt - a.updatedAt), [pages]);
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const rootPages = useMemo(() => {
    return Object.values(pages)
      .filter((p) => p.parentId === null && !p.isDeleted)
      .sort((a, b) => a.createdAt - b.createdAt);
  }, [pages]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      let newWidth = e.clientX;
      if (newWidth < 200) newWidth = 200;
      if (newWidth > 480) newWidth = 480;

      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        localStorage.setItem('sidebarWidth', sidebarWidth.toString());
      }
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, sidebarWidth]);

  const cycleTheme = () => {
    if (theme === 'system') setTheme('light');
    else if (theme === 'light') setTheme('dark');
    else setTheme('system');
  };

  const ThemeIcon = theme === 'system' ? Monitor : theme === 'dark' ? Moon : Sun;

  const handleCreateRootPage = () => {
    const id = addPage(null);
    navigate(`/${id}`);
  };

  if (collapsed) {
    return (
      <div className="h-screen w-0 md:w-12 border-r border-notion-border dark:border-notion-borderDark bg-gray-50 dark:bg-notion-sidebarDark flex flex-col items-center py-4 transition-all duration-300">
        <button onClick={() => setCollapsed(false)} className="p-2 hover:bg-notion-hover dark:hover:bg-notion-hoverDark rounded-md mb-4">
          <Menu size={20} className="text-notion-gray" />
        </button>
      </div>
    );
  }

  return (
    <div
    style={{ width: `${sidebarWidth}px` }}
    className="relative h-screen flex-shrink-0 border-r border-notion-border dark:border-notion-borderDark bg-notion-sidebar dark:bg-notion-sidebarDark flex flex-col transition-all duration-300 group/sidebar">
      {/* Workspace Header */}
      <div className="p-3 hover:bg-notion-hover dark:hover:bg-notion-hoverDark cursor-pointer flex items-center justify-between transition-colors">
        <div className="flex items-center space-x-2 font-semibold text-sm truncate dark:text-gray-200">
          <div className="w-5 h-5 bg-black dark:bg-white text-white dark:text-black rounded flex items-center justify-center text-xs">J</div>
          <span className="truncate">Jules's Workspace</span>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="opacity-0 group-hover/sidebar:opacity-100 p-1 hover:bg-gray-300 dark:hover:bg-notion-hoverDark rounded-sm"
        >
          <ChevronRight size={16} className="text-notion-gray rotate-180" />
        </button>
      </div>

      {/* Utilities */}
      <div className="flex flex-col mt-2 mb-4 space-y-0.5">
        <div onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))} className="px-3 py-1 flex items-center text-sm text-notion-gray dark:text-notion-gray hover:bg-notion-hover dark:hover:bg-notion-hoverDark cursor-pointer">
          <Search size={16} className="mr-2" />
          <span>Search</span>
        </div>
        <div className="px-3 py-1 flex items-center text-sm text-notion-gray dark:text-notion-gray hover:bg-notion-hover dark:hover:bg-notion-hoverDark cursor-pointer">
          <Settings size={16} className="mr-2" />
          <span>Settings & members</span>
        </div>

        <div onClick={cycleTheme} className="px-3 py-1 flex items-center justify-between text-sm text-notion-gray dark:text-notion-gray hover:bg-notion-hover dark:hover:bg-notion-hoverDark cursor-pointer">
          <div className="flex items-center">
            <ThemeIcon size={16} className="mr-2" />
            <span>Theme: {theme.charAt(0).toUpperCase() + theme.slice(1)}</span>
          </div>
        </div>
        <div onClick={() => setShowTrash(true)} className="px-3 py-1 flex items-center text-sm text-notion-gray dark:text-notion-gray hover:bg-notion-hover dark:hover:bg-notion-hoverDark cursor-pointer">
          <Trash2 size={16} className="mr-2" />
          <span>Trash</span>
        </div></div>

      {/* Pages Tree */}
      <div className="flex-grow overflow-y-auto overflow-x-hidden">
        <div className="px-3 py-1 text-xs font-semibold text-notion-gray flex justify-between group">
          <span>Private</span>
          <button onClick={handleCreateRootPage} className="opacity-0 group-hover:opacity-100 hover:bg-notion-hover dark:hover:bg-notion-hoverDark rounded-sm p-0.5">
            <Plus size={14} />
          </button>
        </div>

        <div className="mt-1">
          {rootPages.map(page => (
            <PageItem key={page.id} page={page} />
          ))}
        </div>
      </div>

      {/* Create New Page Button at bottom */}
      <div
        className="mt-auto border-t border-notion-border dark:border-notion-borderDark p-3 hover:bg-notion-hover dark:hover:bg-notion-hoverDark cursor-pointer flex items-center text-sm text-notion-gray dark:text-notion-grayDark transition-colors"
        onClick={handleCreateRootPage}
      >
        <Plus size={16} className="mr-2" />
        <span>New page</span>
      </div>

      {/* Resizer Handle */}
      <div
        className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-notion-border dark:hover:bg-notion-borderDark transition-colors z-50"
        onMouseDown={() => setIsResizing(true)}
      />

      {/* Trash Modal */}
      {showTrash && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-notion-sidebarDark w-full max-w-md rounded-lg shadow-xl border dark:border-notion-borderDark flex flex-col max-h-[80vh]">
            <div className="p-4 border-b dark:border-notion-borderDark flex justify-between items-center">
              <h2 className="font-semibold dark:text-white flex items-center"><Trash2 size={18} className="mr-2" /> Trash</h2>
              <button onClick={() => setShowTrash(false)} className="text-notion-gray hover:text-gray-700 dark:hover:text-gray-300">
                &times;
              </button>
            </div>
            <div className="p-2 overflow-y-auto flex-grow">
              {deletedPages.length === 0 ? (
                <div className="p-4 text-center text-notion-gray text-sm">Trash is empty</div>
              ) : (
                deletedPages.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-2 hover:bg-notion-hover dark:hover:bg-notion-hoverDark rounded group">
                    <div className="flex items-center text-sm dark:text-notion-grayDark truncate mr-2">
                      <span className="mr-2">{p.icon || <FileText size={16} />}</span>
                      <span className="truncate">{p.title || 'Untitled'}</span>
                    </div>
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button onClick={() => restorePage(p.id)} className="px-2 py-1 bg-notion-hover hover:bg-gray-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 rounded text-xs dark:text-gray-200">Restore</button>
                      <button onClick={() => permanentlyDeletePage(p.id)} className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-600 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 rounded text-xs">Delete</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
</div>
  );
};
