export interface FileTreeNode {
  id: string;
  label: string;
  type: "file" | "directory";
  parentId: string | null;
  order: number;
  isOpen?: boolean;
  icon?: string;
  children?: FileTreeNode[];
  createdAt: Date;
  updatedAt: Date;
  workspaceId: string;
}

export interface UpdateFileTreeNode {
  label?: string;
  parentId?: string | null;
  order?: number;
  isOpen?: boolean;
  icon?: string;
}
