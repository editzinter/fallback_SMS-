import React, { useEffect, useState } from "react";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useContentStore, useWorkspaceStore } from "../store/useStore";
import { Image as ImageIcon, Smile, Maximize2 } from "lucide-react";

interface EditorProps {
  pageId: string;
}

export const Editor: React.FC<EditorProps> = ({ pageId }) => {
  const { pages, updatePageMeta } = useWorkspaceStore();
  const { pageContents, savePageContent } = useContentStore();

  const page = pages[pageId];
  const initialContent = pageContents[pageId];

  const [title, setTitle] = useState(page?.title || "");

  useEffect(() => {
    setTitle(page?.title || "");
  }, [page?.id]);

  const editor = useCreateBlockNote({
    initialContent: initialContent?.length ? initialContent : undefined,
  });

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleTitleBlur = () => {
    if (title !== page?.title) {
      updatePageMeta(pageId, { title: title || "Untitled" });
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      editor._tiptapEditor.commands.focus();
    }
  };

  const handleAddIcon = () => {
    const emojis = ["🚀", "💡", "📝", "🔥", "✨", "🎯", "🌟", "📚"];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    updatePageMeta(pageId, { icon: randomEmoji });
  };

  const handleAddCover = () => {
    const randomId = Math.floor(Math.random() * 1000);
    const coverUrl = `https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&q=80&random=${randomId}`;
    updatePageMeta(pageId, { coverImage: coverUrl });
  };

  const handleRemoveCover = () => {
    updatePageMeta(pageId, { coverImage: undefined });
  };

  const handleRemoveIcon = () => {
    updatePageMeta(pageId, { icon: undefined });
  };

  if (!page) return <div className="p-10 flex-grow text-gray-500">Page not found</div>;

  return (
    <div className="flex-grow flex flex-col h-screen overflow-y-auto bg-white dark:bg-[#191919] text-gray-900 dark:text-gray-100">
      {page.coverImage ? (
        <div className="relative w-full h-48 md:h-64 group">
          <img src={page.coverImage} alt="Cover" className="w-full h-full object-cover" />
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
            <button
              onClick={handleAddCover}
              className="px-3 py-1 bg-white/80 hover:bg-white text-gray-700 text-sm rounded shadow-sm flex items-center backdrop-blur-sm"
            >
              <Maximize2 size={14} className="mr-2" /> Change cover
            </button>
            <button
              onClick={handleRemoveCover}
              className="px-3 py-1 bg-white/80 hover:bg-white text-gray-700 text-sm rounded shadow-sm backdrop-blur-sm"
            >
              Remove
            </button>
          </div>
        </div>
      ) : null}

      <div className="max-w-[900px] w-full mx-auto px-12 md:px-24 py-12 flex-grow flex flex-col">
        <div className="group/meta flex space-x-4 mb-4 text-sm text-gray-400 opacity-0 hover:opacity-100 transition-opacity min-h-[24px]">
          {!page.icon && (
            <button onClick={handleAddIcon} className="hover:bg-gray-100 dark:hover:bg-neutral-800 px-2 py-0.5 rounded flex items-center">
              <Smile size={16} className="mr-1.5" /> Add icon
            </button>
          )}
          {!page.coverImage && (
            <button onClick={handleAddCover} className="hover:bg-gray-100 dark:hover:bg-neutral-800 px-2 py-0.5 rounded flex items-center">
              <ImageIcon size={16} className="mr-1.5" /> Add cover
            </button>
          )}
        </div>

        {page.icon && (
          <div className="relative group/icon mb-4">
            <div className="text-[78px] leading-none select-none">{page.icon}</div>
            <div className="absolute -top-4 left-0 opacity-0 group-hover/icon:opacity-100 flex space-x-2 bg-white dark:bg-[#202020] shadow-sm border dark:border-neutral-700 rounded p-1 z-10 text-xs">
              <button onClick={handleAddIcon} className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded text-gray-600 dark:text-gray-300">Change</button>
              <button onClick={handleRemoveIcon} className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded text-gray-600 dark:text-gray-300">Remove</button>
            </div>
          </div>
        )}

        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          onBlur={handleTitleBlur}
          onKeyDown={handleTitleKeyDown}
          placeholder="Untitled"
          className="text-4xl font-bold bg-transparent border-none outline-none mb-8 placeholder-gray-300 dark:placeholder-neutral-700 resize-none w-full text-gray-900 dark:text-white"
        />

        <div className="-ml-12">
          <BlockNoteView
            editor={editor}
            theme="light"
            onChange={() => {
              savePageContent(pageId, editor.document);
            }}
          />
        </div>
      </div>
    </div>
  );
};
