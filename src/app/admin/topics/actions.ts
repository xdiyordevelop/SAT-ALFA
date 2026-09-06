"use server";

import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";

import { createGroupNotification } from "@/server/actions/notification.actions";

export async function toggleTopicApproval(groupId: string, topicId: string, isApproved: boolean) {
 try {
 await prisma.groupTopicProgress.update({
 where: { groupId_topicId: { groupId, topicId } },
 data: { isApproved, approvedAt: isApproved ? new Date() : null }
 });

 if (isApproved) {
   const topic = await prisma.topic.findUnique({
     where: { id: topicId },
     select: { title: true }
   });
   await createGroupNotification(groupId, {
     title: "New Lesson Unlocked!",
     message: topic?.title ? `"${topic.title}" is now available to study.` : "A new lesson is now available in your syllabus.",
     type: "LESSON",
     link: "/student/topics"
   });
 }

 revalidatePath("/admin/topics");
 return { success: true };
 } catch (error) {
 return { success: false, error: "Failed to toggle approval" };
 }
}

export async function assignTopicToGroup(groupId: string, topicId: string) {
 try {
 const existing = await prisma.groupTopicProgress.findUnique({
 where: { groupId_topicId: { groupId, topicId } }
 });
 if (existing) return { success: false, error: "Topic already assigned to this group" };

 const maxOrder = await prisma.groupTopicProgress.findFirst({
 where: { groupId },
 orderBy: { order: 'desc' }
 });
 const order = maxOrder ? maxOrder.order + 1 : 1;

 await prisma.groupTopicProgress.create({
 data: { groupId, topicId, order, isApproved: false }
 });
 revalidatePath("/admin/topics");
 return { success: true };
 } catch (error) {
 return { success: false, error: "Failed to assign topic" };
 }
}

export async function removeTopicFromGroup(groupId: string, topicId: string) {
 try {
 await prisma.groupTopicProgress.delete({
 where: { groupId_topicId: { groupId, topicId } }
 });
 revalidatePath("/admin/topics");
 return { success: true };
 } catch (error) {
 return { success: false, error: "Failed to remove topic from group" };
 }
}

export async function reorderGroupSyllabus(groupId: string, items: { topicId: string, order: number }[]) {
 try {
 await prisma.$transaction(
 items.map(item => prisma.groupTopicProgress.update({
 where: { groupId_topicId: { groupId, topicId: item.topicId } },
 data: { order: item.order }
 }))
 );
 revalidatePath("/admin/topics");
 return { success: true };
 } catch (error) {
 return { success: false, error: "Failed to reorder syllabus" };
 }
}

export async function deleteTopic(topicId: string) {
 try {
 await prisma.topic.delete({ where: { id: topicId } });
 revalidatePath("/admin/topics");
 return { success: true };
 } catch (error) {
 return { success: false, error: "Failed to delete topic" };
 }
}
