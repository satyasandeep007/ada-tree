import { WebSocket, WebSocketServer as Server } from "ws";
import { FileTreeService } from "../services/fileTreeService";
import http from "http";
import { parse } from "url";
import { FileTreeNode, UpdateFileTreeNode } from "../types/fileTree";

interface ExtendedWebSocket extends WebSocket {
  workspaceId?: string;
  isAlive?: boolean;
}

type WebSocketMessage = {
  type: string;
  payload: Record<string, unknown>;
};

let wss: Server | null = null;
const fileTreeService = new FileTreeService();
const connectedClients = new Map<string, Set<ExtendedWebSocket>>();

export const initializeWebSocketServer = (server: http.Server) => {
  wss = new Server({ noServer: true });
  console.log("WebSocket server initialized");

  const pingInterval = setInterval(() => {
    if (!wss) return;

    wss.clients.forEach((ws: ExtendedWebSocket) => {
      if (!ws.isAlive) {
        if (ws.workspaceId) {
          connectedClients.get(ws.workspaceId)?.delete(ws);
        }
        return ws.terminate();
      }

      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on("close", () => {
    clearInterval(pingInterval);
  });

  server.on("upgrade", async (request, socket, head) => {
    try {
      if (!request.url) {
        socket.destroy();
        return;
      }

      const { pathname } = parse(request.url);

      if (pathname?.startsWith("/api/file-trees/subscribe/")) {
        const workspaceId = pathname.split("/").pop();
        if (!workspaceId) {
          socket.destroy();
          return;
        }

        wss!.handleUpgrade(request, socket, head, (ws) => {
          setupWebSocketConnection(ws as ExtendedWebSocket, workspaceId);
        });
      } else {
        socket.destroy();
      }
    } catch (error) {
      console.error("Error during WebSocket upgrade:", error);
      socket.destroy();
    }
  });
};

export const setupWebSocketConnection = (
  ws: ExtendedWebSocket,
  workspaceId: string
) => {
  ws.workspaceId = workspaceId;
  ws.isAlive = true;

  if (!connectedClients.has(workspaceId)) {
    connectedClients.set(workspaceId, new Set());
  }
  connectedClients.get(workspaceId)!.add(ws);

  ws.on("pong", () => {
    ws.isAlive = true;
  });

  ws.on("message", async (message: string) => {
    try {
      const data: WebSocketMessage = JSON.parse(message);
      const { type, payload } = data;

      switch (type) {
        case "createNode":
          const createdNode = await fileTreeService.createNode(
            workspaceId,
            payload as Omit<FileTreeNode, "id" | "createdAt" | "updatedAt">
          );
          ws.send(
            JSON.stringify({ type: "nodeCreated", payload: createdNode })
          );
          break;

        case "updateNode":
          await fileTreeService.updateNode(
            payload.id as string,
            payload.updates as UpdateFileTreeNode
          );
          break;

        case "toggleFolder":
          await fileTreeService.toggleFolderState(
            payload.nodeId as string,
            payload.isOpen as boolean
          );
          break;

        case "updateNodeOrderAndParent":
          await fileTreeService.updateNode(
            payload.id as string,
            payload.updates as UpdateFileTreeNode
          );
          break;

        default:
          console.warn(`Unknown message type: ${type}`);
      }
    } catch (error) {
      console.error("Error processing message:", error);
      ws.send(
        JSON.stringify({ type: "error", payload: (error as Error).message })
      );
    }
  });

  const unsubscribe = fileTreeService.subscribeToWorkspaceTree(
    workspaceId,
    (nodes) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "update", nodes }));
      }
    }
  );

  ws.on("close", () => {
    connectedClients.get(workspaceId)?.delete(ws);
    if (connectedClients.get(workspaceId)?.size === 0) {
      connectedClients.delete(workspaceId);
    }
    unsubscribe();
  });

  fileTreeService.getTreeByWorkspace(workspaceId).then((nodes) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "update", nodes }));
    }
  });
};
