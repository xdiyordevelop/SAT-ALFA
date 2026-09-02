import { Session } from "../auth/session";

export function requireAuth(session: Session | null): asserts session is Session {
 if (!session) {
 throw new Error("Authentication required");
 }
}
export function requireAdmin(session: Session | null): asserts session is Session {
 if (!session) {
 throw new Error("Authentication required");
 }
 if (session.role !== "ADMIN") {
 throw new Error("Admin role required");
 }
}
export function requireStudent(session: Session | null): asserts session is Session {
 if (!session) {
 throw new Error("Authentication required");
 }
 if (session.role !== "STUDENT") {
 throw new Error("Student role required");
 }
}
export function isAdmin(session: Session | null): boolean {
 return session?.role === "ADMIN";
}
export function isStudent(session: Session | null): boolean {
 return session?.role === "STUDENT";
}
