import { Session, UserRole } from "../auth/session";

export function requireAuth(session: Session | null): asserts session is Session {
  if (!session) {
    throw new Error("Authentication required");
  }
}

export function requireAdmin(session: Session | null): asserts session is Session {
  if (!session) {
    throw new Error("Authentication required");
  }
  if (session.role === "STUDENT") {
    throw new Error("Admin role required");
  }
}

export function requireSuperAdmin(session: Session | null): asserts session is Session {
  if (!session) {
    throw new Error("Authentication required");
  }
  if (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN") {
    throw new Error("Super Admin role required");
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

export function isStaff(session: Session | null): boolean {
  return !!session && session.role !== "STUDENT";
}

export function isSuperAdmin(session: Session | null): boolean {
  return session?.role === "SUPER_ADMIN" || session?.role === "ADMIN";
}

export function isTeacher(session: Session | null): boolean {
  return session?.role === "TEACHER";
}

export function isManager(session: Session | null): boolean {
  return session?.role === "MANAGER";
}

export function canManagePayments(session: Session | null): boolean {
  return isSuperAdmin(session) || isManager(session);
}

export function canManageAcademics(session: Session | null): boolean {
  return isSuperAdmin(session) || isTeacher(session);
}

export function canManageTeam(session: Session | null): boolean {
  return isSuperAdmin(session);
}

export function isAdmin(session: Session | null): boolean {
  return isStaff(session);
}

export function isStudent(session: Session | null): boolean {
  return session?.role === "STUDENT";
}
