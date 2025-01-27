export interface FileTreeNode {
  id: string;
  workspaceId: string;
  name: string;
  type: "file" | "folder";
  order: number;
  parentId: string | null;
  icon?: string;
  isOpen?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type UpdateFileTreeNode = Partial<
  Omit<FileTreeNode, "id" | "workspaceId" | "createdAt">
>;

export type CreateFileTreeNode = Omit<
  FileTreeNode,
  "id" | "createdAt" | "updatedAt"
>;
