import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, Plus, FileText, Trash2, Settings, Search, Menu } from 'lucide-react';
import { useWorkspaceStore } from '../store/useStore';
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
      .filter((p) => p.parentId === page.id)
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
          "group flex items-center py-1 px-2 hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer text-sm text-gray-600 dark:text-gray-300 rounded-sm mx-2",
          isActive && "bg-gray-100 dark:bg-neutral-800 text-black dark:text-white font-medium"
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleNavigate}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className="w-5 h-5 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-sm mr-1"
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
          <button onClick={handleDelete} className="p-1 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-sm mr-0.5" title="Delete">
            <Trash2 size={14} className="text-gray-400" />
          </button>
          <button onClick={handleAddChild} className="p-1 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-sm" title="Add sub-page">
            <Plus size={14} className="text-gray-400" />
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
          className="py-1 text-xs text-gray-400 italic"
          style={{ paddingLeft: `${(level + 1) * 12 + 28}px` }}
        >
          No pages inside
        </div>
      )}
    </div>
  );
};

export const Sidebar: React.FC = () => {
  const { pages, addPage } = useWorkspaceStore();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const rootPages = useMemo(() => {
    return Object.values(pages)
      .filter((p) => p.parentId === null)
      .sort((a, b) => a.createdAt - b.createdAt);
  }, [pages]);

  const handleCreateRootPage = () => {
    const id = addPage(null);
    navigate(`/${id}`);
  };

  if (collapsed) {
    return (
      <div className="h-screen w-0 md:w-12 border-r border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-[#202020] flex flex-col items-center py-4 transition-all duration-300">
        <button onClick={() => setCollapsed(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-md mb-4">
          <Menu size={20} className="text-gray-500" />
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen w-64 md:w-64 flex-shrink-0 border-r border-gray-200 dark:border-neutral-800 bg-[#f7f7f5] dark:bg-[#202020] flex flex-col transition-all duration-300 group/sidebar">
      {/* Workspace Header */}
      <div className="p-3 hover:bg-gray-200 dark:hover:bg-neutral-800 cursor-pointer flex items-center justify-between transition-colors">
        <div className="flex items-center space-x-2 font-semibold text-sm truncate dark:text-gray-200">
          <div className="w-5 h-5 bg-black dark:bg-white text-white dark:text-black rounded flex items-center justify-center text-xs">J</div>
          <span className="truncate">Jules's Workspace</span>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="opacity-0 group-hover/sidebar:opacity-100 p-1 hover:bg-gray-300 dark:hover:bg-neutral-700 rounded-sm"
        >
          <ChevronRight size={16} className="text-gray-500 rotate-180" />
        </button>
      </div>

      {/* Utilities */}
      <div className="flex flex-col mt-2 mb-4 space-y-0.5">
        <div className="px-3 py-1 flex items-center text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-neutral-800 cursor-pointer">
          <Search size={16} className="mr-2" />
          <span>Search</span>
        </div>
        <div className="px-3 py-1 flex items-center text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-neutral-800 cursor-pointer">
          <Settings size={16} className="mr-2" />
          <span>Settings & members</span>
        </div>
      </div>

      {/* Pages Tree */}
      <div className="flex-grow overflow-y-auto overflow-x-hidden">
        <div className="px-3 py-1 text-xs font-semibold text-gray-500 flex justify-between group">
          <span>Private</span>
          <button onClick={handleCreateRootPage} className="opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-sm p-0.5">
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
        className="mt-auto border-t border-gray-200 dark:border-neutral-800 p-3 hover:bg-gray-200 dark:hover:bg-neutral-800 cursor-pointer flex items-center text-sm text-gray-600 dark:text-gray-300 transition-colors"
        onClick={handleCreateRootPage}
      >
        <Plus size={16} className="mr-2" />
        <span>New page</span>
      </div>
    </div>
  );
};
