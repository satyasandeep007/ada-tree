import { NavItem } from "@/@types/sidebar";
import { transformFileNodeToNavItem } from "@/utils/transformers";

const WS_URL = "ws://localhost:9292/api/file-trees";

type WebSocketMessage = {
  type: string;
  payload: Record<string, unknown>;
};

class FileTreeWebSocket {
  private ws: WebSocket | null = null;
  private messageQueue: WebSocketMessage[] = [];
  private isConnected = false;
  private reconnectAttempt = 0;
  private readonly maxReconnectAttempts = 5;
  private workspaceId: string = "";
  private onUpdateCallback: ((nodes: NavItem[]) => void) | null = null;
  private currentNodes: NavItem[] | null = null;
  private skipNextUpdate = false;

  subscribeToTree(
    workspaceId: string,
    onUpdate: (nodes: NavItem[]) => void
  ): () => void {
    this.workspaceId = workspaceId;
    this.onUpdateCallback = onUpdate;
    this.establishConnection();
    return () => this.disconnect();
  }

  private establishConnection() {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.ws = new WebSocket(`${WS_URL}/subscribe/${this.workspaceId}`);

    this.ws.onopen = () => {
      this.isConnected = true;
      this.reconnectAttempt = 0;
      this.processQueue();
    };

    this.ws.onmessage = (event) => {
      this.handleWebSocketMessage(event);
    };

    this.ws.onclose = () => {
      this.isConnected = false;
      if (this.reconnectAttempt < this.maxReconnectAttempts) {
        this.reconnectAttempt++;
        setTimeout(() => this.establishConnection(), 1000);
      }
    };
  }

  private handleWebSocketMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data);
      if (
        data.type === "update" &&
        this.onUpdateCallback &&
        !this.skipNextUpdate
      ) {
        const transformedNodes = data.nodes.map((node) =>
          transformFileNodeToNavItem(node, this.workspaceId)
        );
        this.currentNodes = transformedNodes;
        this.onUpdateCallback(transformedNodes);
      }
      this.skipNextUpdate = false;
    } catch (error) {
      console.error("Failed to process WebSocket message:", error);
    }
  }

  private sendMessage(message: WebSocketMessage) {
    if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      this.messageQueue.push(message);
    }
  }

  private processQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) this.sendMessage(message);
    }
  }

  createNode(node: Omit<NavItem, "id">): Promise<NavItem> {
    return new Promise((resolve, reject) => {
      const tempId = `temp-${Date.now()}`;
      if (this.currentNodes && this.onUpdateCallback) {
        const optimisticNode = { ...node, id: tempId };
        this.onUpdateCallback([...this.currentNodes, optimisticNode]);
      }

      const messageHandler = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "nodeCreated") {
            this.ws?.removeEventListener("message", messageHandler);
            const createdNode = transformFileNodeToNavItem(
              data.payload,
              this.workspaceId
            );
            if (this.currentNodes && this.onUpdateCallback) {
              const updatedNodes = this.currentNodes.map((n) =>
                n.id === tempId ? createdNode : n
              );
              this.onUpdateCallback(updatedNodes);
            }
            resolve(createdNode);
          }
        } catch (error) {
          reject(error);
        }
      };

      this.ws?.addEventListener("message", messageHandler);
      this.sendMessage({ type: "createNode", payload: node });
    });
  }

  updateNode(nodeId: string, updates: Partial<NavItem>) {
    if (this.currentNodes && this.onUpdateCallback) {
      const optimisticNodes = this.currentNodes.map((node) => {
        if (node.id === nodeId) {
          return { ...node, ...updates };
        }
        return node;
      });
      this.onUpdateCallback(optimisticNodes);
    }
    this.sendMessage({ type: "updateNode", payload: { id: nodeId, updates } });
  }

  toggleFolderState(nodeId: string, isOpen: boolean) {
    if (this.currentNodes && this.onUpdateCallback) {
      const optimisticNodes = this.currentNodes.map((node) => {
        if (node.id === nodeId) {
          return { ...node, isOpen };
        }
        return node;
      });
      this.onUpdateCallback(optimisticNodes);
    }
    this.sendMessage({ type: "toggleFolder", payload: { nodeId, isOpen } });
  }

  updateNodeOrderAndParent(
    nodeId: string,
    moveUpdates: { order: number; parentId: string | null },
    sourceParentId: string | null
  ) {
    if (this.currentNodes && this.onUpdateCallback) {
      const optimisticNodes = this.currentNodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            order: moveUpdates.order,
            parentId: moveUpdates.parentId,
          };
        }
        return node;
      });

      const movedNode = optimisticNodes.find((node) => node.id === nodeId);
      if (!movedNode) return;

      const destNodes = optimisticNodes.filter(
        (node) => node.parentId === moveUpdates.parentId && node.id !== nodeId
      );

      const beforeNodes = destNodes.slice(0, moveUpdates.order);
      const afterNodes = destNodes.slice(moveUpdates.order);

      const updateOrders = (nodes: NavItem[], startOrder: number) => {
        return nodes.map((node, index) => ({
          id: node.id,
          order: startOrder + index,
        }));
      };

      const orderUpdates = [
        ...updateOrders(beforeNodes, 0),
        { id: nodeId, order: moveUpdates.order },
        ...updateOrders(afterNodes, moveUpdates.order + 1),
      ];

      this.skipNextUpdate = true;
      this.currentNodes = optimisticNodes;
      this.onUpdateCallback(optimisticNodes);

      this.sendMessage({
        type: "updateNodeOrderAndParent",
        payload: {
          id: nodeId,
          updates: {
            order: moveUpdates.order,
            parentId: moveUpdates.parentId,
          },
          orderUpdates,
          sourceParentId,
          destinationParentId: moveUpdates.parentId,
        },
      });
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const fileTreeApi = new FileTreeWebSocket();
