import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import EditTopicClient from "./EditTopicClient";
export default async function EditTopicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }
  const { id } = await params;
  const topic = await prisma.topic.findUnique({
    where: { id },
    include: { groupProgress: true },
  });
  if (!topic) {
    redirect("/admin/topics");
  }
  return (
    <EditTopicClient
      topic={topic}
      username={session.username}
      role={session.role}
    />
  );
}
