'use server'

import { revalidateTag, revalidatePath } from 'next/cache'

/**
 * Server Action for High-Speed Direct Cache Purging
 * Triggered from client UI, admin panels, or internal tools
 * Executes directly with 0 HTTP REST overhead
 */
export async function revalidateProductsAction(tag: string = 'products') {
  try {
    revalidateTag(tag)
    revalidatePath('/')
    return { success: true, revalidated: tag, timestamp: Date.now() }
  } catch (error: any) {
    console.error('revalidateProductsAction error:', error)
    return { success: false, error: error.message }
  }
}
