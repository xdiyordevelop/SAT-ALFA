"use server";

import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";

export async function deleteArticle(id: string) {
 const session = await getSession();
 if (!session || session.role !== 'ADMIN') throw new Error('Unauthorized');

 await prisma.article.delete({ where: { id } });
 revalidatePath("/admin/articles");
 revalidatePath("/student/articles");
 return { success: true };
}

export async function saveParsedArticle(data: {
 title: string;
 slug?: string;
 category: string;
 summary: string;
 content: string;
 readTimeMin: number;
 vocabulary: unknown;
 published?: boolean;
}) {
 const session = await getSession();
 if (!session || session.role !== 'ADMIN') throw new Error('Unauthorized');

 if (!data.title || !data.content) {
 throw new Error("Article must have a title and content.");
 }

 const baseSlug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
 const slug = `${baseSlug}-${Date.now()}`;

 const article = await prisma.article.create({
 data: {
 title: data.title,
 slug,
 category: data.category,
 summary: data.summary || "",
 content: data.content,
 readTimeMin: data.readTimeMin || 5,
 vocabulary: data.vocabulary || [],
 published: data.published ?? false,
 },
 });

 revalidatePath("/admin/articles");
 return article;
}

export async function updateArticle(id: string, data: any) {
 const session = await getSession();
 if (!session || session.role !== 'ADMIN') throw new Error('Unauthorized');

 // STRICT WHITELIST OF ALLOWED FIELDS
 const allowedUpdates: any = {};
 
 if (data.title !== undefined) allowedUpdates.title = data.title;
 if (data.slug !== undefined) allowedUpdates.slug = data.slug;
 if (data.category !== undefined) allowedUpdates.category = data.category;
 if (data.summary !== undefined) allowedUpdates.summary = data.summary;
 if (data.content !== undefined) allowedUpdates.content = data.content;
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
