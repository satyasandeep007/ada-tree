export interface NavItem {
  id?: string;
  href: string;
  icon: string;
  name: string;
  slug: string;
  type: "file" | "folder";
  parentId: string | null;
  order: number;
  isOpen?: boolean;
}

export interface ProjectsProps {
  navConfig: NavItem[];
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  addNewProject: () => void;
  addNewDirectory: () => void;
  handleEdit: (slug: string, newLabel: string) => void;
  handleKeyDown: (e: React.KeyboardEvent, slug: string) => void;
  onDragEnd: (result: DropResult) => void;
  onToggleFolder: (id: string, isOpen: boolean) => void;
}
