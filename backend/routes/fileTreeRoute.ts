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
    res.status(500).json({ error: "Failed to fetch tree" });
  }
});

router.patch("/nodes/batch-update-order", async (req, res) => {
  try {
    const { updates } = req.body;
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ error: "Invalid updates format" });
    }

    await fileTreeService.batchUpdateOrder(updates);
    res.status(200).send("Batch update order successful");
  } catch (error: any) {
    console.error("Failed to batch update orders:", error);
    res.status(500).json({
      error: "Failed to update node orders",
      details: error.message,
    });
  }
});

router.patch("/nodes/:nodeId/move", async (req, res) => {
  try {
    const { nodeId } = req.params;
    const { order, parentId } = req.body;

    try {
      await fileTreeService.updateNode(nodeId, { order, parentId });
      res.status(200).send("Node moved successfully");
    } catch (error: any) {
      console.error("Failed to move node", error);
      if (error.message.includes("does not exist")) {
        res.status(404).json({
          error: "Node not found",
          details: error.message,
        });
      } else {
        throw error;
      }
    }
  } catch (error: any) {
    console.error("Failed to move node:", error);
    res.status(500).json({
      error: "Failed to move node",
      details: error.message,
    });
  }
});

router.patch("/nodes/:nodeId", async (req, res) => {
  try {
    const { nodeId } = req.params;
    await fileTreeService.updateNode(nodeId, req.body);
    res.status(200).send("Node updated successfully");
  } catch (error: any) {
    res.status(500).json({ error });
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

export default router;
