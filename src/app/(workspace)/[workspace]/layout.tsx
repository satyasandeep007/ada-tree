import { Sidebar } from "@/ui";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 bg-white">{children}</main>
    </div>
  );
}
