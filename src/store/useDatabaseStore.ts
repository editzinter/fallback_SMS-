import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import localforage from 'localforage';
import { v4 as uuidv4 } from 'uuid';
import type { DatabaseContent, PageId, DatabaseProperties, DatabaseView } from '../types';

localforage.config({
  name: 'notion-clone',
  storeName: 'databases',
});

interface DatabaseState {
  databases: Record<PageId, DatabaseContent>;

  createDatabase: (pageId: PageId) => void;
  addProperty: (pageId: PageId, property: Omit<DatabaseProperties, 'id'>) => void;
  updateProperty: (pageId: PageId, propertyId: string, updates: Partial<DatabaseProperties>) => void;
  deleteProperty: (pageId: PageId, propertyId: string) => void;

  addEntry: (pageId: PageId, initialData?: Record<string, any>) => string;
  updateEntry: (pageId: PageId, entryId: string, propertyId: string, value: any) => void;
  deleteEntry: (pageId: PageId, entryId: string) => void;

  addView: (pageId: PageId, view: Omit<DatabaseView, 'id'>) => void;
}

export const useDatabaseStore = create<DatabaseState>()(
  persist(
    (set) => ({
      databases: {},

      createDatabase: (pageId) => set((state) => {
        if (state.databases[pageId]) return state;
        return {
          databases: {
            ...state.databases,
            [pageId]: {
              id: pageId,
              properties: [
                { id: 'title', name: 'Name', type: 'text' },
                { id: uuidv4(), name: 'Tags', type: 'multi-select', options: [] },
                { id: uuidv4(), name: 'Status', type: 'select', options: [
                  { id: '1', name: 'Not started', color: 'gray' },
                  { id: '2', name: 'In progress', color: 'blue' },
                  { id: '3', name: 'Done', color: 'green' }
                ]}
              ],
              entries: [],
              views: [
                { id: uuidv4(), name: 'Table View', type: 'table' },
                { id: uuidv4(), name: 'Board View', type: 'board' }
              ]
            }
          }
        };
      }),

      addProperty: (pageId, property) => set((state) => {
        const db = state.databases[pageId];
        if (!db) return state;
        return {
          databases: {
            ...state.databases,
            [pageId]: {
              ...db,
              properties: [...db.properties, { ...property, id: uuidv4() }]
            }
          }
        };
      }),

      updateProperty: (pageId, propertyId, updates) => set((state) => {
        const db = state.databases[pageId];
        if (!db) return state;
        return {
          databases: {
            ...state.databases,
            [pageId]: {
              ...db,
              properties: db.properties.map((p: DatabaseProperties) => p.id === propertyId ? { ...p, ...updates } as DatabaseProperties : p)
            }
          }
        };
      }),

      deleteProperty: (pageId, propertyId) => set((state) => {
        const db = state.databases[pageId];
        if (!db) return state;
        return {
          databases: {
            ...state.databases,
            [pageId]: {
              ...db,
              properties: db.properties.filter((p: DatabaseProperties) => p.id !== propertyId)
            }
          }
        };
      }),

      addEntry: (pageId, initialData = {}) => {
        const entryId = uuidv4();
        set((state) => {
          const db = state.databases[pageId];
          if (!db) return state;

          return {
            databases: {
              ...state.databases,
              [pageId]: {
                ...db,
                entries: [...db.entries, { id: entryId, pageId: uuidv4(), properties: initialData }]
              }
            }
          };
        });
        return entryId;
      },

      updateEntry: (pageId, entryId, propertyId, value) => set((state) => {
        const db = state.databases[pageId];
        if (!db) return state;

        return {
          databases: {
            ...state.databases,
            [pageId]: {
              ...db,
              entries: db.entries.map((e: any) => {
                if (e.id === entryId) {
                  return { ...e, properties: { ...e.properties, [propertyId]: value } };
                }
                return e;
              })
            }
          }
        };
      }),

      deleteEntry: (pageId, entryId) => set((state) => {
        const db = state.databases[pageId];
        if (!db) return state;
        return {
          databases: {
            ...state.databases,
            [pageId]: {
              ...db,
              entries: db.entries.filter((e: any) => e.id !== entryId)
            }
          }
        };
      }),

      addView: (pageId, view) => set((state) => {
        const db = state.databases[pageId];
        if (!db) return state;
        return {
          databases: {
            ...state.databases,
            [pageId]: {
              ...db,
              views: [...db.views, { ...view, id: uuidv4() } as DatabaseView]
            }
          }
        };
      }),

    }),
    {
      name: 'database-storage',
      storage: createJSONStorage(() => ({
        getItem: async (name: string): Promise<string | null> => (await localforage.getItem(name)) || null,
        setItem: async (name: string, value: string): Promise<void> => { await localforage.setItem(name, value); },
        removeItem: async (name: string): Promise<void> => { await localforage.removeItem(name); },
      })),
    }
  )
);
