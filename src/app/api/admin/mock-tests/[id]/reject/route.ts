import { NextResponse } from"next/server";
import { rejectMockTestAction } from"@/server/actions/mock-test.actions"; export async function POST( request: Request, { params }: { params: Promise<{ id: string }> }
) { try { const { id } = await params; const body = await request.json(); const reason = body?.reason ||""; const result = await rejectMockTestAction(id, reason); if (result.error) { return NextResponse.json( { error: result.error }, { status: result.error.includes("Unauthorized") ? 403 : 400 } ); } return NextResponse.json( { success: true, message: result.message, test: result.test, }, { status: 200 } ); } catch (error) { return NextResponse.json( { error: error instanceof Error ? error.message :"Failed to reject test" }, { status: 500 } ); }
}
