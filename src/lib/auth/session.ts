import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

export interface Session {
 userId: string;
 username: string;
 role: "ADMIN" | "STUDENT";
}

const SESSION_COOKIE = "sat_alfa_session";
const SESSION_SECRET = process.env.SESSION_SECRET || "dev-secret-change-in-production";
const secretKey = new TextEncoder().encode(SESSION_SECRET);

export async function getSession(): Promise<Session | null> {
 const cookieStore = await cookies();
 const sessionCookie = cookieStore.get(SESSION_COOKIE);

 if (!sessionCookie?.value) {
 return null;
 }

 try {
 const { payload } = await jwtVerify(sessionCookie.value, secretKey);
 return payload as unknown as Session;
 } catch {
 return null;
 }
}

export async function setSession(session: Session): Promise<void> {
 const cookieStore = await cookies();
 
 const token = await new SignJWT({ ...session })
 .setProtectedHeader({ alg: "HS256" })
 .setIssuedAt()
 .setExpirationTime("7d")
 .sign(secretKey);

 // Set cookie with httpOnly for security
 cookieStore.set(SESSION_COOKIE, token, {
 httpOnly: true,
 secure: process.env.NODE_ENV === "production",
 sameSite: "lax",
 maxAge: 60 * 60 * 24 * 7, // 7 days
 path: "/",
 });
}

export async function clearSession(): Promise<void> {
 const cookieStore = await cookies();
 cookieStore.delete(SESSION_COOKIE);
}
