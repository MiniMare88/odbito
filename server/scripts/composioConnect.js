/**
 * Connect an account through Composio for any toolkit (github, gmail,
 * slack, notion, ...).
 * Zaženi: node server/scripts/composioConnect.js [toolkit] [userId]
 *
 * Prints a redirect URL - open it, approve the OAuth prompt, then this
 * script waits and confirms once the connection is ACTIVE.
 */

import 'dotenv/config'
import { connectToolkit, waitForConnection } from '../src/services/composioService.js'

const toolkit = process.argv[2] || 'github'
const userId = process.argv[3] || process.env.COMPOSIO_USER_ID
if (!userId) {
  console.error('Usage: node server/scripts/composioConnect.js <toolkit> <userId>')
  console.error('(or set COMPOSIO_USER_ID in .env)')
  process.exit(1)
}

console.log(`Requesting a ${toolkit} connection for Composio user "${userId}"...`)
const { connectedAccountId, redirectUrl } = await connectToolkit(userId, toolkit)

console.log(`\nOpen this URL and approve the ${toolkit} connection:`)
console.log(redirectUrl)
console.log('\nWaiting for you to approve it...')

const connectedAccount = await waitForConnection(connectedAccountId)
console.log(`\nConnected. status=${connectedAccount.status} id=${connectedAccount.id}`)
