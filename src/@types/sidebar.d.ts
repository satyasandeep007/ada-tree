export interface NavItem {
  href: string;
  icon: string;
  label: string;
  slug: string;
  type: "project" | "directory";
  parentId?: string | null;
  order: number;
}
