/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { NavItem } from "@/@types/sidebar";
import { FiPlusSquare, FiFolder } from "react-icons/fi";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { ProjectItem } from "./ProjectItem";

interface ProjectsProps {
  navConfig: NavItem[];
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  addNewProject: () => void;
  addNewDirectory: () => void;
  handleEdit: (slug: string, newLabel: string) => void;
  handleKeyDown: (e: React.KeyboardEvent, slug: string) => void;
  onDragEnd: (result: DropResult) => void;
  onToggleFolder: (id: string, isOpen: boolean) => void;
}

const Projects = ({
  navConfig,
  editingId,
  setEditingId,
  addNewProject,
  addNewDirectory,
  handleEdit,
  handleKeyDown,
  onDragEnd,
  onToggleFolder,
}: ProjectsProps) => {
  const organizeItems = (items: NavItem[]) => {
    const itemsByParent: { [key: string]: NavItem[] } = {};

    // Debug log
    console.log("Organizing items:", items);

    items
      .sort((a, b) => a.order - b.order)
      .forEach((item) => {
        const parentId = item.parentId || "root";
        if (!itemsByParent[parentId]) {
          itemsByParent[parentId] = [];
        }
        itemsByParent[parentId].push(item);
      });

    // Debug log
    console.log("Organized items:", itemsByParent);
    return itemsByParent;
  };

  const renderDraggableItems = (
    items: NavItem[],
    parentId: string = "root",
    level = 0
  ) => {
    // Debug log
    console.log(`Rendering items for parent ${parentId}:`, items);
    console.log(`Current level: ${level}`);

    return (
      <Droppable droppableId={parentId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`space-y-1 min-h-[4px] transition-colors duration-200 ${
              snapshot.isDraggingOver ? "bg-gray-100 rounded-md" : ""
            }`}
          >
            {items.map((item, index) => {
              const childItems = organizedItems[item.id!] || [];
              console.log(`Child items for ${item.name}:`, childItems); // Debug log

              return (
                <Draggable key={item.id} draggableId={item.id!} index={index}>
                  {(provided, snapshot) => (
                    <div>
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={snapshot.isDragging ? "opacity-50" : ""}
                      >
                        <ProjectItem
                          item={item}
                          editingId={editingId}
                          setEditingId={setEditingId}
                          handleEdit={handleEdit}
                          handleKeyDown={handleKeyDown}
                          isDragging={snapshot.isDragging}
                          level={level}
                          dragHandleProps={provided.dragHandleProps}
                          onToggleFolder={onToggleFolder}
                        />
                      </div>
                      {item.type === "folder" && item.isOpen && (
                        <div
                          className={`ml-4 ${
                            snapshot.isDragging ? "hidden" : ""
                          }`}
                        >
                          {renderDraggableItems(
                            childItems,
                            item.id!,
                            level + 1
                          )}
                        </div>
                      )}
                      {snapshot.isDragging ? null : provided.placeholder}
                    </div>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    );
  };

  const organizedItems = organizeItems(navConfig);
  const rootItems = organizedItems["root"] || [];

  // Debug log
  console.log("Root items:", rootItems);

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
      <DragDropContext onDragEnd={onDragEnd}>
        {renderDraggableItems(rootItems)}
      </DragDropContext>
    </div>
  );
};

export default Projects;
