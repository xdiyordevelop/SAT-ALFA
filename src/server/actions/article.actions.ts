"use server";

import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { canManageAcademics } from "@/lib/permissions/auth";

export async function deleteArticle(id: string) {
 const session = await getSession();
 if (!session || !canManageAcademics(session)) throw new Error('Unauthorized');

 await prisma.article.delete({ where: { id } });
 revalidatePath("/admin/articles");
 revalidatePath("/student/articles");
 return { success: true };
}

export async function toggleArticlePublish(id: string) {
  const session = await getSession();
  if (!session || !canManageAcademics(session)) throw new Error("Unauthorized");

  const existing = await prisma.article.findUnique({
    where: { id },
    select: { published: true, slug: true, title: true },
  });
  if (!existing) throw new Error("Article not found");

  const updated = await prisma.article.update({
    where: { id },
    data: { published: !existing.published },
  });

  if (updated.published) {
    try {
      const { createBroadcastNotification } = await import("@/server/actions/notification.actions");
      await createBroadcastNotification({
        title: "New Article Published",
        message: `"${existing.title}" is now available. Read it to sharpen your reading & vocab skills!`,
        type: "ARTICLE",
        link: `/student/articles/${existing.slug}`
      });
    } catch (err) {
      console.error("Failed to send article notification:", err);
    }
  }

  revalidatePath("/admin/articles");
  revalidatePath("/student/articles");
  revalidatePath(`/student/articles/${existing.slug}`);
  return { success: true, published: updated.published };
}

export async function bulkSetArticlePublish(ids: string[], published: boolean) {
  const session = await getSession();
  if (!session || !canManageAcademics(session)) throw new Error("Unauthorized");

  if (!ids || ids.length === 0) return { success: true, count: 0 };

  const result = await prisma.article.updateMany({
    where: { id: { in: ids } },
    data: { published },
  });

  revalidatePath("/admin/articles");
  revalidatePath("/student/articles");
  return { success: true, count: result.count };
}

export async function bulkDeleteArticles(ids: string[]) {
  const session = await getSession();
  if (!session || !canManageAcademics(session)) throw new Error("Unauthorized");

  if (!ids || ids.length === 0) return { success: true, count: 0 };

  const result = await prisma.article.deleteMany({
    where: { id: { in: ids } },
  });

  revalidatePath("/admin/articles");
  revalidatePath("/student/articles");
  return { success: true, count: result.count };
}

export async function createArticle(data: {
  title: string;
  slug?: string;
  category: string;
  summary?: string;
  content: string;
  coverImage?: string | null;
  readTimeMin?: number;
  vocabulary?: unknown;
  published?: boolean;
}) {
  const session = await getSession();
  if (!session || !canManageAcademics(session)) throw new Error("Unauthorized");

  if (!data.title?.trim() || !data.content?.trim()) {
    throw new Error("Article must have a title and content.");
  }

  const rawSlug = (data.slug?.trim() || data.title.trim())
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const baseSlug = rawSlug || "article";
  let slug = baseSlug;

  const existing = await prisma.article.findUnique({ where: { slug } });
  if (existing) {
    slug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;
  }

  const article = await prisma.article.create({
    data: {
      title: data.title.trim(),
      slug,
      category: data.category || "STRATEGY",
      summary: data.summary?.trim() || "",
      content: data.content,
      coverImage: data.coverImage || null,
      readTimeMin:
        data.readTimeMin ||
        Math.max(1, Math.ceil(data.content.split(/\s+/).length / 200)),
      vocabulary: data.vocabulary || [],
      published: data.published ?? false,
    },
  });

  if (article.published) {
    try {
      const { createBroadcastNotification } = await import("@/server/actions/notification.actions");
      await createBroadcastNotification({
        title: "New Article Published",
        message: `"${article.title}" is now available. Read it to sharpen your reading & vocab skills!`,
        type: "ARTICLE",
        link: `/student/articles/${article.slug}`,
      });
    } catch (err) {
      console.error("Failed to send article notification:", err);
    }
  }

  revalidatePath("/admin/articles");
  revalidatePath("/student/articles");
  return article;
}

export async function saveParsedArticle(data: {
  title: string;
  slug?: string;
  category: string;
  summary: string;
  content: string;
  coverImage?: string | null;
  readTimeMin: number;
  vocabulary: unknown;
  published?: boolean;
}) {
  const session = await getSession();
  if (!session || !canManageAcademics(session)) throw new Error("Unauthorized");

  if (!data.title || !data.content) {
    throw new Error("Article must have a title and content.");
  }

  const baseSlug =
    data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const slug = `${baseSlug}-${Date.now()}`;

  const article = await prisma.article.create({
    data: {
      title: data.title,
      slug,
      category: data.category,
      summary: data.summary || "",
      content: data.content,
      coverImage: data.coverImage || null,
      readTimeMin: data.readTimeMin || 5,
      vocabulary: data.vocabulary || [],
      published: data.published ?? false,
    },
  });

  if (article.published) {
    try {
      const { createBroadcastNotification } = await import("@/server/actions/notification.actions");
      await createBroadcastNotification({
        title: "New Article Published",
        message: `"${article.title}" is now available. Read it to sharpen your reading & vocab skills!`,
        type: "ARTICLE",
        link: `/student/articles/${article.slug}`,
      });
    } catch (err) {
      console.error("Failed to send article notification:", err);
    }
  }

  revalidatePath("/admin/articles");
  revalidatePath("/student/articles");
  return article;
}

export async function updateArticle(id: string, data: any) {
 const session = await getSession();
 if (!session || !canManageAcademics(session)) throw new Error('Unauthorized');

 // STRICT WHITELIST OF ALLOWED FIELDS
 const allowedUpdates: any = {};
 
 if (data.title !== undefined) allowedUpdates.title = data.title;
 if (data.slug !== undefined) allowedUpdates.slug = data.slug;
 if (data.category !== undefined) allowedUpdates.category = data.category;
 if (data.summary !== undefined) allowedUpdates.summary = data.summary;
 if (data.content !== undefined) allowedUpdates.content = data.content;
 if (data.coverImage !== undefined) allowedUpdates.coverImage = data.coverImage || null;
 if (data.readTimeMin !== undefined) allowedUpdates.readTimeMin = Number(data.readTimeMin);
 if (data.vocabulary !== undefined) allowedUpdates.vocabulary = data.vocabulary;
 if (data.published !== undefined) allowedUpdates.published = Boolean(data.published);

 const article = await prisma.article.update({
 where: { id },
 data: allowedUpdates,
 });
 
 revalidatePath("/admin/articles");
 revalidatePath("/student/articles");
 revalidatePath(`/student/articles/${article.slug}`);
 return article;
}
