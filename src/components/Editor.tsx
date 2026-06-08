import React, { useEffect, useState } from "react";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useContentStore, useWorkspaceStore, useThemeStore } from "../store/useStore";
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { Image as ImageIcon, Smile } from "lucide-react";

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
    <div className="flex-grow flex flex-col h-screen overflow-y-auto bg-notion-bg dark:bg-notion-bgDark text-notion-text dark:text-notion-textDark">
      {page.coverImage ? (
        <div className="relative w-full h-[30vh] min-h-[200px] group">
          <img src={page.coverImage} alt="Cover" className="w-full h-full object-cover object-center" />
          <div className="absolute bottom-4 right-20 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
            <div className="relative">
              <button
                onClick={() => setShowCoverPicker(!showCoverPicker)}
                className="px-3 py-1 bg-white dark:bg-[#202020] hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-200 text-sm rounded flex items-center shadow-sm transition-colors"
              >
                Change cover
              </button>
              {showCoverPicker && (
                <div className="absolute top-full right-0 mt-2 bg-white dark:bg-[#202020] p-3 rounded shadow-notion-dropdown dark:shadow-notion-dropdown-dark border border-notion-border dark:border-notion-borderDark z-50 w-64">
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
              className="px-3 py-1 bg-white dark:bg-[#202020] hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-200 text-sm rounded shadow-sm transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      ) : null}

      <div className="max-w-[900px] w-full mx-auto px-12 md:px-24 flex-grow flex flex-col pb-24 relative">
        {/* Absolute positioning for icon when cover exists */}
        {page.icon && page.coverImage && (
          <div className="relative group/icon -mt-[39px] mb-2 z-10 w-[78px]">
            <div className="text-[78px] leading-[78px] select-none">{page.icon}</div>
            {showEmojiPicker && (
              <div className="absolute top-full left-0 z-50 mt-2">
                <EmojiPicker
                  onEmojiClick={onEmojiClick}
                  theme={theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) ? Theme.DARK : Theme.LIGHT}
                />
              </div>
            )}
            <div className="absolute -top-8 left-0 opacity-0 group-hover/icon:opacity-100 flex space-x-2 bg-white dark:bg-[#202020] shadow-sm border border-notion-border dark:border-notion-borderDark rounded p-1 z-10 text-xs">
              <button onClick={handleAddIcon} className="px-2 py-1 hover:bg-notion-hover dark:hover:bg-notion-hoverDark rounded text-notion-text dark:text-notion-textDark">Change</button>
              <button onClick={handleRemoveIcon} className="px-2 py-1 hover:bg-notion-hover dark:hover:bg-notion-hoverDark rounded text-notion-text dark:text-notion-textDark">Remove</button>
            </div>
          </div>
        )}

        {/* Regular positioning when no cover */}
        {page.icon && !page.coverImage && (
          <div className="relative group/icon pt-[10vh] mb-2 w-[78px]">
            <div className="text-[78px] leading-[78px] select-none">{page.icon}</div>
            {showEmojiPicker && (
              <div className="absolute top-full left-0 z-50 mt-2">
                <EmojiPicker
                  onEmojiClick={onEmojiClick}
                  theme={theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) ? Theme.DARK : Theme.LIGHT}
                />
              </div>
            )}
            <div className="absolute top-10 left-24 opacity-0 group-hover/icon:opacity-100 flex space-x-2 bg-white dark:bg-[#202020] shadow-sm border border-notion-border dark:border-notion-borderDark rounded p-1 z-10 text-xs">
              <button onClick={handleAddIcon} className="px-2 py-1 hover:bg-notion-hover dark:hover:bg-notion-hoverDark rounded text-notion-text dark:text-notion-textDark">Change</button>
              <button onClick={handleRemoveIcon} className="px-2 py-1 hover:bg-notion-hover dark:hover:bg-notion-hoverDark rounded text-notion-text dark:text-notion-textDark">Remove</button>
            </div>
          </div>
        )}

        <div className={`group/meta flex space-x-4 mb-2 text-sm text-notion-gray dark:text-notion-grayDark opacity-0 hover:opacity-100 transition-opacity min-h-[28px] ${!page.icon && !page.coverImage ? 'pt-[10vh]' : 'mt-4'}`}>
          {!page.icon && (
            <div className="relative">
              <button onClick={handleAddIcon} className="hover:bg-notion-hover dark:hover:bg-notion-hoverDark px-2 py-1 rounded flex items-center transition-colors">
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
            <button onClick={handleAddCover} className="hover:bg-notion-hover dark:hover:bg-notion-hoverDark px-2 py-1 rounded flex items-center transition-colors">
              <ImageIcon size={16} className="mr-1.5" /> Add cover
            </button>
          )}
        </div>

        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          onBlur={handleTitleBlur}
          onKeyDown={handleTitleKeyDown}
          placeholder="Untitled"
          className="text-[40px] leading-[1.2] font-bold bg-transparent border-none outline-none mb-6 placeholder-notion-border dark:placeholder-notion-borderDark resize-none w-full text-notion-text dark:text-notion-textDark"
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
