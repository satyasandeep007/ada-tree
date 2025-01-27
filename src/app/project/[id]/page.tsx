export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  return (
    <div className="p-4 text-gray-800">
      <h1 className="text-2xl font-medium">My Project: {id}</h1>
    </div>
  );
}
