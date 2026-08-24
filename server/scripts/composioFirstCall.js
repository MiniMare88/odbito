/**
 * Make a real Composio tool call against the connected GitHub account.
 * Zaženi: node server/scripts/composioFirstCall.js [userId]
 *
 * Run composioConnect.js first so the account is ACTIVE.
 */

import 'dotenv/config'
import { callFirstGithubTool } from '../src/services/composioService.js'

const userId = process.argv[2] || process.env.COMPOSIO_USER_ID
if (!userId) {
  console.error('Usage: node server/scripts/composioFirstCall.js <userId>')
  console.error('(or set COMPOSIO_USER_ID in .env)')
  process.exit(1)
}

console.log(`Calling a GitHub tool via Composio for user "${userId}"...`)
const { slug, result } = await callFirstGithubTool(userId)

console.log(`\nTool: ${slug}`)
console.log(JSON.stringify(result, null, 2))
