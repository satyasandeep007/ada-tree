export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  return (
    <div className="p-4 text-gray-800">
      <h1 className="text-2xl font-medium">
        My Project: <span className="text-gray-500 font-semibold">{id}</span>
      </h1>
    </div>
  );
}
