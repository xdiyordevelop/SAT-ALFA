"use client";

import { useEffect, useState } from "react";

interface Session {
 userId: string;
 username: string;
 role: "ADMIN" | "STUDENT";
}

export function useSession() {
 const [session, setSession] = useState<Session | null>(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 const loadSession = async () => {
 try {
 // In a real app, you'd fetch from an API endpoint
 // For now, we'll just return null since getSession is server-only
 setSession(null);
 } catch (err) {
 setSession(null);
 } finally {
 setLoading(false);
 }
 };

 loadSession();
 }, []);

 return session;
}

