export interface AttemptRecord {
 id: string;
 studentName: string;
  groupName?: string
 testName: string;
 completedAt: Date;
 rwScore: number | null;
 mathScore: number | null;
 totalScore: number | null;
 rwRaw: number | null;
 mathRaw: number | null;
}

export interface PerformanceMetric {
 domain: string;
 avgAccuracy: number;
 totalQuestions: number;
 correctQuestions: number;
}

export interface ScoreDistribution {
 range: string;
 count: number;
 percentage: number;
}

export interface AnalyticsSummary {
 totalAttempts: number;
 completedAttempts: number;
 avgTotalScore: number;
 avgRWScore: number;
 avgMathScore: number;
 completionRate: number;
 scoreDistribution: ScoreDistribution[];
 performanceByDomain: PerformanceMetric[];
 completionsOverTime?: { date: string; count: number }[];
}