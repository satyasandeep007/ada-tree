import { NavItem } from "@/@types/sidebar";
import { transformFileNodeToNavItem } from "@/utils/transformers";

const API_BASE_URL = "http://localhost:9292/api/file-trees";

export const fileTreeApi = {
  async getTree(workspaceId: string): Promise<NavItem[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/${workspaceId}/tree`);
      const data = await response.json();
      console.log("API Response:", data);
      const transformed = data.map(transformFileNodeToNavItem);
      console.log("Transformed Data:", transformed);
      return transformed;
    } catch (error) {
      console.error("API Error:", error);
      return [];
    }
  },

  async createNode(
    workspaceId: string,
    node: Omit<NavItem, "id">
  ): Promise<NavItem> {
    const response = await fetch(`${API_BASE_URL}/${workspaceId}/nodes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(node),
    });
    return response.json();
  },

  async updateNode(nodeId: string, updates: Partial<NavItem>): Promise<void> {
    await fetch(`${API_BASE_URL}/nodes/${nodeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
  },

  async deleteNode(nodeId: string): Promise<void> {
    await fetch(`${API_BASE_URL}/nodes/${nodeId}`, {
      method: "DELETE",
    });
  },

  async toggleFolderState(nodeId: string, isOpen: boolean): Promise<void> {
    await fetch(`${API_BASE_URL}/nodes/${nodeId}/toggle`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isOpen }),
    });
  },
};
