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
