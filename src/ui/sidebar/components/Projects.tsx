"use client";

import { NavItem } from "@/@types/sidebar";
import Link from "next/link";
import { FiPlusSquare, FiFolder, FiEdit2 } from "react-icons/fi";

const Projects = ({
  navConfig,
  editingId,
  setEditingId,
  addNewProject,
  handleEdit,
  handleKeyDown,
}: {
  navConfig: NavItem[];
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  addNewProject: () => void;
  handleEdit: (slug: string, newLabel: string) => void;
  handleKeyDown: (e: React.KeyboardEvent, slug: string) => void;
}) => {
  return (
    <div className="mt-8">
      <div className="px-3 py-2 text-sm font-semibold text-gray-600 flex items-center gap-2">
        Projects
        <div className="ml-auto flex items-center gap-2">
          <FiPlusSquare
            className="w-5 h-5 cursor-pointer hover:text-gray-800"
            onClick={addNewProject}
          />
          <FiFolder className="w-5 h-5" />
        </div>
      </div>
      <div className="space-y-1">
        {navConfig.map((project) => (
          <div
            key={project.href}
            className="group w-full flex items-center px-3 py-2 text-gray-600 rounded-md hover:bg-gray-100"
          >
            {editingId === project.slug ? (
              <>
                <span className="w-5 h-5 mr-3">{project.icon}</span>
                <input
                  type="text"
                  className="flex-1 bg-transparent outline-none border-b border-gray-400 focus:border-gray-600"
                  defaultValue={project.label}
                  autoFocus
                  onBlur={(e) => handleEdit(project.slug, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, project.slug)}
                  placeholder="Enter project name"
                />
              </>
            ) : (
              <>
                <Link href={project.href} className="flex-1 flex items-center">
                  <span className="w-5 h-5 mr-3">{project.icon}</span>
                  <span>{project.label}</span>
                </Link>
                <FiEdit2
                  className="w-4 h-4 opacity-0 group-hover:opacity-100 cursor-pointer hover:text-gray-800 transition-opacity"
                  onClick={() => setEditingId(project.slug)}
                />
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Projects;
