"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// This route has been superseded by /admin/articles/import which uses the real Gemini parser.
export default function CreateArticlePage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/articles/import");
  }, [router]);
  return null;
}
