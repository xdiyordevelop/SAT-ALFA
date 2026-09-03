"use client";
import { TrendingUp, AlertCircle, Lightbulb, CheckCircle } from "lucide-react";
interface ScoreAnalysisProps {
  mathScore: number;
  mathMaxScore: number;
  mathStrengths: string[];
  mathWeaknesses: string[];
  mathRecommendations: string[];
  englishScore: number;
  englishMaxScore: number;
  englishStrengths: string[];
  englishWeaknesses: string[];
  englishRecommendations: string[];
  uploadedAt: string;
}
export function ScoreAnalysisDisplay({
  mathScore,
  mathMaxScore,
  mathStrengths,
  mathWeaknesses,
  mathRecommendations,
  englishScore,
  englishMaxScore,
  englishStrengths,
  englishWeaknesses,
  englishRecommendations,
  uploadedAt,
}: ScoreAnalysisProps) {
  const mathPercentage = Math.round((mathScore / mathMaxScore) * 100);
  const englishPercentage = Math.round((englishScore / englishMaxScore) * 100);
  const totalScore = mathScore + englishScore;
  const maxTotalScore = mathMaxScore + englishMaxScore;
  const formatDate = (date: string) => new Date(date).toLocaleDateString();
  return (
    <div className="space-y-8">
      {" "}
      {/* Summary Cards */}{" "}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {" "}
        <div className="bg-gradient-to-br from-yellow-50 to-[#EBFF00]/10 rounded-2xl border border-yellow-200 p-6">
          {" "}
          <div className="flex items-center justify-between mb-4">
            {" "}
            <p className="text-sm font-medium text-[#d9ff00]">
              {" "}
              Total Score{" "}
            </p>{" "}
            <TrendingUp className="w-5 h-5 text-slate-900 dark:text-[#EBFF00]" />{" "}
          </div>{" "}
          <p className="text-3xl font-bold text-[#EBFF00]/50">
            {" "}
            {totalScore}/{maxTotalScore}{" "}
          </p>{" "}
          <p className="text-sm text-slate-900 dark:text-[#EBFF00] mt-2">
            {" "}
            {Math.round((totalScore / maxTotalScore) * 100)}% accuracy{" "}
          </p>{" "}
        </div>{" "}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 p-6">
          {" "}
          <div className="flex items-center justify-between mb-4">
            {" "}
            <p className="text-sm font-medium text-blue-700">
              {" "}
              Math Score{" "}
            </p>{" "}
            <TrendingUp className="w-5 h-5 text-blue-600" />{" "}
          </div>{" "}
          <p className="text-3xl font-bold text-blue-900">
            {" "}
            {mathScore}/{mathMaxScore}{" "}
          </p>{" "}
          <p className="text-sm text-blue-600 mt-2">
            {" "}
            {mathPercentage}% accuracy{" "}
          </p>{" "}
        </div>{" "}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200 p-6">
          {" "}
          <div className="flex items-center justify-between mb-4">
            {" "}
            <p className="text-sm font-medium text-purple-700">
              {" "}
              English Score{" "}
            </p>{" "}
            <TrendingUp className="w-5 h-5 text-slate-900 dark:text-[#EBFF00]" />{" "}
          </div>{" "}
          <p className="text-3xl font-bold text-purple-900">
            {" "}
            {englishScore}/{englishMaxScore}{" "}
          </p>{" "}
          <p className="text-sm text-slate-900 dark:text-[#EBFF00] mt-2">
            {" "}
            {englishPercentage}% accuracy{" "}
          </p>{" "}
        </div>{" "}
      </div>{" "}
      {/* Test Info */}{" "}
      <div className="bg-slate-50 dark:bg-[#0a0a0a] rounded-lg p-4 text-sm text-slate-600 dark:text-slate-400">
        {" "}
        Test completed on {formatDate(uploadedAt)}{" "}
      </div>{" "}
      {/* Math Section */}{" "}
      <div className="space-y-4">
        {" "}
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          {" "}
          <span className="w-1 h-8 bg-blue-500 rounded-full" /> Math Analysis{" "}
        </h2>{" "}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {" "}
          {/* Strong Points */}{" "}
          <div className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-6">
            {" "}
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              {" "}
              <CheckCircle className="w-5 h-5 text-green-600" /> Strong Points{" "}
            </h3>{" "}
            <ul className="space-y-3">
              {" "}
              {mathStrengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2">
                  {" "}
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />{" "}
                  <span className="text-slate-700 dark:text-slate-300">
                    {strength}
                  </span>{" "}
                </li>
              ))}{" "}
            </ul>{" "}
          </div>{" "}
          {/* Weak Points */}{" "}
          <div className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-6">
            {" "}
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              {" "}
              <AlertCircle className="w-5 h-5 text-red-600" /> Areas for
              Improvement{" "}
            </h3>{" "}
            <ul className="space-y-3">
              {" "}
              {mathWeaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start gap-2">
                  {" "}
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0" />{" "}
                  <span className="text-slate-700 dark:text-slate-300">
                    {weakness}
                  </span>{" "}
                </li>
              ))}{" "}
            </ul>{" "}
          </div>{" "}
        </div>{" "}
        {/* Recommendations */}{" "}
        <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6">
          {" "}
          <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
            {" "}
            <Lightbulb className="w-5 h-5 text-blue-600" /> Recommendations{" "}
          </h3>{" "}
          <ol className="space-y-2 text-blue-800">
            {" "}
            {mathRecommendations.map((rec, index) => (
              <li key={index} className="flex gap-3">
                {" "}
                <span className="font-semibold flex-shrink-0">
                  {index + 1}.
                </span>{" "}
                <span>{rec}</span>{" "}
              </li>
            ))}{" "}
          </ol>{" "}
        </div>{" "}
      </div>{" "}
      {/* English Section */}{" "}
      <div className="space-y-4">
        {" "}
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          {" "}
          <span className="w-1 h-8 bg-[#EBFF00] rounded-full" /> English
          Analysis{" "}
        </h2>{" "}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {" "}
          {/* Strong Points */}{" "}
          <div className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-6">
            {" "}
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              {" "}
              <CheckCircle className="w-5 h-5 text-green-600" /> Strong Points{" "}
            </h3>{" "}
            <ul className="space-y-3">
              {" "}
              {englishStrengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2">
                  {" "}
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />{" "}
                  <span className="text-slate-700 dark:text-slate-300">
                    {strength}
                  </span>{" "}
                </li>
              ))}{" "}
            </ul>{" "}
          </div>{" "}
          {/* Weak Points */}{" "}
          <div className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-6">
            {" "}
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              {" "}
              <AlertCircle className="w-5 h-5 text-red-600" /> Areas for
              Improvement{" "}
            </h3>{" "}
            <ul className="space-y-3">
              {" "}
              {englishWeaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start gap-2">
                  {" "}
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0" />{" "}
                  <span className="text-slate-700 dark:text-slate-300">
                    {weakness}
                  </span>{" "}
                </li>
              ))}{" "}
            </ul>{" "}
          </div>{" "}
        </div>{" "}
        {/* Recommendations */}{" "}
        <div className="bg-purple-50 rounded-2xl border border-purple-200 p-6">
          {" "}
          <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
            {" "}
            <Lightbulb className="w-5 h-5 text-slate-900 dark:text-[#EBFF00]" />{" "}
            Recommendations{" "}
          </h3>{" "}
          <ol className="space-y-2 text-purple-800">
            {" "}
            {englishRecommendations.map((rec, index) => (
              <li key={index} className="flex gap-3">
                {" "}
                <span className="font-semibold flex-shrink-0">
                  {index + 1}.
                </span>{" "}
                <span>{rec}</span>{" "}
              </li>
            ))}{" "}
          </ol>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
