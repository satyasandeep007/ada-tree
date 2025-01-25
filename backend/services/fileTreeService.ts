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
    const docRef = db.collection(this.collection).doc(nodeId);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new Error(`Document with ID ${nodeId} does not exist`);
    }

    const updateData = {
      ...updates,
      updatedAt: new Date(),
    };

    await docRef.update(updateData);
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
    await this.updateNode(nodeId, { isOpen });
  }

  async batchUpdateOrder(
    updates: { id: string; order: number }[]
  ): Promise<void> {
    const docRefs = updates.map(({ id }) =>
      db.collection(this.collection).doc(id)
    );

    const docs = await Promise.all(docRefs.map((docRef) => docRef.get()));

    const batch = db.batch();
    let hasUpdates = false;

    updates.forEach(({ id, order }, index) => {
      if (docs[index].exists) {
        batch.update(docRefs[index], {
          order,
          updatedAt: new Date(),
        });
        hasUpdates = true;
      } else {
        console.warn(`Document with ID ${id} does not exist, skipping update`);
      }
    });

    if (hasUpdates) {
      await batch.commit();
    }
  }
}
