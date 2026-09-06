'use server';

import { prisma } from '@/lib/db/prisma';
import { getSession } from '@/lib/auth/session';
import { isStaff } from '@/lib/permissions/auth';

export interface DomainBreakdown {
  domain: string;
  section: 'Reading & Writing' | 'Math';
  questionCount: number;
  totalAttempts: number;
  correctCount: number;
  accuracy: number;
  benchmark: 'strong' | 'moderate' | 'weak';
}

export interface SkillPerformance {
  skill: string;
  domain: string;
  section: 'Reading & Writing' | 'Math';
  questionCount: number;
  totalAttempts: number;
  correctCount: number;
  accuracy: number;
  status: 'strong' | 'moderate' | 'weak';
}

export interface MostMissedQuestion {
  questionId: string;
  module: number;
  questionNumber: number;
  prompt: string;
  passage?: string | null;
  domain: string;
  skill: string;
  format: string;
  options?: any;
  correctAnswer: string;
  explanation?: string | null;
  totalAttempts: number;
  incorrectCount: number;
  errorRate: number;
}

export interface ParticipantScoreRecord {
  participantId: string;
  studentId: string;
  studentName: string;
  email: string;
  groupName: string;
  status: string;
  totalScore: number | null;
  rwScore: number | null;
  mathScore: number | null;
  accuracy: number | null;
  fullscreenExitCount: number;
  completedAt: string | null;
  attemptId: string | null;
}

export interface CohortAnalyticsResult {
  session: {
    id: string;
    code: string;
    testName: string;
    testId: string;
    status: string;
    createdAt: string;
    scoredAt: string | null;
  };
  metrics: {
    totalEnrolled: number;
    completedCount: number;
    avgTotalScore: number;
    avgRWScore: number;
    avgMathScore: number;
    highestScore: number;
    lowestScore: number;
    overallAccuracy: number;
  };
  domainBreakdowns: DomainBreakdown[];
  strongSkills: SkillPerformance[];
  weakSkills: SkillPerformance[];
  mostMissedQuestions: MostMissedQuestion[];
  participants: ParticipantScoreRecord[];
}

function parseNumeric(val: string): number | null {
  if (!val) return null;
  const s = val.trim();
  if (s.includes('/')) {
    const parts = s.split('/');
    if (parts.length === 2) {
      const num = parseFloat(parts[0]);
      const den = parseFloat(parts[1]);
      if (!isNaN(num) && !isNaN(den) && den !== 0) {
        return num / den;
      }
    }
  }
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
}

function areAnswersEquivalent(userAnswer: string, correctAnswer: string, isFillIn: boolean): boolean {
  if (!userAnswer || !correctAnswer) return false;
  const normalize = (s: string) => s.trim().toLowerCase();
  const userNorm = normalize(userAnswer);
  const correctNorm = normalize(correctAnswer);

  if (userNorm === correctNorm) return true;

  const correctOptions = correctAnswer
    .split(/,|\bor\b/i)
    .map((opt) => opt.trim())
    .filter(Boolean);

  for (const opt of correctOptions) {
    if (normalize(opt) === userNorm) return true;
  }

  if (isFillIn) {
    const userVal = parseNumeric(userAnswer);
    if (userVal !== null) {
      for (const opt of correctOptions) {
        const correctVal = parseNumeric(opt);
        if (correctVal !== null && Math.abs(userVal - correctVal) < 0.002) {
          return true;
        }
      }
    }
  }

  return false;
}

function getSectionFromModule(moduleStr: string): 'Reading & Writing' | 'Math' {
  if (moduleStr === 'MODULE_1' || moduleStr === 'MODULE_2') {
    return 'Reading & Writing';
  }
  return 'Math';
}

function getModuleNum(moduleStr: string): number {
  if (moduleStr === 'MODULE_1') return 1;
  if (moduleStr === 'MODULE_2') return 2;
  if (moduleStr === 'MODULE_3') return 3;
  if (moduleStr === 'MODULE_4') return 4;
  return 1;
}

