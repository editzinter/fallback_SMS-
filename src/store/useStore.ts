import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import localforage from 'localforage';
import { v4 as uuidv4 } from 'uuid';
import type { PageMeta, PageId } from '../types';

localforage.config({
  name: 'notion-clone',
  storeName: 'workspace',
});

const storage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await localforage.getItem(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await localforage.setItem(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await localforage.removeItem(name);
  },
};

interface WorkspaceState {
  pages: Record<PageId, PageMeta>;
  activePageId: PageId | null;

  // Actions
  addPage: (parentId: PageId | null, title?: string, isDatabase?: boolean) => PageId;
  updatePageMeta: (id: PageId, updates: Partial<PageMeta>) => void;
  deletePage: (id: PageId) => void;
  setActivePage: (id: PageId | null) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      pages: {},
      activePageId: null,

      addPage: (parentId, title = "Untitled", isDatabase = false) => {
        const id = uuidv4();
        const now = Date.now();
        const newPage: PageMeta = {
          id,
          title,
          parentId,
          createdAt: now,
          updatedAt: now,
          isDatabase,
        };

        set((state) => ({
          pages: { ...state.pages, [id]: newPage },
          activePageId: id,
        }));

        return id;
      },

      updatePageMeta: (id, updates) => {
        set((state) => {
          const page = state.pages[id];
          if (!page) return state;
          return {
            pages: {
              ...state.pages,
              [id]: { ...page, ...updates, updatedAt: Date.now() },
            },
          };
        });
      },

      deletePage: (id) => {
        set((state) => {
          const newPages = { ...state.pages };

          const deleteChildren = (parentId: PageId) => {
            Object.values(newPages).forEach((p) => {
              if (p.parentId === parentId) {
                delete newPages[p.id];
                deleteChildren(p.id);
              }
            });
          };

          delete newPages[id];
          deleteChildren(id);

          return {
            pages: newPages,
            activePageId: state.activePageId === id ? null : state.activePageId
          };
        });
      },

      setActivePage: (id) => set({ activePageId: id }),
    }),
    {
      name: 'workspace-storage',
      storage: createJSONStorage(() => storage),
    }
  )
);

export const useContentStore = create<{
  pageContents: Record<PageId, any[]>;
  savePageContent: (id: PageId, blocks: any[]) => void;
}>()(
  persist(
    (set) => ({
      pageContents: {},
      savePageContent: (id, blocks) => set((state) => ({
        pageContents: { ...state.pageContents, [id]: blocks }
      })),
    }),
    {
      name: 'content-storage',
      storage: createJSONStorage(() => storage),
    }
  )
);
