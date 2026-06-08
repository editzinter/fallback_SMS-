import { Block } from "@blocknote/core";

export type PageId = string;

export interface PageMeta {
  id: PageId;
  title: string;
  icon?: string;
  coverImage?: string;
  parentId: PageId | null;
  createdAt: number;
  updatedAt: number;
  isDatabase?: boolean;
  isDeleted?: boolean;
}

export interface PageContent {
  id: PageId;
  blocks: Block[];
}

export interface DatabaseProperties {
  id: string;
  name: string;
  type: "text" | "number" | "select" | "multi-select" | "date" | "checkbox" | "url" | "email" | "phone";
  options?: { id: string; name: string; color: string }[];
}

export interface DatabaseEntry {
  id: string;
  pageId: PageId;
  properties: Record<string, any>;
}

export interface DatabaseContent {
  id: PageId;
  properties: DatabaseProperties[];
  entries: DatabaseEntry[];
  views: DatabaseView[];
}

export interface DatabaseView {
  id: string;
  name: string;
  type: "table" | "board" | "list" | "calendar" | "gallery";
  filters?: any[];
  sorts?: any[];
}
