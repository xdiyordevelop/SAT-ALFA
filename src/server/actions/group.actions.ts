"use server";

import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { isStaff, canManagePayments } from "@/lib/permissions/auth";
import { revalidatePath } from "next/cache";

export async function createGroup(data: {
 name: string;
 monthlyFee: number;
 description?: string;
}) {
 const session = await getSession();

 if (!session || !canManagePayments(session)) {
 throw new Error("Unauthorized: Only Administrators and Managers can create groups");
 }

 const existingGroup = await prisma.group.findUnique({
 where: { name: data.name },
 });

 if (existingGroup) {
 throw new Error("Group name already exists");
 }

 const group = await prisma.group.create({
 data: {
 name: data.name,
 monthlyFee: data.monthlyFee,
 description: data.description || null,
 status: "ACTIVE",
 },
 });

 revalidatePath("/admin/groups");
 return group;
}

export async function updateGroup(groupId: string, data: {
 name?: string;
 monthlyFee?: number;
 description?: string;
}) {
 const session = await getSession();

 if (!session || !canManagePayments(session)) {
 throw new Error("Unauthorized: Only Administrators and Managers can update groups");
 }

 const group = await prisma.group.update({
 where: { id: groupId },
 data: {
 name: data.name,
 monthlyFee: data.monthlyFee,
 description: data.description,
 },
 });

 revalidatePath("/admin/groups");
 revalidatePath(`/admin/groups/${groupId}`);
 return group;
}

export async function addStudentToGroup(groupId: string, studentId: string) {
 const session = await getSession();

 if (!session || !isStaff(session)) {
 throw new Error("Unauthorized");
 }

 const group = await prisma.group.findUnique({
 where: { id: groupId },
 });

 if (!group) {
 throw new Error("Group not found");
 }

 await prisma.studentProfile.update({
 where: { id: studentId },
 data: { groupId },
 });

 revalidatePath(`/admin/groups/${groupId}`);
 revalidatePath("/admin/payments");
 return { success: true };
}

export async function removeStudentFromGroup(studentId: string, groupId: string) {
 const session = await getSession();

 if (!session || !isStaff(session)) {
 throw new Error("Unauthorized");
 }

 await prisma.studentProfile.update({
 where: { id: studentId },
 data: { groupId: null },
 });

 revalidatePath(`/admin/groups/${groupId}`);
 revalidatePath("/admin/payments");
 return { success: true };
}

export async function deleteGroup(groupId: string) {
  const session = await getSession();

  if (!session || !canManagePayments(session)) {
    throw new Error("Unauthorized: Only Administrators and Managers can delete groups");
  }

 await prisma.group.delete({
 where: { id: groupId },
 });

 revalidatePath("/admin/groups");
 return { success: true };
}

export async function getGroupDetails(groupId: string) {
 const session = await getSession();

 if (!session || !isStaff(session)) {
 throw new Error("Unauthorized");
 }

 const group = await prisma.group.findUnique({
 where: { id: groupId },
 include: {
 studentProfiles: {
 include: {
 user: {
 select: {
 username: true
 }
 }
 }
 },
 },
 });

 if (!group) {
 throw new Error("Group not found");
 }

 return group;
}
