import React, { useEffect, useState } from "react";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useContentStore, useWorkspaceStore, useThemeStore } from "../store/useStore";
import EmojiPicker, { Theme } from 'emoji-picker-react';
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [coverSearch, setCoverSearch] = useState("");
  const { theme } = useThemeStore();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTitle(page?.title || "");
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setShowEmojiPicker(!showEmojiPicker);
  };

  const onEmojiClick = (emojiObject: { emoji: string }) => {
    updatePageMeta(pageId, { icon: emojiObject.emoji });
    setShowEmojiPicker(false);
  };

  const handleAddCover = () => {
    if (!page.coverImage) {
      // Just put a default cover immediately if there's none
      const randomId = Math.floor(Math.random() * 1000);
      const coverUrl = `https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&q=80&random=${randomId}`;
      updatePageMeta(pageId, { coverImage: coverUrl });
    }
    setShowCoverPicker(!showCoverPicker);
  };

  const handleApplyCover = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverSearch) return;
    const coverUrl = `https://source.unsplash.com/1200x400/?${encodeURIComponent(coverSearch)}`;
    updatePageMeta(pageId, { coverImage: coverUrl });
    setShowCoverPicker(false);
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
            <div className="relative">
              <button
                onClick={() => setShowCoverPicker(!showCoverPicker)}
                className="px-3 py-1 bg-white/80 hover:bg-white text-gray-700 text-sm rounded shadow-sm flex items-center backdrop-blur-sm"
              >
                <Maximize2 size={14} className="mr-2" /> Change cover
              </button>
              {showCoverPicker && (
                <div className="absolute top-full right-0 mt-2 bg-white dark:bg-[#202020] p-3 rounded shadow-lg border dark:border-neutral-700 z-50 w-64">
                  <form onSubmit={handleApplyCover}>
                    <input
                      type="text"
                      placeholder="Search Unsplash..."
                      value={coverSearch}
                      onChange={(e) => setCoverSearch(e.target.value)}
                      className="w-full text-sm p-2 bg-gray-100 dark:bg-neutral-800 rounded outline-none border-none mb-2 text-black dark:text-white"
                    />
                    <button type="submit" className="w-full bg-blue-500 text-white rounded p-1.5 text-sm hover:bg-blue-600">Apply</button>
                  </form>
                </div>
              )}
            </div>
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
            <div className="relative">
              <button onClick={handleAddIcon} className="hover:bg-gray-100 dark:hover:bg-neutral-800 px-2 py-0.5 rounded flex items-center">
                <Smile size={16} className="mr-1.5" /> Add icon
              </button>
              {!page.icon && showEmojiPicker && (
                <div className="absolute top-full left-0 z-50 mt-2">
                  <EmojiPicker
                    onEmojiClick={onEmojiClick}
                    theme={theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) ? Theme.DARK : Theme.LIGHT}
                  />
                </div>
              )}
            </div>
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
            {showEmojiPicker && (
              <div className="absolute top-full left-0 z-50 mt-2">
                <EmojiPicker
                  onEmojiClick={onEmojiClick}
                  theme={theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) ? Theme.DARK : Theme.LIGHT}
                />
              </div>
            )}
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
            theme={theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) ? "dark" : "light"}
            onChange={() => {
              savePageContent(pageId, editor.document);
            }}
          />
        </div>
      </div>
    </div>
  );
};
