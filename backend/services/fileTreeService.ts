import { db } from "../config/firebase";
import { FileTreeNode, UpdateFileTreeNode } from "../types/fileTree";

export class FileTreeService {
  private collection = "fileTree";
  private static subscribers = new Map<
    string,
    Set<(nodes: FileTreeNode[]) => void>
  >();
  private unsubscribers = new Map<string, () => void>();

  subscribeToWorkspaceTree(
    workspaceId: string,
    callback: (nodes: FileTreeNode[]) => void
  ): () => void {
    if (!FileTreeService.subscribers.has(workspaceId)) {
      FileTreeService.subscribers.set(workspaceId, new Set());

      const unsubscribe = db
        .collection(this.collection)
        .where("workspaceId", "==", workspaceId)
        .orderBy("order")
        .onSnapshot((snapshot) => {
          const nodes = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            parentId:
              doc.data().parentId === "null" ? null : doc.data().parentId,
          })) as FileTreeNode[];

          FileTreeService.subscribers.get(workspaceId)?.forEach((cb) => {
            try {
              cb(nodes);
            } catch (error) {
              console.error("Error notifying subscriber:", error);
            }
          });
        });

      this.unsubscribers.set(workspaceId, unsubscribe);
    }

    const subscribers = FileTreeService.subscribers.get(workspaceId)!;
    subscribers.add(callback);

    return () => {
      const subs = FileTreeService.subscribers.get(workspaceId);
      if (subs) {
        subs.delete(callback);
        if (subs.size === 0) {
          this.unsubscribers.get(workspaceId)?.();
          this.unsubscribers.delete(workspaceId);
          FileTreeService.subscribers.delete(workspaceId);
        }
      }
    };
  }

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
    const docRef = db.collection(this.collection).doc(nodeId);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new Error(`Document with ID ${nodeId} does not exist`);
    }

    await docRef.update({
      ...updates,
      updatedAt: new Date(),
    });
  }

  async getTreeByWorkspace(workspaceId: string): Promise<FileTreeNode[]> {
    const snapshot = await db
      .collection(this.collection)
      .where("workspaceId", "==", workspaceId)
      .orderBy("order")
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      parentId: doc.data().parentId === "null" ? null : doc.data().parentId,
    })) as FileTreeNode[];
  }

  async deleteNode(nodeId: string): Promise<void> {
    await db.collection(this.collection).doc(nodeId).delete();
  }

  async updateNodeOrder(nodeId: string, newOrder: number): Promise<void> {
    await this.updateNode(nodeId, { order: newOrder });
  }

  async toggleFolderState(nodeId: string, isOpen: boolean): Promise<void> {
    const docRef = db.collection(this.collection).doc(nodeId);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new Error(`Document with ID ${nodeId} does not exist`);
    }

    await docRef.update({
      isOpen,
      updatedAt: new Date(),
    });
  }

  async batchUpdateOrder(
    updates: { id: string; order: number }[]
  ): Promise<void> {
    const batch = db.batch();

    updates.forEach(({ id, order }) => {
      const docRef = db.collection(this.collection).doc(id);
      batch.update(docRef, {
        order,
        updatedAt: new Date(),
      });
    });

    await batch.commit();
  }

  async getNode(nodeId: string): Promise<FileTreeNode | null> {
    const snapshot = await db.collection(this.collection).doc(nodeId).get();
    if (!snapshot.exists) {
      return null;
    }

    const data = snapshot.data();
    if (!data) return null;

    return {
      id: snapshot.id,
      workspaceId: data.workspaceId,
      name: data.name,
      type: data.type,
      order: data.order,
      parentId: data.parentId === "null" ? null : data.parentId,
      isOpen: data.isOpen ?? false,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
}
