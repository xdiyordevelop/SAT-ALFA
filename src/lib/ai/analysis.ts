import { TopicScore, AIAnalysisOutput, TopicPerformanceDetail } from "./types";

export interface AnalysisRequest {
 testId: string;
 studentId: string;
 testName: string;
 subject: string;
 questions?: any[];
 answers?: number[];
 score?: number | null;
 maxScore?: number;
 mathScore?: number | null;
 englishScore?: number | null;
 totalScore?: number | null;
 mathTopics?: TopicScore[];
 englishTopics?: TopicScore[];
}

const STRONG_THRESHOLD = 80;
const WEAK_THRESHOLD = 70;

const TOPIC_RECOMMENDATION_MAP: Record<string, string[]> = {
 "Algebra": [
 "Master linear equations, systems of linear equations, and linear inequalities.",
 "Practice interpreting linear functions and algebraic modeling in word problems.",
 ],
 "Advanced Math": [
 "Focus on quadratic equations, factoring techniques, and polynomial operations.",
 "Review exponential equations, functions, and nonlinear coordinate geometry.",
 ],
 "Problem-Solving and Data Analysis": [
 "Practice unit conversions, percentage change, and ratio/proportion problems.",
 "Strengthen interpretation of two-way tables, scatterplots, and data distributions.",
 ],
 "Geometry and Trigonometry": [
 "Review geometric area, volume formulas, and right-triangle trigonometry (SOH CAH TOA).",
 "Practice circle equations, arc lengths, and angle theorems.",
 ],
 "Information and Ideas": [
 "Focus on reading synthesis, central idea identification, and command of evidence.",
 "Practice textual and quantitative inference questions using College Board passages.",
 ],
 "Craft and Structure": [
 "Strengthen vocabulary-in-context skills and analyzing author's purpose and tone.",
 "Practice understanding rhetorical structure and cross-text comparisons.",
 ],
 "Expression of Ideas": [
 "Review transitions, rhetorical synthesis (bullet-point synthesis), and precision.",
 "Practice sentence placement and organizing paragraph ideas logically.",
 ],
 "Standard English Conventions": [
 "Master punctuation rules (semicolons, colons, em-dashes, commas) and clause boundaries.",
 "Review subject-verb agreement, pronoun-antecedent agreement, and modifier placement.",
 ],
};

/**
 * Main AI Analysis entry point.
 * Computes deterministic, accurate analytical insights based on actual student performance,
 * with provider interface for LLM extensions (OpenAI / Anthropic).
 */
export async function analyzeTestPerformance(
 request: AnalysisRequest
): Promise<AIAnalysisOutput> {
 const apiKey = process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY;

 // If external LLM key is configured, optionally generate enriched analysis
 if (apiKey) {
 try {
 return await generateLLMAnalysis(request);
 } catch (err) {
 console.warn("LLM analysis failed, falling back to rule-based engine:", err);
 }
 }

 return generateAccurateAnalysis(request);
}

/**
 * Deterministic, accurate analysis engine that processes actual scores and questions/topics.
 */
