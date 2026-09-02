// SAT Module Configuration and Constants

export const SAT_CONFIG = {
 // Module timing (in milliseconds)
 modules: {
 1: {
 name: 'Reading & Writing Module 1',
 section: 'RW',
 durationMs: 32 * 60 * 1000, // 32 minutes = 1,920,000 ms
 questions: 27,
 },
 2: {
 name: 'Reading & Writing Module 2',
 section: 'RW',
 durationMs: 32 * 60 * 1000,
 questions: 27,
 },
 3: {
 name: 'Math Module 1',
 section: 'MATH',
 durationMs: 35 * 60 * 1000, // 35 minutes = 2,100,000 ms
 questions: 22,
 },
 4: {
 name: 'Math Module 2',
 section: 'MATH',
 durationMs: 35 * 60 * 1000,
 questions: 22,
 },
 },

 // Break timing
 breakDurationMs: 10 * 60 * 1000, // 10 minutes between R&W and Math
 moduleTransitionMs: 3 * 1000, // 3 seconds between modules within same section

 // Timer warnings (in milliseconds before end)
 warnings: {
 fifteenMinutesMs: 15 * 60 * 1000,
 fiveMinutesMs: 5 * 60 * 1000,
 oneMinuteMs: 60 * 1000,
 },

 // Total test info
 totalQuestions: 98, // 54 R&W + 44 Math
 rwTotal: 54,
 mathTotal: 44,

 // Fullscreen settings
 fullscreen: {
 required: true,
 allowSkip: false,
 autoLockOnExit: true,
 exitCountThreshold: 3, // Flag concern after 3 exits
 },

 // Calculator settings
 calculator: {
 availableModules: [3, 4], // Math modules only
 defaultVisible: true,
 allowMinimize: true,
 },

 // Answer types
 answerFormats: {
 mcq: 'multiple-choice',
 fillIn: 'fill-in-the-blank',
 },
} as const

// Helper function to get module config
export function getModuleConfig(moduleNumber: 1 | 2 | 3 | 4) {
 return SAT_CONFIG.modules[moduleNumber]
}

// Helper function to get duration for module
export function getModuleDuration(moduleNumber: 1 | 2 | 3 | 4): number {
 return SAT_CONFIG.modules[moduleNumber].durationMs
}

// Helper function to get section for module
export function getModuleSection(moduleNumber: 1 | 2 | 3 | 4): 'RW' | 'MATH' {
 return SAT_CONFIG.modules[moduleNumber].section
}

// Helper function to check if calculator is available
export function isCalculatorAvailable(moduleNumber: 1 | 2 | 3 | 4): boolean {
 return moduleNumber === 3 || moduleNumber === 4
}

// Total time across all modules (in ms)
export const TOTAL_TEST_TIME_MS =
 SAT_CONFIG.modules[1].durationMs +
 SAT_CONFIG.modules[2].durationMs +
 SAT_CONFIG.breakDurationMs +
 SAT_CONFIG.modules[3].durationMs +
 SAT_CONFIG.modules[4].durationMs
