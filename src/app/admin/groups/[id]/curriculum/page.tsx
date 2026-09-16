import { redirect } from "next/navigation";

export default async function GroupTopicsRoadmapPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/topics?tab=roadmap&groupId=${id}`);
}

