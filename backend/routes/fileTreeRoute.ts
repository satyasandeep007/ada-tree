/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Router } from "express";
import { FileTreeService } from "../services/fileTreeService";

const router = Router();
const fileTreeService = new FileTreeService();

router.post("/:workspaceId/nodes", async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const node = await fileTreeService.createNode(workspaceId, req.body);
    res.status(201).json(node);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to create node" });
  }
});

router.get("/:workspaceId/tree", async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const tree = await fileTreeService.getTreeByWorkspace(workspaceId);
    res.json(tree);
  } catch (error: any) {
    console.error("Failed to fetch tree", error);
    res.status(500).json({ error: "Failed to fetch tree" });
  }
});

router.patch("/nodes/:nodeId", async (req, res) => {
  try {
    const { nodeId } = req.params;
    await fileTreeService.updateNode(nodeId, req.body);
    res.status(200).send();
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update node" });
  }
});

router.patch("/nodes/:nodeId/toggle", async (req, res) => {
  try {
    const { nodeId } = req.params;
    const { isOpen } = req.body;
    await fileTreeService.toggleFolderState(nodeId, isOpen);
    res.status(200).send();
  } catch (error: any) {
    res.status(500).json({ error: "Failed to toggle folder state" });
  }
});

router.delete("/nodes/:nodeId", async (req, res) => {
  try {
    const { nodeId } = req.params;
    await fileTreeService.deleteNode(nodeId);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete node" });
  }
});

export default router;

// id: string          // Unique identifier for the document (Firestore auto-generated or custom)
// type: string        // Either "folder" or "file"
// name: string        // Name of the folder or file
// parentId: string    // ID of the parent folder (null for root level)
// content: string     // File content (only for files, optional for this schema)
// createdAt: timestamp // Timestamp when the document was created
