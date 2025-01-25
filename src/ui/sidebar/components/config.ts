import { NavItem } from "@/@types/sidebar";

export const initialNavConfig: NavItem[] = [
  {
    href: "/project/1",
    icon: "🔑",
    label: "1",
    slug: "1",
    type: "project",
    order: 0,
    parentId: null,
  },
  {
    href: "/project/2",
    icon: "📝",
    label: "2",
    slug: "2",
    type: "project",
    order: 1,
    parentId: null,
  },
];

export const icons = [
  "📝",
  "🔑",
  "📚",
  "🎯",
  "💡",
  "🎨",
  "🔧",
  "📊",
  "🎮",
  "📱",
];
