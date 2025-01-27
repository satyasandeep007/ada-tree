/* eslint-disable @typescript-eslint/no-explicit-any */
import { NavItem } from "@/@types/sidebar";

export const transformFileNodeToNavItem = (
  node: any,
  workspaceId: string
): NavItem => {
  return {
    id: node.id,
    href:
      node.type === "file"
        ? `/${workspaceId}/project/${node.id}`
        : `/${workspaceId}/project`,
    icon: node.icon || (node.type === "file" ? "📝" : "📁"),
    name: node.name,
    slug: node.id,
    type: node.type === "file" ? "file" : "folder",
    parentId: node.parentId === "null" ? null : node.parentId,
    order: node.order,
    isOpen: node.isOpen || false,
  };
};
