export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;
  return (
    <div className="p-4 text-gray-800">
      <h1 className="text-2xl font-medium">My Project: {slug}</h1>
    </div>
  );
}
