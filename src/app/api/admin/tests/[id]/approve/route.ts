import { NextResponse } from"next/server";
import { approveMockTestAction } from"@/server/actions/mock-test.actions"; export async function PATCH( request: Request, { params }: { params: Promise<{ id: string }> }
) { try { const { id } = await params; const result = await approveMockTestAction(id); if (result.error) { return NextResponse.json( { error: result.error }, { status: result.error.includes("Unauthorized") ? 403 : 400 } ); } return NextResponse.json( { success: true, message: result.message, test: result.test, }, { status: 200 } ); } catch (error) { return NextResponse.json( { error: error instanceof Error ? error.message :"Failed to approve test" }, { status: 500 } ); }
}