export function generateAccurateAnalysis(request: AnalysisRequest): AIAnalysisOutput {
 const strengths: string[] = [];
 const weaknesses: string[] = [];
 const recommendations: string[] = [];
 const topicPerformance: Record<string, number> = {};
 const detailedTopics: TopicPerformanceDetail[] = [];

 // Parse questions and answers if available
 let questions: any[] = [];
 if (typeof request.questions === "string") {
 try {
 questions = JSON.parse(request.questions);
 } catch {
 questions = [];
 }
 } else if (Array.isArray(request.questions)) {
 questions = request.questions;
 }

 const answers: number[] = Array.isArray(request.answers) ? request.answers : [];

 // Compute question-based topic breakdown if online test with questions
 if (questions.length > 0) {
 const topicStats: Record<string, { total: number; correct: number; section: "Math" | "English" | "Combined" }> = {};

 questions.forEach((q, idx) => {
 const isCorrect = answers[idx] !== undefined && answers[idx] === q.correctAnswer;
 const topic = q.topic || (q.section === "Math" ? "General Math" : "General Reading/Writing");
 const section = q.section === "Math" ? "Math" : q.section === "English" || q.section === "Reading and Writing" ? "English" : "Combined";

 if (!topicStats[topic]) {
 topicStats[topic] = { total: 0, correct: 0, section };
 }
 topicStats[topic].total += 1;
 if (isCorrect) {
 topicStats[topic].correct += 1;
 }
 });

 Object.entries(topicStats).forEach(([title, stats]) => {
 const pct = Math.round((stats.correct / stats.total) * 100);
 topicPerformance[title] = pct;
 const isStrong = pct >= STRONG_THRESHOLD;
 const isWeak = pct < WEAK_THRESHOLD;

 detailedTopics.push({
 title,
 subject: stats.section,
 percentCorrect: pct,
 totalQuestions: stats.total,
 correctQuestions: stats.correct,
 isStrong,
 isWeak,
 });

 if (isStrong) {
 strengths.push(`${name} (${pct}% accuracy)`);
 } else if (isWeak) {
 weaknesses.push(`${name} (${pct}% accuracy)`);
 }
 });
 }

 // Incorporate explicit mathTopics
 if (request.mathTopics && request.mathTopics.length > 0) {
 request.mathTopics.forEach((t) => {
 topicPerformance[t.title] = t.percentCorrect;
 const isStrong = t.percentCorrect >= STRONG_THRESHOLD;
 const isWeak = t.percentCorrect < WEAK_THRESHOLD;

 if (!detailedTopics.some((dt) => dt.title === t.title)) {
 detailedTopics.push({
 title: t.title,
 subject: "Math",
 percentCorrect: t.percentCorrect,
 totalQuestions: t.totalQuestions || 10,
 correctQuestions: t.correctQuestions || Math.round((t.percentCorrect / 100) * 10),
 isStrong,
 isWeak,
 });
 }

 if (isStrong) {
 strengths.push(`${t.title} (Math: ${t.percentCorrect}%)`);
 } else if (isWeak) {
 weaknesses.push(`${t.title} (Math: ${t.percentCorrect}%)`);
 }
 });
 }

 // Incorporate explicit englishTopics
 if (request.englishTopics && request.englishTopics.length > 0) {
 request.englishTopics.forEach((t) => {
 topicPerformance[t.title] = t.percentCorrect;
 const isStrong = t.percentCorrect >= STRONG_THRESHOLD;
 const isWeak = t.percentCorrect < WEAK_THRESHOLD;

 if (!detailedTopics.some((dt) => dt.title === t.title)) {
 detailedTopics.push({
 title: t.title,
 subject: "English",
 percentCorrect: t.percentCorrect,
 totalQuestions: t.totalQuestions || 10,
 correctQuestions: t.correctQuestions || Math.round((t.percentCorrect / 100) * 10),
 isStrong,
 isWeak,
 });
 }

 if (isStrong) {
 strengths.push(`${t.title} (Reading & Writing: ${t.percentCorrect}%)`);
 } else if (isWeak) {
 weaknesses.push(`${t.title} (Reading & Writing: ${t.percentCorrect}%)`);
 }
 });
 }

 // Determine section scores & total score
 let mathScore = request.mathScore ?? 0;
 let englishScore = request.englishScore ?? 0;
 let totalScore = request.totalScore ?? request.score ?? (mathScore + englishScore);

 if (totalScore > 0 && totalScore <= 100) {
 // Scale out of 1600 if percentage score
 totalScore = Math.round(400 + (totalScore / 100) * 1200);
 mathScore = Math.round(totalScore / 2);
 englishScore = totalScore - mathScore;
 } else if (!totalScore && (mathScore || englishScore)) {
 totalScore = (mathScore || 0) + (englishScore || 0);
 }

 // Section level strengths/weaknesses if scores present
 if (mathScore >= 700) {
 strengths.push(`High SAT Math section mastery (${mathScore}/800)`);
 } else if (mathScore > 0 && mathScore < 600) {
 weaknesses.push(`SAT Math section improvement needed (${mathScore}/800)`);
 }

 if (englishScore >= 700) {
 strengths.push(`High SAT Reading and Writing section mastery (${englishScore}/800)`);
 } else if (englishScore > 0 && englishScore < 600) {
 weaknesses.push(`SAT Reading and Writing section improvement needed (${englishScore}/800)`);
 }

 // Generate targeted recommendations
 weaknesses.forEach((weakness) => {
 for (const [topicKey, topicRecs] of Object.entries(TOPIC_RECOMMENDATION_MAP)) {
 if (weakness.toLowerCase().includes(topicKey.toLowerCase())) {
 topicRecs.forEach((r) => recommendations.push(r));
 }
 }
 });

 // Default recommendations if none matched
 if (recommendations.length === 0) {
 if (totalScore >= 1400) {
 recommendations.push("Maintain consistency with timed full-length SAT practice tests.");
 recommendations.push("Focus on eliminating careless errors in hard-difficulty questions.");
 recommendations.push("Review tricky punctuation nuances and multi-step advanced math questions.");
 } else if (totalScore >= 1200) {
 recommendations.push("Prioritize high-yield SAT Algebra and Grammar rules to push score above 1350.");
 recommendations.push("Review missed questions with error logs analyzing root causes.");
 recommendations.push("Practice pacing to ensure 5-10 minutes remaining for review per module.");
 } else {
 recommendations.push("Build foundational mastery in linear algebra and standard English conventions.");
 recommendations.push("Focus on core concept explanations before taking timed sections.");
 recommendations.push("Establish regular daily 45-minute practice sessions.");
 }
 }

 // Compute accuracy numbers
 const mathAccuracy = Math.round((Math.max(200, Math.min(800, mathScore || 500)) - 200) / 6);
 const englishAccuracy = Math.round((Math.max(200, Math.min(800, englishScore || 500)) - 200) / 6);
 const overallAccuracy = Math.round(((totalScore || 1000) - 400) / 12);

 // Study priorities
 const studyPriorities: string[] = [];
 if (weaknesses.length > 0) {
 studyPriorities.push(`Target weakest topics: {weaknesses.slice(0, 3).map((w) => w.split("(")[0].trim()).join(", ")}`);
 }
 if (mathScore < englishScore) {
 studyPriorities.push("Allocate 60% of study time to SAT Math problem sets and formula drills.");
 } else {
 studyPriorities.push("Allocate 60% of study time to SAT Reading & Writing passage analysis and grammar rules.");
 }
 studyPriorities.push("Complete weekly timed module practice to build test endurance.");

 // Next steps
 const nextSteps: string[] = [];
 if (totalScore >= 1450) {
 nextSteps.push("Work through advanced problem sets (College Board Question Bank - Hard difficulty).");
 nextSteps.push("Fine-tune test pacing and double-checking techniques.");
 } else if (totalScore >= 1250) {
 nextSteps.push("Review detailed solutions for every incorrect answer.");
 nextSteps.push("Complete targeted drills on identified weak topics.");
 nextSteps.push("Schedule next full mock test in 7-10 days.");
 } else {
 nextSteps.push("Review foundational math formulas and English grammar guidelines.");
 nextSteps.push("Schedule a review session with instructor to clarify challenging questions.");
 nextSteps.push("Retake topic-specific quizzes before full mock tests.");
 }

 const overallInsight = `Student achieved an SAT score of ${totalScore} (Math: ${mathScore}, Reading & Writing: ${englishScore}). {
 totalScore >= 1400
 ? "Outstanding competitive performance demonstrating strong command of SAT concepts."
 : totalScore >= 1200
 ? "Solid foundation with clear target areas for rapid score improvement towards 1400+."
 : "Foundational stage requiring targeted focus on core algebraic equations and grammar rules."
 }`;

 return {
 testId: request.testId,
 summary: overallInsight,
 overallInsight,
 totalScore,
 mathScore,
 englishScore,
 mathAccuracy,
 englishAccuracy,
 overallAccuracy,
 strengths: [...new Set(strengths)],
 weaknesses: [...new Set(weaknesses)],
 topicPerformance,
 detailedTopics,
 recommendations: [...new Set(recommendations)],
 studyPriorities,
 nextSteps,
 analyzedAt: new Date().toISOString(),
 };
}

