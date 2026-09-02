export async function sendTelegramMessage(
 message: string,
 format: 'Markdown' | 'HTML' = 'Markdown'
): Promise<boolean> {
 if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHANNEL_ID) {
 console.warn('Telegram credentials not configured')
 return false
 }

 try {
 const response = await fetch(
 `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
 {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 chat_id: process.env.TELEGRAM_CHANNEL_ID,
 text: message,
 parse_mode: format,
 disable_web_page_preview: true,
 }),
 }
 )

 if (!response.ok) {
 console.error('Telegram API error:', await response.text())
 return false
 }

 return true
 } catch (error) {
 console.error('Failed to send Telegram message:', error)
 return false
 }
}
export function buildResultsAnnouncementMessage(
 studentName: string,
 testName: string,
 totalScore: number,
 rwScore: number,
 mathScore: number
): string {
 return `
📊 *Test Results Posted*

Student: ${studentName}
Test: ${testName}

*Scores:*
• Total: ${totalScore}/1600
• Reading & Writing: ${rwScore}/800
• Math: ${mathScore}/800

Dashboard: [View Results](${process.env.NEXT_PUBLIC_APP_URL}/student/results)
`.trim()
}
