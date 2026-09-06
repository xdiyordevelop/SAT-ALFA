"use server";

import { getSession as getSessionCookie, setSession, clearSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { loginSchema } from "@/lib/validation/schemas";
import { verifyPassword } from "@/lib/utils/helpers";

export async function loginAction(formData: { username: string; password: string }) {
 try {
 const validated = loginSchema.parse(formData);
 const normalizedUsername = validated.username.trim().toLowerCase();

 // Check if user exists in database
 const user = await prisma.user.findUnique({
 where: { username: normalizedUsername },
 include: {
 student: true
 }
 });

 if (!user) {
 return { error: "Invalid username or password", success: false };
 }

 if (user.role === "STUDENT" && user.student?.status !== "ACTIVE") {
 return { error: "Your account is not active. Please contact administrator.", success: false };
 }

 const passwordValid = await verifyPassword(validated.password, user.passwordHash);
 if (!passwordValid) {
 return { error: "Invalid username or password", success: false };
 }

  const session = {
    userId: user.id,
    username: user.username,
    role: user.role as import("@/lib/auth/session").UserRole,
  };

  await setSession(session);

  // Return success with redirect URL instead of calling redirect()
  const redirectUrl = user.role !== "STUDENT" ? "/admin/dashboard" : "/student/dashboard";
  return { success: true, redirectUrl };
 } catch (error) {
 const message = error instanceof Error ? error.message : "Login failed";
 return { error: message, success: false };
 }
}

export async function logoutAction() {
 await clearSession();
 const { redirect } = await import("next/navigation");
 redirect("/login");
}

export async function getCurrentSession() {
 return await getSessionCookie();
}
