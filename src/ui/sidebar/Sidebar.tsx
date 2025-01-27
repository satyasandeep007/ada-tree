"use client";

import Link from "next/link";
import { FiPlusSquare, FiMessageSquare } from "react-icons/fi";
import { useState, useEffect } from "react";
import Projects from "./components/Projects";
import { NavItem } from "@/@types/sidebar";
import { formatSlug } from "./components/util";
import { icons } from "./components/config";
import { DropResult } from "@hello-pangea/dnd";
import { fileTreeApi } from "@/services/api";

const Sidebar = () => {
  const [navConfig, setNavConfig] = useState<NavItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const workspaceId = "satya";

  useEffect(() => {
    const unsubscribe = fileTreeApi.subscribeToTree(workspaceId, (nodes) => {
      setNavConfig(nodes);
    });

    return () => {
      unsubscribe();
    };
  }, [workspaceId]);

  const addNewProject = async () => {
    const order = navConfig.length;
    const newNode: Omit<NavItem, "id"> = {
      href: "#",
      icon: icons[Math.floor(Math.random() * icons.length)],
      name: "New Project",
      slug: formatSlug(`project-${order}`),
      type: "file",
      order,
      parentId: null,
    };

    try {
      const createdNode = await fileTreeApi.createNode(newNode);
      setEditingId(createdNode.id!);
    } catch (error) {
      console.error("Failed to create node:", error);
    }
  };

  const addNewDirectory = async () => {
    const order = navConfig.length;
    const newNode: Omit<NavItem, "id"> = {
      href: "#",
      icon: "📁",
      name: "New Folder",
      slug: formatSlug(`directory-${order}`),
      type: "folder",
      order,
      parentId: null,
    };

    try {
      const createdNode = await fileTreeApi.createNode(newNode);
      setEditingId(createdNode.id!);
    } catch (error) {
      console.error("Failed to create node:", error);
    }
  };

  const handleEdit = async (oldSlug: string, newLabel: string) => {
    const item = navConfig.find((item) => item.slug === oldSlug);
    if (!item) return;

    try {
      if (!newLabel.trim()) {
        if (item.name === "New Project" || item.name === "New Folder") {
          await fileTreeApi.deleteNode(item.id!);
        }
        setEditingId(null);
        return;
      }

      await fileTreeApi.updateNode(item.id!, { name: newLabel });
      setEditingId(null);
    } catch (error) {
      console.error("Failed to update node:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, slug: string) => {
    if (e.key === "Enter") {
      const target = e.target as HTMLInputElement;
      handleEdit(slug, target.value);
    }
    if (e.key === "Escape") {
      const item = navConfig.find((item) => item.slug === slug);
      if (item?.name === "New Project" || item?.name === "New Folder") {
        fileTreeApi.deleteNode(item.id!).catch(console.error);
      }
      setEditingId(null);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, draggableId } = result;

    if (!destination) return;

    const draggedItem = navConfig.find((item) => item.slug === draggableId);
    if (!draggedItem || !draggedItem.id) return;

    const previousConfig = [...navConfig];

    try {
      const itemsAtSameLevel = navConfig.filter((item) =>
        destination.droppableId === "root"
          ? item.parentId === null
          : item.parentId === destination.droppableId
      );

      const filteredItems = itemsAtSameLevel.filter(
        (item) => item.id !== draggedItem.id
      );

      filteredItems.splice(destination.index, 0, draggedItem);

      const orderUpdates = filteredItems.map((item, index) => ({
        id: item.id!,
        order: index,
      }));

      await fileTreeApi.updateNodeOrderAndParent(draggedItem.id, {
        order: destination.index,
        parentId:
          destination.droppableId === "root" ? null : destination.droppableId,
      });

      if (orderUpdates.length > 0) {
        await fileTreeApi.batchUpdateOrder(orderUpdates);
      }
    } catch (error) {
      console.error("Failed to update node positions:", error);
      setNavConfig(previousConfig);
    }
  };

  const handleToggleFolder = async (nodeId: string, isOpen: boolean) => {
    try {
      await fileTreeApi.toggleFolderState(nodeId, isOpen);
    } catch (error) {
      console.error("Failed to toggle folder:", error);
    }
  };

  return (
    <aside className="w-64 h-screen bg-[#f9f9f7] border-r border-gray-200 flex flex-col">
      <div className="p-4 flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-green-500"></div>
        <h1 className="font-medium text-gray-800">Satya&apos;s Workspace</h1>
      </div>

      <nav className="flex-1 px-2 py-4">
        <div className="space-y-2">
          <Link
            href="/feedback"
            className="flex items-center px-3 py-2 text-gray-600 rounded-md hover:bg-gray-100"
          >
            <FiMessageSquare className="w-5 h-5 mr-3" />
            Feedback
          </Link>
          <Link
            href="/new-project"
            className="flex items-center px-3 py-2 text-gray-600 rounded-md hover:bg-gray-100"
          >
            <FiPlusSquare className="w-5 h-5 mr-3" />
            New project
          </Link>
        </div>

        <Projects
          navConfig={navConfig}
          editingId={editingId}
          setEditingId={setEditingId}
          addNewProject={addNewProject}
          addNewDirectory={addNewDirectory}
          handleEdit={handleEdit}
          handleKeyDown={handleKeyDown}
          onDragEnd={handleDragEnd}
          onToggleFolder={handleToggleFolder}
        />
      </nav>
    </aside>
  );
};

export default Sidebar;
