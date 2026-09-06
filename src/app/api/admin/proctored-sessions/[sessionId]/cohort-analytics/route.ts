import { NextRequest, NextResponse } from 'next/server';
import { getProctoredSessionCohortAnalytics } from '@/server/actions/proctor-analytics';
import { getSession } from '@/lib/auth/session';
import { isStaff } from '@/lib/permissions/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !isStaff(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await params;
    const result = await getProctoredSessionCohortAnalytics(sessionId);

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to fetch cohort analytics' }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Failed to get cohort analytics:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