export async function getProctoredSessionCohortAnalytics(sessionId: string): Promise<{
  success: boolean;
  data?: CohortAnalyticsResult;
  error?: string;
}> {
  try {
    const session = await getSession();
    if (!session || !isStaff(session)) {
      return { success: false, error: 'Staff credentials required.' };
    }

    if (!sessionId) {
      return { success: false, error: 'Session ID is required.' };
    }

    // 1. Fetch the proctored session with test details and participants
    const proctoredSession = await prisma.proctoredSession.findUnique({
      where: { id: sessionId },
      include: {
        satTest: {
          include: {
            questions: {
              orderBy: [{ module: 'asc' }, { questionNumber: 'asc' }],
            },
          },
        },
        participants: {
          include: {
            student: {
              include: {
                group: { select: { name: true } },
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!proctoredSession) {
      return { success: false, error: 'Proctored session not found.' };
    }

    const test = proctoredSession.satTest;
    const questions = test.questions || [];
    const participants = proctoredSession.participants || [];
    const participantStudentIds = participants.map((p) => p.studentId);

    // 2. Fetch all completed student attempts for this test session
    const attempts = await prisma.studentTestAttempt.findMany({
      where: {
        satTestId: test.id,
        completedAt: { not: null },
        OR: [
          { proctorCode: proctoredSession.code },
          { proctorCode: proctoredSession.id },
          {
            studentId: { in: participantStudentIds },
            createdAt: {
              gte: new Date(new Date(proctoredSession.createdAt).getTime() - 2 * 60 * 60 * 1000),
            },
          },
        ],
      },
      include: {
        student: {
          include: {
            group: { select: { name: true } },
          },
        },
      },
      orderBy: { completedAt: 'desc' },
    });

    // De-duplicate attempts per student (keep latest or highest)
    const attemptsByStudentId = new Map<string, typeof attempts[0]>();
    for (const att of attempts) {
      if (!attemptsByStudentId.has(att.studentId)) {
        attemptsByStudentId.set(att.studentId, att);
      }
    }

    // 3. Question lookup map
    const questionMap = new Map<string, typeof questions[0]>();
    for (const q of questions) {
      questionMap.set(q.id, q);
    }

    // 4. Per-Question Aggregation
    interface QuestionStats {
      question: typeof questions[0];
      totalAttempts: number;
      correctCount: number;
      incorrectCount: number;
    }

    const questionStatsMap = new Map<string, QuestionStats>();
    for (const q of questions) {
      questionStatsMap.set(q.id, {
        question: q,
        totalAttempts: 0,
        correctCount: 0,
        incorrectCount: 0,
      });
    }

    // 5. Per-Domain and Per-Skill Aggregation
    interface GroupStats {
      name: string;
      domain: string;
      section: 'Reading & Writing' | 'Math';
      questionIds: Set<string>;
      totalAttempts: number;
      correctCount: number;
    }

    const domainStatsMap = new Map<string, GroupStats>();
    const skillStatsMap = new Map<string, GroupStats>();

    for (const q of questions) {
      const section = getSectionFromModule(q.module);
      const domainName = q.domain || (section === 'Math' ? 'General Math' : 'General Reading');
      const skillName = q.skill || domainName;

      if (!domainStatsMap.has(domainName)) {
        domainStatsMap.set(domainName, {
          name: domainName,
          domain: domainName,
          section,
          questionIds: new Set(),
          totalAttempts: 0,
          correctCount: 0,
        });
      }
      domainStatsMap.get(domainName)!.questionIds.add(q.id);

      if (!skillStatsMap.has(skillName)) {
        skillStatsMap.set(skillName, {
          name: skillName,
          domain: domainName,
          section,
          questionIds: new Set(),
          totalAttempts: 0,
          correctCount: 0,
        });
      }
      skillStatsMap.get(skillName)!.questionIds.add(q.id);
    }

    // 6. Process each student attempt
    const completedAttemptsList: typeof attempts[0][] = [];
    const participantRecords: ParticipantScoreRecord[] = [];

    for (const p of participants) {
      const att = attemptsByStudentId.get(p.studentId);
      let studentAccuracy: number | null = null;

      if (att) {
        completedAttemptsList.push(att);

        // Parse user answers or reviewIndex
        const userAnswers = (att.userAnswers as Record<string, string>) || {};
        const reviewIndex = Array.isArray(att.reviewIndex) ? (att.reviewIndex as any[]) : null;

        let studentCorrect = 0;
        let studentTotalAnswered = 0;

        for (const q of questions) {
          const qStats = questionStatsMap.get(q.id)!;
          let isCorrect = false;
          let hasAnswered = false;

          if (reviewIndex) {
            const reviewItem = reviewIndex.find((r) => r.questionId === q.id);
            if (reviewItem) {
              hasAnswered = true;
              isCorrect = Boolean(reviewItem.isCorrect);
            }
          }

          if (!hasAnswered) {
            const userAns = userAnswers[q.id];
            if (userAns !== undefined && userAns !== null && String(userAns).trim() !== '') {
              hasAnswered = true;
              isCorrect = areAnswersEquivalent(String(userAns), q.correctAnswer, q.format === 'FILL_IN');
            }
          }

          if (hasAnswered) {
            studentTotalAnswered++;
            qStats.totalAttempts++;
            if (isCorrect) {
              studentCorrect++;
              qStats.correctCount++;
            } else {
              qStats.incorrectCount++;
            }

            // Update domain stats
            const domainName = q.domain || (getSectionFromModule(q.module) === 'Math' ? 'General Math' : 'General Reading');
            const dStat = domainStatsMap.get(domainName);
            if (dStat) {
              dStat.totalAttempts++;
              if (isCorrect) dStat.correctCount++;
            }

            // Update skill stats
            const skillName = q.skill || domainName;
            const sStat = skillStatsMap.get(skillName);
            if (sStat) {
              sStat.totalAttempts++;
              if (isCorrect) sStat.correctCount++;
            }
          }
        }

        if (questions.length > 0) {
          studentAccuracy = Math.round((studentCorrect / questions.length) * 100);
        }
      }

      participantRecords.push({
        participantId: p.id,
        studentId: p.studentId,
        studentName: p.userName || `${p.student?.firstName || 'Student'} ${p.student?.lastName || ''}`.trim(),
        email: p.email || '',
        groupName: p.student?.group?.name || 'No Group',
        status: p.status,
        totalScore: att?.totalScore ?? p.score ?? null,
        rwScore: att?.rwScore ?? null,
        mathScore: att?.mathScore ?? null,
        accuracy: studentAccuracy,
        fullscreenExitCount: Math.max(p.fullscreenExitCount, att?.fullscreenExitCount || 0),
        completedAt: att?.completedAt ? new Date(att.completedAt).toISOString() : p.completedAt ? new Date(p.completedAt).toISOString() : null,
        attemptId: att?.id ?? null,
      });
    }

    // Sort participants by totalScore descending
    participantRecords.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));

    // 7. Calculate cohort high-level metrics
    const validScores = participantRecords.map((p) => p.totalScore).filter((s): s is number => typeof s === 'number' && s > 0);
    const validRWScores = participantRecords.map((p) => p.rwScore).filter((s): s is number => typeof s === 'number' && s > 0);
    const validMathScores = participantRecords.map((p) => p.mathScore).filter((s): s is number => typeof s === 'number' && s > 0);

    const avgTotalScore = validScores.length ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length) : 0;
    const avgRWScore = validRWScores.length ? Math.round(validRWScores.reduce((a, b) => a + b, 0) / validRWScores.length) : 0;
    const avgMathScore = validMathScores.length ? Math.round(validMathScores.reduce((a, b) => a + b, 0) / validMathScores.length) : 0;
    const highestScore = validScores.length ? Math.max(...validScores) : 0;
    const lowestScore = validScores.length ? Math.min(...validScores) : 0;

    let totalAllAttempts = 0;
    let totalAllCorrect = 0;
    for (const qStats of questionStatsMap.values()) {
      totalAllAttempts += qStats.totalAttempts;
      totalAllCorrect += qStats.correctCount;
    }
    const overallAccuracy = totalAllAttempts > 0 ? Math.round((totalAllCorrect / totalAllAttempts) * 100) : 0;

    // 8. Build Content Domain Breakdown
    const domainBreakdowns: DomainBreakdown[] = Array.from(domainStatsMap.values()).map((d) => {
      const accuracy = d.totalAttempts > 0 ? Math.round((d.correctCount / d.totalAttempts) * 100) : 0;
      let benchmark: 'strong' | 'moderate' | 'weak' = 'moderate';
      if (accuracy >= 75) benchmark = 'strong';
      else if (accuracy < 55) benchmark = 'weak';

      return {
        domain: d.name,
        section: d.section,
        questionCount: d.questionIds.size,
        totalAttempts: d.totalAttempts,
        correctCount: d.correctCount,
        accuracy,
        benchmark,
      };
    });

    // Sort domain breakdowns: Math first, then Reading & Writing
    domainBreakdowns.sort((a, b) => {
      if (a.section !== b.section) {
        return a.section === 'Math' ? -1 : 1;
      }
      return b.accuracy - a.accuracy;
    });

    // 9. Build Strong vs Weak Skills
    const allSkills: SkillPerformance[] = Array.from(skillStatsMap.values()).map((s) => {
      const accuracy = s.totalAttempts > 0 ? Math.round((s.correctCount / s.totalAttempts) * 100) : 0;
      let status: 'strong' | 'moderate' | 'weak' = 'moderate';
      if (accuracy >= 75) status = 'strong';
      else if (accuracy < 60) status = 'weak';

      return {
        skill: s.name,
        domain: s.domain,
        section: s.section,
        questionCount: s.questionIds.size,
        totalAttempts: s.totalAttempts,
        correctCount: s.correctCount,
        accuracy,
        status,
      };
    });

    const strongSkills = allSkills
      .filter((s) => s.accuracy >= 70 && s.totalAttempts > 0)
      .sort((a, b) => b.accuracy - a.accuracy);

    const weakSkills = allSkills
      .filter((s) => s.accuracy < 70 || s.totalAttempts === 0)
      .sort((a, b) => a.accuracy - b.accuracy);

    // 10. Build Most Missed Questions (Error Hotspots)
    const mostMissedQuestions: MostMissedQuestion[] = Array.from(questionStatsMap.values())
      .map(({ question: q, totalAttempts, correctCount, incorrectCount }) => {
        const errorRate = totalAttempts > 0 ? Math.round((incorrectCount / totalAttempts) * 100) : 0;

        let parsedOptions = q.options;
        if (typeof parsedOptions === 'string') {
          try {
            parsedOptions = JSON.parse(parsedOptions);
          } catch {
            parsedOptions = null;
          }
        }

        return {
          questionId: q.id,
          module: getModuleNum(q.module),
          questionNumber: q.questionNumber,
          prompt: q.prompt,
          passage: q.passage,
          domain: q.domain,
          skill: q.skill,
          format: q.format,
          options: parsedOptions,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          totalAttempts,
          incorrectCount,
          errorRate,
        };
      })
      .filter((q) => q.totalAttempts > 0 && q.errorRate > 0)
      .sort((a, b) => b.errorRate - a.errorRate)
      .slice(0, 10);

    return {
      success: true,
      data: {
        session: {
          id: proctoredSession.id,
          code: proctoredSession.code,
          testName: test.name,
          testId: test.id,
          status: proctoredSession.status,
          createdAt: proctoredSession.createdAt.toISOString(),
          scoredAt: proctoredSession.scoredAt?.toISOString() || null,
        },
        metrics: {
          totalEnrolled: participants.length,
          completedCount: participantRecords.filter((p) => p.status === 'COMPLETED' || p.totalScore !== null).length,
          avgTotalScore,
          avgRWScore,
          avgMathScore,
          highestScore,
          lowestScore,
          overallAccuracy,
        },
        domainBreakdowns,
        strongSkills,
        weakSkills,
        mostMissedQuestions,
        participants: participantRecords,
      },
    };
  } catch (error) {
    console.error('getProctoredSessionCohortAnalytics error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate cohort analytics',
    };
  }
}
