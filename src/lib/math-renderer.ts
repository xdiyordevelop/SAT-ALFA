import katex from 'katex'

export interface RenderResult {
  html: string
  error: string | null
}

/**
 * Normalizes accidental control characters and AI-generated delimiter quirks.
 * E.g., JSON unescaping turning \text into [tab]ext or \times into [tab]imes,
 * or AI wrapping currency with $$25,740$ instead of $\$25,740$.
 */
export function cleanMathText(text: string): string {
  if (!text) return ''

  return text
    // Normalize control characters decoded from LaTeX backslash commands
    .replace(/\t(ext|imes|heta|au)/g, '\\t$1')
    .replace(/\f(rac)/g, '\\f$1')
    .replace(/[\b](eta|ar)/g, '\\b$1')
    .replace(/\r(ight|ho)/g, '\\r$1')
    // Fix AI wrapped currency like $$25,740$ -> $\$25,740$
    .replace(/\$\$([0-9,]+(?:\.[0-9]+)?)\$/g, '$\\$$1$')
}

/**
 * Renders LaTeX math expressions in a text string using KaTeX.
 * Supports all four delimiter styles:
 * - \( ... \) → inline
 * - \[ ... \] → display
 * - $ ... $ → inline (with non-whitespace boundary check to protect standalone currency)
 * - $$ ... $$ → display
 */
export function renderMathInText(text: string): RenderResult {
  if (!text) return { html: '', error: null }

  try {
    const cleaned = cleanMathText(text)

    // Order matters: display delimiters must come before inline ones.
    // We enforce non-whitespace boundary on inline $...$ so currency amounts like "$5 each"
    // are not mistakenly paired with other dollar signs.
    const pattern =
      /\\\[([\s\S]+?)\\\]|(?<!\\)\$\$([\s\S]+?)(?<!\\)\$\$|\\\(([\s\S]+?)\\\)|(?<!\\)\$(?!\s)([^$\n]+?)(?<!\s)(?<!\\)\$/g

    const result = cleaned.replace(pattern, (match, displayBracket, displayDollar, inline, inlineDollar) => {
      const latex = displayBracket ?? displayDollar ?? inline ?? inlineDollar
      const displayMode = !!(displayBracket ?? displayDollar)

      try {
        return katex.renderToString(latex.trim(), {
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
