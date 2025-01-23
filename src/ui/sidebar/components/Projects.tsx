"use client";

import { NavItem } from "@/@types/sidebar";
import Link from "next/link";
import { FiPlusSquare, FiFolder, FiEdit2 } from "react-icons/fi";

const Projects = ({
  navConfig,
  editingId,
  setEditingId,
  addNewProject,
  addNewDirectory,
  handleEdit,
  handleKeyDown,
}: {
  navConfig: NavItem[];
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  addNewProject: () => void;
  addNewDirectory: () => void;
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
            title="Add new project"
          />
          <FiFolder
            className="w-5 h-5 cursor-pointer hover:text-gray-800"
            onClick={addNewDirectory}
            title="Add new folder"
          />
        </div>
      </div>
      <div className="space-y-1">
        {navConfig.map((item) => (
          <div
            key={item.href}
            className="group w-full flex items-center px-3 py-2 text-gray-600 rounded-md hover:bg-gray-100"
          >
            {editingId === item.slug ? (
              <>
                <span className="w-5 h-5 mr-3">
                  {item.type === "directory" ? <FiFolder /> : item.icon}
                </span>
                <input
                  type="text"
                  className="flex-1 bg-transparent outline-none border-b border-gray-400 focus:border-gray-600"
                  defaultValue={item.label}
                  autoFocus
                  onBlur={(e) => handleEdit(item.slug, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, item.slug)}
                  placeholder={`Enter ${item.type} name`}
                />
              </>
            ) : (
              <>
                {item.type === "directory" ? (
                  <div className="flex-1 flex items-center">
                    <span className="w-5 h-5 mr-3">
                      <FiFolder />
                    </span>
                    <span>{item.label}</span>
                  </div>
                ) : (
                  <Link href={item.href} className="flex-1 flex items-center">
                    <span className="w-5 h-5 mr-3">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                )}
                <FiEdit2
                  className="w-4 h-4 opacity-0 group-hover:opacity-100 cursor-pointer hover:text-gray-800 transition-opacity"
                  onClick={() => setEditingId(item.slug)}
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
