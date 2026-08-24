import { Composio } from '@composio/core'

let client = null

/**
 * Lazily create the Composio client so a missing API key only breaks
 * whatever actually tries to use Composio, not the whole server boot.
 */
export function getComposioClient() {
  if (client) return client

  const apiKey = process.env.COMPOSIO_API_KEY
  if (!apiKey) {
    throw new Error('COMPOSIO_API_KEY is not set (see .env.example)')
  }

  client = new Composio({ apiKey })
  return client
}

/**
 * Get an existing Composio-managed GitHub auth config, or create one.
 * Composio-managed auth uses Composio's own OAuth app, so no GitHub
 * OAuth app registration is needed to get started.
 */
export async function getOrCreateGithubAuthConfig() {
  const composio = getComposioClient()

  const existing = await composio.authConfigs.list({
    toolkit: 'github',
    isComposioManaged: true,
  })
  if (existing.items.length > 0) {
    return existing.items[0]
  }

  return composio.authConfigs.create('github', {
    type: 'use_composio_managed_auth',
    name: 'Odbito - GitHub (Composio managed)',
  })
}

/**
 * Start a GitHub connection for a user. Returns a redirect URL the user
 * must open to approve the OAuth connection, plus the connected account id
 * to pass to waitForGithubConnection().
 */
export async function connectGithub(userId) {
  const composio = getComposioClient()
  const authConfig = await getOrCreateGithubAuthConfig()

  const connectionRequest = await composio.connectedAccounts.link(userId, authConfig.id)

  return {
    connectedAccountId: connectionRequest.id,
    redirectUrl: connectionRequest.redirectUrl,
  }
}

/**
 * Poll until a connected account becomes ACTIVE (or throw on failure/timeout).
 */
export async function waitForGithubConnection(connectedAccountId, timeoutMs = 120_000) {
  const composio = getComposioClient()
  return composio.connectedAccounts.waitForConnection(connectedAccountId, timeoutMs)
}

/**
 * Look up real GitHub tool slugs by search term instead of hardcoding one -
 * Composio's toolkit catalog changes independently of this SDK version, so
 * discovering the slug live is more reliable than guessing it.
 */
export async function findGithubTools(search, limit = 3) {
  const composio = getComposioClient()
  const tools = await composio.tools.getRawComposioTools({
    toolkits: ['github'],
    search,
    limit,
  })
  return tools
}

const FIRST_CALL_TOOL_SLUG = 'GITHUB_GET_THE_AUTHENTICATED_USER'

/**
 * The actual "real tool call": fetch the authenticated GitHub user profile
 * for whichever account this Composio userId has connected. Verifies the
 * slug still exists in the live catalog rather than trusting the constant
 * blindly, since Composio's toolkits evolve independently of this SDK.
 */
export async function callFirstGithubTool(userId) {
  const composio = getComposioClient()
  const [tool] = await composio.tools.getRawComposioTools({
    tools: [FIRST_CALL_TOOL_SLUG],
  })
  if (!tool) {
    throw new Error(`Tool ${FIRST_CALL_TOOL_SLUG} not found in the Composio catalog`)
  }

  const result = await composio.tools.execute(tool.slug, {
    userId,
    arguments: {},
    // Manual (non-agentic) execution requires pinning a toolkit version;
    // "latest" always resolves at call time so this stays safe to skip.
    dangerouslySkipVersionCheck: true,
  })

  return { slug: tool.slug, result }
}
