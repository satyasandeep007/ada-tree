/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { NavItem, ProjectsProps } from "@/@types/sidebar";
import { FiFile, FiFolder } from "react-icons/fi";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DroppableProvided,
  DraggableProvided,
  DraggableStateSnapshot,
} from "@hello-pangea/dnd";
import { ProjectItem } from "./ProjectItem";

const organizeItems = (items: NavItem[]) => {
  const itemsByParent: { [key: string]: NavItem[] } = {};

  items
    .sort((a, b) => a.order - b.order)
    .forEach((item) => {
      const parentId = item.parentId || "root";
      if (!itemsByParent[parentId]) {
        itemsByParent[parentId] = [];
      }
      itemsByParent[parentId].push(item);
    });

  return itemsByParent;
};

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
  const renderDraggableItems = (
    items: NavItem[],
    parentId: string = "root",
    level = 0
  ) => {
    return (
      <Droppable droppableId={parentId}>
        {(provided: DroppableProvided, snapshot: any) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`space-y-1 min-h-[4px] transition-colors duration-200 ${
              snapshot.isDraggingOver ? "bg-gray-100 rounded-md" : ""
            }`}
          >
            {items.map((item, index) => {
              const childItems = organizedItems[item.id!] || [];

              return (
                <Draggable key={item.id} draggableId={item.id!} index={index}>
                  {(
                    provided: DraggableProvided,
                    snapshot: DraggableStateSnapshot
                  ) => (
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

  return (
    <div className="mt-8">
      <div className="px-3 py-2 text-sm font-semibold text-gray-600 flex items-center gap-2">
        Projects
        <div className="ml-auto flex items-center gap-2">
          <FiFile
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
