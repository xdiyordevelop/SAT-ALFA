import { prisma } from"@/lib/db/prisma";
import { getSession } from"@/lib/auth/session";
import { NextRequest, NextResponse } from"next/server"; export async function GET( request: NextRequest, { params }: { params: Promise<{ id: string }> }
) { try { const { id } = await params; const session = await getSession(); if (!session || session.role !=="STUDENT") { return NextResponse.json( { message:"Unauthorized" }, { status: 401 } ); }
const test = await prisma.mockTest.findUnique({ where: { id }, }); if (!test || test.status !=="CONFIRMED") { return NextResponse.json( { message:"Test not found or not available" }, { status: 404 } ); } return NextResponse.json( { data: test }, { status: 200 } ); } catch (error) { console.error("Error fetching test:", error); return NextResponse.json( { message:"Failed to fetch test" }, { status: 500 } ); }
}
