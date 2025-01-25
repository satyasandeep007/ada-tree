"use client";

import { NavItem } from "@/@types/sidebar";
import { FiPlusSquare, FiFolder } from "react-icons/fi";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ProjectItem } from "./ProjectItem";
import { useState } from "react";

const Projects = ({
  navConfig,
  editingId,
  setEditingId,
  addNewProject,
  addNewDirectory,
  handleEdit,
  handleKeyDown,
  onDragEnd,
}: {
  navConfig: NavItem[];
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  addNewProject: () => void;
  addNewDirectory: () => void;
  handleEdit: (slug: string, newLabel: string) => void;
  handleKeyDown: (e: React.KeyboardEvent, slug: string) => void;
  onDragEnd: (event: DragEndEvent) => void;
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    onDragEnd(event);
  };

  const items = navConfig.map((item) => item.slug);
  const activeItem = navConfig.find((item) => item.slug === activeId);

  const organizeItems = (items: NavItem[]) => {
    const itemsByParent: { [key: string]: NavItem[] } = {};

    items.forEach((item) => {
      const parentId = item.parentId || "root";
      if (!itemsByParent[parentId]) {
        itemsByParent[parentId] = [];
      }
      itemsByParent[parentId].push(item);
    });

    return itemsByParent;
  };

  const organizedItems = organizeItems(navConfig);
  const rootItems = organizedItems["root"] || [];

  const renderItems = (items: NavItem[], level = 0) => {
    return items.map((item) => {
      const childItems = organizedItems[item.slug] || [];

      return (
        <div key={item.slug}>
          <ProjectItem
            item={item}
            editingId={editingId}
            setEditingId={setEditingId}
            handleEdit={handleEdit}
            handleKeyDown={handleKeyDown}
            level={level}
          />
          {item.type === "directory" && childItems.length > 0 && (
            <div className="ml-4">{renderItems(childItems, level + 1)}</div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="mt-8">
      <div className="px-3 py-2 text-sm font-semibold text-gray-600 flex items-center gap-2">
        Projects
        <div className="ml-auto flex items-center gap-2">
          <FiPlusSquare
            className="w-5 h-5 cursor-pointer hover:text-gray-800"
            onClick={addNewProject}
            title="Add new project"
          />
          <FiFolder
            className="w-5 h-5 cursor-pointer hover:text-gray-800"
            onClick={addNewDirectory}
            title="Add new folder"
          />
        </div>
      </div>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={(event) => {
          const { active, over } = event;
          if (!over) return;

          const activeItem = navConfig.find((item) => item.slug === active.id);
          const overItem = navConfig.find((item) => item.slug === over.id);

          if (!activeItem || !overItem) return;

          if (activeItem.type === "directory") {
            const isChild = (parentId: string | null | undefined): boolean => {
              if (!parentId) return false;
              if (parentId === activeItem.slug) return true;
              const parent = navConfig.find((item) => item.slug === parentId);
              return parent ? isChild(parent.parentId) : false;
            };

            if (isChild(overItem.parentId)) return;
          }
        }}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="space-y-1">{renderItems(rootItems)}</div>
        </SortableContext>
        <DragOverlay>
          {activeId && activeItem && (
            <div className="bg-white shadow-lg rounded-md">
              <ProjectItem
                item={activeItem}
                editingId={editingId}
                setEditingId={setEditingId}
                handleEdit={handleEdit}
                handleKeyDown={handleKeyDown}
                isDragging
                level={0}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default Projects;
