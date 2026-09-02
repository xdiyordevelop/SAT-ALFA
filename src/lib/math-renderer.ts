import katex from 'katex'

export interface RenderResult {
 html: string
 error: string | null
}

/**
 * Renders LaTeX math expressions in a text string using KaTeX.
 * Supports all four delimiter styles:
 * - \( ... \) → inline
 * - \[ ... \] → display
 * - $ ... $ → inline
 * - $$ ... $$ → display
 */
export function renderMathInText(text: string): RenderResult {
 if (!text) return { html: '', error: null }

 try {
 // Process in a single pass using ordered regex to avoid conflicts.
 // Order matters: longer/display delimiters must come before inline ones.
 const pattern =
 /\\\[([\s\S]+?)\\\]|(?<!\\)\$\$([\s\S]+?)(?<!\\)\$\$|\\\(([\s\S]+?)\\\)|(?<!\\)\$([^$\n]+?)(?<!\\)\$/g

 const result = text.replace(pattern, (match, displayBracket, displayDollar, inline, inlineDollar) => {
 const latex = displayBracket ?? displayDollar ?? inline ?? inlineDollar
 const displayMode = !!(displayBracket ?? displayDollar)

 try {
 return katex.renderToString(latex, {
 throwOnError: false,
 displayMode,
 output: 'html',
 })
 } catch {
 // Safe fallback: return raw match unchanged
 return match
 }
 })

 return { html: result, error: null }
 } catch (error) {
 return {
 html: text,
 error: error instanceof Error ? error.message : 'Math rendering failed',
 }
 }
}

export function isValidLatex(latex: string): boolean {
 try {
 katex.renderToString(latex, { throwOnError: true })
 return true
 } catch {
 return false
 }
}