/**
 * Optional LLM-assisted analysis using Claude/OpenAI when available.
 */
async function generateLLMAnalysis(request: AnalysisRequest): Promise<AIAnalysisOutput> {
 const base = generateAccurateAnalysis(request);
 const anthropicKey = process.env.ANTHROPIC_API_KEY;

 if (anthropicKey) {
 const prompt = `Analyze this SAT student performance:
Total Score: ${base.totalScore}/1600 (Math: ${base.mathScore}/800, Reading & Writing: ${base.englishScore}/800)
Strengths: {base.strengths.join(", ") || "None specified"}
Weaknesses: {base.weaknesses.join(", ") || "None specified"}
Topic Breakdown: ${JSON.stringify(base.topicPerformance)}

Provide a concise 2-sentence executive summary and 3 high-impact study recommendations in JSON format:
{
 "summary": "...",
 "recommendations": ["...", "...", "..."],
 "nextSteps": ["...", "..."]
}`;

 const res = await fetch("https://api.anthropic.com/v1/messages", {
 method: "POST",
 headers: {
 "Content-Type": "application/json",
 "x-api-key": anthropicKey,
 "anthropic-version": "2023-06-01",
 },
 body: JSON.stringify({
 model: "claude-3-5-sonnet-20241022",
 max_tokens: 600,
 messages: [{ role: "user", content: prompt }],
 }),
 });

 if (res.ok) {
 const data = await res.json();
 const text = data.content?.[0]?.text;
 if (text) {
 try {
 const parsed = JSON.parse(text);
 if (parsed.summary) base.summary = parsed.summary;
 if (parsed.overallInsight) base.overallInsight = parsed.overallInsight;
 if (Array.isArray(parsed.recommendations)) {
 base.recommendations = [...new Set([...parsed.recommendations, ...base.recommendations])];
 }
 if (Array.isArray(parsed.nextSteps)) {
 base.nextSteps = parsed.nextSteps;
 }
 } catch {
 // ignore parse errors and return base
 }
 }
 }
 }

 return base;
}
