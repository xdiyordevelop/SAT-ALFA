import { promises as fs } from'fs';
import path from'path';
import { NextRequest, NextResponse } from'next/server';
import { getSession } from'@/lib/auth/session';
import { prisma } from'@/lib/db/prisma'; const STORAGE_DIR = process.env.STORAGE_DIR ||'./public/uploads'; export async function GET( request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }
) { try { const session = await getSession(); if (!session) { return NextResponse.json({ error:'Unauthorized' }, { status: 401 }); }
const { slug } = await params; const storageSlug = slug.join('/'); const fullPath = path.join(/*turbopackIgnore: true*/ STORAGE_DIR, storageSlug); const realPath = await fs.realpath(/*turbopackIgnore: true*/ fullPath).catch(() => null); if (!realPath || !realPath.startsWith(path.resolve(/*turbopackIgnore: true*/ STORAGE_DIR))) { return NextResponse.json({ error:'Not found' }, { status: 404 }); }
const attachment = await prisma.mockTestAttachment.findFirst({ where: { storageKey: storageSlug }, include: { mockTest: true }, }); if (!attachment) { return NextResponse.json({ error:'Not found' }, { status: 404 }); } if (session.role !=='ADMIN') { const profile = await prisma.studentProfile.findUnique({ where: { userId: session.userId }, }); if (!profile || attachment.mockTest.studentId !== profile.id) { return NextResponse.json({ error:'Forbidden' }, { status: 403 }); } }
const file = await fs.readFile(/*turbopackIgnore: true*/ fullPath); return new NextResponse(file, { headers: {'Content-Type': attachment.fileType,'Content-Disposition':`attachment; filename="${attachment.fileName}"`,'Cache-Control':'private, max-age=3600', }, }); } catch (error) { console.error('Download error:', error); return NextResponse.json({ error:'Internal server error' }, { status: 500 }); }
}
