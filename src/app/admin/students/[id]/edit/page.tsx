import { redirect } from "next/navigation";

interface StudentEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentEditPage({ params }: StudentEditPageProps) {
  const { id } = await params;
  redirect(`/admin/students/${id}?edit=true`);
}
