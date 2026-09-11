import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { processSessionScores } from '@/lib/ai/scoring-engine';

export async function POST(req: Request) {
 try {
 const body = await req.json();
 const { sessionId } = body;

 if (!sessionId) {
 return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
 }

 // Optionally check if the user is an admin here if you have auth configured
 // const session = await getServerSession();
 // if (session?.user?.role !== 'ADMIN') {
 // return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
 // }

 // Start background scoring process (we don't await the entire thing if we want to return quickly,
 // or we await it if we want the client to block. Since it has rate limits, we should probably
 // run it asynchronously, but for Vercel functions, background execution requires specific handling.
 // For now, we will await it since Vercel Pro has 5 min limits, but ideally this is an Inngest/Trigger.dev job).

 // Check if session exists
 const session = await prisma.proctoredSession.findUnique({
 where: { id: sessionId }
 });

 if (!session) {
 return NextResponse.json({ error: 'Session not found' }, { status: 404 });
 }

 // Wait for the score processing to finish
 const result = await processSessionScores(sessionId);
 return NextResponse.json(result);
 } catch (error: any) {
 console.error('[API] Error in score-session:', error.message);
 return NextResponse.json({ error: error.message }, { status: 500 });
 }
}