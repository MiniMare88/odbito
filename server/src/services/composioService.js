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
 * Get an existing Composio-managed auth config for a toolkit (e.g. 'github',
 * 'gmail', 'slack'), or create one. Composio-managed auth uses Composio's
 * own OAuth app, so no app registration is needed on our side to get started.
 */
export async function getOrCreateAuthConfig(toolkitSlug) {
  const composio = getComposioClient()

  const existing = await composio.authConfigs.list({
    toolkit: toolkitSlug,
    isComposioManaged: true,
  })
  if (existing.items.length > 0) {
    return existing.items[0]
  }

  return composio.authConfigs.create(toolkitSlug, {
    type: 'use_composio_managed_auth',
    name: `Odbito - ${toolkitSlug} (Composio managed)`,
  })
}

/**
 * Start a connection for a user against a given toolkit. Returns a redirect
 * URL the user must open to approve the OAuth connection, plus the connected
 * account id to pass to waitForConnection().
 */
export async function connectToolkit(userId, toolkitSlug) {
  const composio = getComposioClient()
  const authConfig = await getOrCreateAuthConfig(toolkitSlug)

  const connectionRequest = await composio.connectedAccounts.link(userId, authConfig.id)

  return {
    connectedAccountId: connectionRequest.id,
    redirectUrl: connectionRequest.redirectUrl,
  }
}

/**
 * Poll until a connected account becomes ACTIVE (or throw on failure/timeout).
 */
export async function waitForConnection(connectedAccountId, timeoutMs = 120_000) {
  const composio = getComposioClient()
  return composio.connectedAccounts.waitForConnection(connectedAccountId, timeoutMs)
}

/**
 * Look up real tool slugs for a toolkit by search term instead of hardcoding
 * one - Composio's catalog changes independently of this SDK version, so
 * discovering the slug live is more reliable than guessing it.
 */
export async function findTools(toolkitSlug, search, limit = 5) {
  const composio = getComposioClient()
  return composio.tools.getRawComposioTools({
    toolkits: [toolkitSlug],
    search,
    limit,
  })
}

/**
 * Execute a tool by exact slug for a connected user. Verifies the slug still
 * exists in the live catalog rather than trusting a hardcoded constant blindly.
 */
export async function callTool(toolSlug, userId, args = {}) {
  const composio = getComposioClient()
  const [tool] = await composio.tools.getRawComposioTools({ tools: [toolSlug] })
  if (!tool) {
    throw new Error(`Tool ${toolSlug} not found in the Composio catalog`)
  }

  const result = await composio.tools.execute(tool.slug, {
    userId,
    arguments: args,
    // Manual (non-agentic) execution requires pinning a toolkit version;
    // "latest" always resolves at call time so this stays safe to skip.
    dangerouslySkipVersionCheck: true,
  })

  return { slug: tool.slug, result }
}

export const FIRST_CALL_TOOL_SLUG = 'GITHUB_GET_THE_AUTHENTICATED_USER'

/**
 * The GitHub demo call used in scripts/composioFirstCall.js.
 */
export async function callFirstGithubTool(userId) {
  return callTool(FIRST_CALL_TOOL_SLUG, userId)
}
