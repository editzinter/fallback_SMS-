import React, { useState, useEffect } from 'react';
import { useDatabaseStore } from '../store/useDatabaseStore';
import { Plus, LayoutGrid, Table2, MoreHorizontal } from 'lucide-react';
import { cn } from '../lib/utils';

interface DatabaseProps {
  pageId: string;
}

export const Database: React.FC<DatabaseProps> = ({ pageId }) => {
  const { databases, createDatabase, addEntry, updateEntry } = useDatabaseStore();
  const db = databases[pageId];
  const [activeViewId, setActiveViewId] = useState<string | null>(null);

  useEffect(() => {
    if (!db) {
      createDatabase(pageId);
    } else if (!activeViewId && db.views.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveViewId(db.views[0].id);
    }
  }, [pageId, db, createDatabase, activeViewId]);

  if (!db) return <div className="p-4 text-gray-500">Loading database...</div>;

  const activeView = db.views.find(v => v.id === activeViewId) || db.views[0];

  return (
    <div className="w-full flex flex-col mt-8">
      {/* View Tabs */}
      <div className="flex items-center border-b border-gray-200 dark:border-neutral-800 mb-4 px-2">
        {db.views.map(view => (
          <button
            key={view.id}
            onClick={() => setActiveViewId(view.id)}
            className={cn(
              "px-3 py-1.5 text-sm flex items-center transition-colors",
              activeViewId === view.id
                ? "border-b-2 border-black dark:border-white text-black dark:text-white font-medium"
                : "text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-t-sm"
            )}
          >
            {view.type === 'table' ? <Table2 size={16} className="mr-2" /> : <LayoutGrid size={16} className="mr-2" />}
            {view.name}
          </button>
        ))}
        <button className="px-2 py-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-sm ml-1">
          <Plus size={16} />
        </button>
      </div>

      {/* Database Content based on View */}
      {activeView?.type === 'table' ? (
        <TableView db={db} addEntry={() => addEntry(pageId)} updateEntry={(entryId: string, propId: string, val: any) => updateEntry(pageId, entryId, propId, val)} />
      ) : (
        <BoardView db={db} addEntry={() => addEntry(pageId)} updateEntry={(entryId: string, propId: string, val: any) => updateEntry(pageId, entryId, propId, val)} />
      )}
    </div>
  );
};

const TableView = ({ db, addEntry, updateEntry }: any) => {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[600px]">
        <thead>
          <tr className="border-b border-gray-200 dark:border-neutral-800 text-sm text-gray-500">
            {db.properties.map((prop: any) => (
              <th key={prop.id} className="font-normal px-3 py-2 border-r border-gray-200 dark:border-neutral-800 min-w-[150px]">
                {prop.name}
              </th>
            ))}
            <th className="font-normal px-3 py-2 w-10"><Plus size={16} /></th>
          </tr>
        </thead>
        <tbody>
          {db.entries.map((entry: any) => (
            <tr key={entry.id} className="border-b border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800/50 group">
              {db.properties.map((prop: any) => (
                <td key={prop.id} className="border-r border-gray-200 dark:border-neutral-800 p-0 text-sm">
                  <input
                    type="text"
                    value={entry.properties[prop.id] || ''}
                    onChange={(e) => updateEntry(entry.id, prop.id, e.target.value)}
                    className="w-full h-full px-3 py-2 bg-transparent outline-none focus:bg-blue-50 dark:focus:bg-blue-900/20 text-gray-900 dark:text-gray-100 placeholder-transparent"
                    placeholder="Empty"
                  />
                </td>
              ))}
              <td className="w-10"></td>
            </tr>
          ))}
          {/* New Row Button */}
          <tr>
            <td colSpan={db.properties.length + 1} className="p-0">
              <button onClick={addEntry} className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 dark:hover:bg-neutral-800 flex items-center">
                <Plus size={16} className="mr-2" /> New
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const BoardView = ({ db, addEntry, updateEntry }: any) => {
  // Find a select property to group by (e.g. Status)
  const groupProperty = db.properties.find((p: any) => p.type === 'select');

  if (!groupProperty) return <div className="p-4 text-gray-500">Add a 'select' property to use Board View</div>;

  const options = groupProperty.options || [];
  // Include "No Status" for entries without this property
  const columns = [...options, { id: 'unassigned', name: 'No Status', color: 'gray' }];

  return (
    <div className="flex space-x-4 overflow-x-auto pb-4 h-full">
      {columns.map(col => {
        const columnEntries = db.entries.filter((e: any) =>
          (col.id === 'unassigned' && !e.properties[groupProperty.id]) ||
          (e.properties[groupProperty.id] === col.name) // Simplified matching for now
        );

        return (
          <div key={col.id} className="min-w-[260px] flex-shrink-0 flex flex-col">
            <div className="flex items-center justify-between mb-3 text-sm font-medium text-gray-700 dark:text-gray-300 px-1">
              <div className="flex items-center">
                <span className="px-2 py-0.5 rounded-sm text-xs bg-gray-100 dark:bg-neutral-800 mr-2">{col.name}</span>
                <span className="text-gray-400 text-xs">{columnEntries.length}</span>
              </div>
              <div className="flex space-x-1 opacity-0 group-hover:opacity-100">
                <Plus size={16} className="text-gray-400 cursor-pointer" />
                <MoreHorizontal size={16} className="text-gray-400 cursor-pointer" />
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              {columnEntries.map((entry: any) => (
                <div key={entry.id} className="bg-white dark:bg-[#202020] border border-gray-200 dark:border-neutral-800 rounded p-3 shadow-sm hover:shadow cursor-pointer group/card">
                  <input
                    type="text"
                    value={entry.properties['title'] || ''}
                    onChange={(e) => updateEntry(entry.id, 'title', e.target.value)}
                    placeholder="Untitled"
                    className="w-full text-sm font-medium bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder-gray-300 dark:placeholder-neutral-600 mb-2"
                  />
                  {/* Render other properties briefly */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {db.properties.filter((p:any) => p.id !== 'title' && p.id !== groupProperty.id).map((prop:any) => (
                       entry.properties[prop.id] ?
                       <span key={prop.id} className="text-xs text-gray-500 bg-gray-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded-sm truncate max-w-full">
                         {entry.properties[prop.id]}
                       </span> : null
                    ))}
                  </div>
                </div>
              ))}
              <button
                onClick={() => {
                  const id = addEntry();
                  if(col.id !== 'unassigned') {
                     updateEntry(id, groupProperty.id, col.name);
                  }
                }}
                className="text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800 p-2 rounded flex items-center text-sm"
              >
                <Plus size={16} className="mr-2" /> New
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
