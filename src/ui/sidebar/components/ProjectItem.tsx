import { NavItem } from "@/@types/sidebar";
import { FiFolder, FiEdit2 } from "react-icons/fi";
import Link from "next/link";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ProjectItemProps {
  item: NavItem;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  handleEdit: (slug: string, newLabel: string) => void;
  handleKeyDown: (e: React.KeyboardEvent, slug: string) => void;
  isDragging?: boolean;
  level?: number;
}

export const ProjectItem = ({
  item,
  editingId,
  setEditingId,
  handleEdit,
  handleKeyDown,
  isDragging,
  level = 0,
}: ProjectItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: item.slug,
    data: {
      type: item.type,
      parentId: item.parentId,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.4 : 1,
    marginLeft: `${level * 1}rem`,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`group w-full flex items-center px-3 py-2 text-gray-600 rounded-md hover:bg-gray-100 ${
        isDragging ? "shadow-lg" : ""
      } ${item.type === "directory" ? "font-medium" : ""}`}
    >
      <div
        className="cursor-grab active:cursor-grabbing flex-1 flex items-center"
        {...listeners}
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
          </>
        )}
      </div>
      {!editingId && (
        <FiEdit2
          className="w-4 h-4 opacity-0 group-hover:opacity-100 cursor-pointer hover:text-gray-800 transition-opacity"
          onClick={() => setEditingId(item.slug)}
        />
      )}
    </div>
  );
};
