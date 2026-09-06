'use client';

import { useTestContext } from '../../context/TestContext';

export interface TestStateAPI {
 // Question navigation
 goToNextQuestion: () => void;
 goToPreviousQuestion: () => void;
 goToQuestion: (index: number) => void;
 // Answer management
 selectAnswer: (questionId: string, answer: string) => void;
 markForReview: (questionId: string) => void;
 clearAnswer: (questionId: string) => void;
 // Module navigation
 advanceToNextModule: () => void;
 // State queries
 getCurrentQuestion: () => number;
 getCurrentModule: () => number;
 getAnswerForQuestion: (questionId: string) => string | undefined;
 isQuestionMarked: (questionId: string) => boolean;
 getTestProgress: () => { answered: number; marked: number; total: number };
 getModuleProgress: (moduleNumber: number) => {
  answered: number;
  marked: number;
  total: number;
  unanswered: number;
 };
}

export function useTestState(): TestStateAPI {
 const {
  currentQuestionIndex,
  currentModule,
  userAnswers,
  markedQuestions,
  totalQuestions,
  questionsPerModule,
  realQuestions,
  setCurrentQuestionIndex,
  nextQuestion,
  prevQuestion,
  setCurrentModule,
  setAnswer,
  toggleMarkForReview,
 } = useTestContext();

 return {
 goToNextQuestion: nextQuestion,
 goToPreviousQuestion: prevQuestion,
 goToQuestion: (index: number) => {
 setCurrentQuestionIndex(index);
 },
 selectAnswer: (questionId: string, answer: string) => {
 setAnswer(questionId, answer);
 },
 markForReview: (questionId: string) => {
 toggleMarkForReview(questionId);
 },
 clearAnswer: (questionId: string) => {
 setAnswer(questionId, '');
 },
 advanceToNextModule: () => {
 if (currentModule < 4) {
 setCurrentModule((currentModule + 1) as 1 | 2 | 3 | 4);
 }
 },
 getCurrentQuestion: () => currentQuestionIndex,
 getCurrentModule: () => currentModule,
 getAnswerForQuestion: (questionId: string) => userAnswers[questionId],
 isQuestionMarked: (questionId: string) => markedQuestions[questionId] ?? false,
 getTestProgress: () => ({
  answered: Object.keys(userAnswers).length,
  marked: Object.values(markedQuestions).filter(Boolean).length,
  total: totalQuestions,
 }),
 getModuleProgress: (moduleNumber: number) => {
  const questionsInMod = realQuestions.filter((q: any) => q.module === moduleNumber);
  const answeredInMod = questionsInMod.filter((q: any) => {
    const ans = userAnswers[q.id];
    return ans !== undefined && ans !== null && String(ans).trim() !== '';
  }).length;
  const markedInMod = questionsInMod.filter((q: any) => markedQuestions[q.id]).length;
  return {
    answered: answeredInMod,
    marked: markedInMod,
    total: questionsInMod.length,
    unanswered: Math.max(0, questionsInMod.length - answeredInMod),
  };
 },
 };
}