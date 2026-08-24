/**
 * Connect a GitHub account through Composio.
 * Zaženi: node server/scripts/composioConnect.js [userId]
 *
 * Prints a redirect URL - open it, approve the GitHub OAuth prompt, then
 * this script waits and confirms once the connection is ACTIVE.
 */

import 'dotenv/config'
import { connectGithub, waitForGithubConnection } from '../src/services/composioService.js'

const userId = process.argv[2] || process.env.COMPOSIO_USER_ID
if (!userId) {
  console.error('Usage: node server/scripts/composioConnect.js <userId>')
  console.error('(or set COMPOSIO_USER_ID in .env)')
  process.exit(1)
}

console.log(`Requesting a GitHub connection for Composio user "${userId}"...`)
const { connectedAccountId, redirectUrl } = await connectGithub(userId)

console.log('\nOpen this URL and approve the GitHub connection:')
console.log(redirectUrl)
console.log('\nWaiting for you to approve it...')

const connectedAccount = await waitForGithubConnection(connectedAccountId)
console.log(`\nConnected. status=${connectedAccount.status} id=${connectedAccount.id}`)
