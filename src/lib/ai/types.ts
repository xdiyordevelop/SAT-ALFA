export interface TopicScore {
 title: string;
 percentCorrect: number;
 totalQuestions?: number;
 correctQuestions?: number;
}
export interface SkillBreakdown {
 topics: TopicScore[];
}
export interface BluebookAnalysis {
 totalScore: number;
 mathScore: number;
 englishScore: number;
 math: SkillBreakdown;
 english: SkillBreakdown;
}
export interface QuestionDetail {
 id: string;
 text: string;
 options: string[];
 correctAnswer: number;
 userAnswer?: number;
 isCorrect?: boolean;
 explanation?: string;
 section?: "Math" | "Reading and Writing" | "English";
 topic?: string;
}
export interface TopicPerformanceDetail {
 title: string;
 subject: "Math" | "English" | "Combined";
 percentCorrect: number;
 totalQuestions: number;
 correctQuestions: number;
 isStrong: boolean;
 isWeak: boolean;
}
export interface AIAnalysisOutput {
 testId?: string;
 summary: string;
 overallInsight: string;
 totalScore: number;
 mathScore: number;
 englishScore: number;
 mathAccuracy: number;
 englishAccuracy: number;
 overallAccuracy: number;
 strengths: string[];
 weaknesses: string[];
 topicPerformance: Record<string, number>;
 detailedTopics: TopicPerformanceDetail[];
 recommendations: string[];
 studyPriorities: string[];
 nextSteps: string[];
 analyzedAt: string;
}
export interface ScoreAnalysisResponse {
 success: boolean;
 testId?: string;
 fileName?: string;
 fileSize?: number;
 uploadedAt?: string;
 error?: string;
 math?: {
 totalScore: number;
 maxScore: number;
 strongPoints: string[];
 weakPoints: string[];
 recommendations: string[];
 };
 english?: {
 totalScore: number;
 maxScore: number;
 strongPoints: string[];
 weakPoints: string[];
 recommendations: string[];
 };
}
