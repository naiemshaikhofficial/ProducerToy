import { getIdentityRules, type IdentityContext } from './identityRules'
import { getAdministrativeRules, type AdminContext } from './administrativeRules'
import { getComingSoonRules, type ComingSoonRuleContext } from './comingSoonRules'
import { getGatewayRules } from './gatewayRules'
import { getPolicyConductRules, type PolicyContext } from './policyConductRules'
import { getPlatformInfoRules } from './platformInfoRules'

export * from './identityRules'
export * from './administrativeRules'
export * from './comingSoonRules'
export * from './gatewayRules'
export * from './policyConductRules'
export * from './platformInfoRules'

export interface SupportPromptContext {
  identity: IdentityContext
  admin: AdminContext
  comingSoon: ComingSoonRuleContext
  policy: PolicyContext
  userAccountSummary: string
  isUserLoggedIn: boolean
  liveInventoryList: string
}

/**
 * Builds the complete system prompt by stitching together modular rules.
 * Developers can add new rules by adding a file to this directory and including it here.
 */
export function buildSupportSystemPrompt(ctx: SupportPromptContext): string {
  const sections = [
    getIdentityRules(ctx.identity),
    ctx.userAccountSummary,
    ctx.isUserLoggedIn
      ? `- The user IS ALREADY LOGGED IN as ${ctx.identity.userName} (${ctx.identity.userEmail || ''}). NEVER tell them they are in guest mode, NEVER tell them to log in, and NEVER tell them to create an account.`
      : `- The user is currently browsing as a guest.`,
    `LIVE STORE INVENTORY (QUERY RESULT FROM SUPABASE DATABASE):\n${ctx.liveInventoryList}`,
    getAdministrativeRules(ctx.admin),
    getComingSoonRules(ctx.comingSoon),
    getGatewayRules(),
    getPolicyConductRules(ctx.policy),
    getPlatformInfoRules(),
  ]

  return sections.filter(Boolean).join('\n\n')
}
