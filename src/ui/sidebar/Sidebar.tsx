"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiPlusSquare, FiMessageSquare } from "react-icons/fi";
import { useState } from "react";
import Projects from "./components/Projects";
import { NavItem } from "@/@types/sidebar";
import { formatSlug } from "./components/util";
import { initialNavConfig, icons } from "./components/config";

const Sidebar = () => {
  const router = useRouter();
  const [navConfig, setNavConfig] = useState<NavItem[]>(initialNavConfig);
  const [editingId, setEditingId] = useState<string | null>(null);

  const addNewProject = () => {
    const newId = (navConfig.length + 1).toString();
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];
    const newSlug = formatSlug(`project-${newId}`);

    const newProject: NavItem = {
      href: `/project/${newSlug}`,
      icon: randomIcon,
      label: `Project ${newId}`,
      slug: newSlug,
    };

    setNavConfig([...navConfig, newProject]);
    setEditingId(newSlug);
  };

  const handleEdit = (oldSlug: string, newLabel: string) => {
    if (!newLabel.trim()) {
      if (
        navConfig
          .find((item) => item.slug === oldSlug)
          ?.label.startsWith("Project ")
      ) {
        setNavConfig(navConfig.filter((item) => item.slug !== oldSlug));
      }
      setEditingId(null);
      return;
    }

    const newSlug = formatSlug(newLabel);
    const newHref = `/project/${newSlug}`;

    setNavConfig(
      navConfig.map((item) => {
        if (item.slug === oldSlug) {
          return {
            ...item,
            label: newLabel,
            slug: newSlug,
            href: newHref,
          };
        }
        return item;
      })
    );
    setEditingId(null);

    router.push(newHref);
  };

  const handleKeyDown = (e: React.KeyboardEvent, slug: string) => {
    if (e.key === "Enter") {
      const target = e.target as HTMLInputElement;
      handleEdit(slug, target.value);
    }
    if (e.key === "Escape") {
      if (
        navConfig
          .find((item) => item.slug === slug)
          ?.label.startsWith("Project ")
      ) {
        setNavConfig(navConfig.filter((item) => item.slug !== slug));
      }
      setEditingId(null);
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
          handleEdit={handleEdit}
          handleKeyDown={handleKeyDown}
        />
      </nav>
    </aside>
  );
};

export default Sidebar;
