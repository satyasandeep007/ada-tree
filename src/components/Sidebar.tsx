import Link from "next/link";
import { FiPlusSquare, FiFolder, FiMessageSquare } from "react-icons/fi";

const Sidebar = () => {
  return (
    <aside className="w-64 h-screen bg-[#f8f8f8] border-r border-gray-200 flex flex-col">
      {/* Workspace Header */}
      <div className="p-4 flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-green-500"></div>
        <h1 className="font-medium text-gray-800">Satya&apos;s Workspace</h1>
      </div>

      {/* Main Navigation */}
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

        {/* Projects Section */}
        <div className="mt-8">
          <div className="px-3 py-2 text-sm font-semibold text-gray-600 flex items-center gap-2">
            Private
            <div className="ml-auto flex items-center gap-2">
              <FiPlusSquare className="w-5 h-5" />
              <FiFolder className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <button className="w-full flex items-center px-3 py-2 text-gray-600 rounded-md hover:bg-gray-100">
              <span className="w-5 h-5 mr-3">🔑</span>
              <span>1</span>
            </button>
            <button className="w-full flex items-center px-3 py-2 text-gray-600 rounded-md hover:bg-gray-100">
              <span className="w-5 h-5 mr-3">📝</span>
              <span>Untitled</span>
            </button>
          </div>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
