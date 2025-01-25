/* eslint-disable @typescript-eslint/no-explicit-any */
import { NavItem } from "@/@types/sidebar";

export const transformFileNodeToNavItem = (node: any): NavItem => {
  return {
    id: node.id,
    href: node.type === "file" ? `/project/${node.id}` : `#${node.id}`,
    icon: node.type === "file" ? "📝" : "📁",
    label: node.name,
    slug: node.id,
    type: node.type === "file" ? "project" : "directory",
    parentId: node.parentId === "null" ? null : node.parentId,
    order: node.order,
    isOpen: false,
  };
};
