import { db } from "../config/firebase";
import { FileTreeNode, UpdateFileTreeNode } from "../types/fileTree";

export class FileTreeService {
  private collection = "fileTree";

  async createNode(
    workspaceId: string,
    node: Omit<FileTreeNode, "id" | "createdAt" | "updatedAt">
  ): Promise<FileTreeNode> {
    const nodeData = {
      ...node,
      workspaceId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await db.collection(this.collection).add(nodeData);
    return { ...nodeData, id: docRef.id } as FileTreeNode;
  }

  async updateNode(nodeId: string, updates: UpdateFileTreeNode): Promise<void> {
    const updateData = {
      ...updates,
      updatedAt: new Date(),
    };

    await db.collection(this.collection).doc(nodeId).update(updateData);
  }

  async getTreeByWorkspace(workspaceId: string): Promise<FileTreeNode[]> {
    console.log("workspaceId", workspaceId);
    const snapshot = await db
      .collection(this.collection)
      .where("workspaceId", "==", workspaceId)
      .orderBy("order")
      .get();

    console.log("snapshot", snapshot);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as FileTreeNode[];
  }

  async deleteNode(nodeId: string): Promise<void> {
    await db.collection(this.collection).doc(nodeId).delete();
  }

  async updateNodeOrder(nodeId: string, newOrder: number): Promise<void> {
    await this.updateNode(nodeId, { order: newOrder });
  }

  async toggleFolderState(nodeId: string, isOpen: boolean): Promise<void> {
    await this.updateNode(nodeId, { isOpen });
  }
}
