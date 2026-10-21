'use server'

import { revalidateTag, revalidatePath } from 'next/cache'
import { getAdminClient } from '@/lib/supabase/admin'
import { checkProductStockStatus, ProductStockStatus } from '@/lib/licensing/serialPool'

/**
 * Server Action for High-Speed Direct Cache Purging
 * Triggered from client UI, admin panels, or internal tools
 * Executes directly with 0 HTTP REST overhead
 */
export async function revalidateProductsAction(tag: string = 'products') {
  try {
    (revalidateTag as any)(tag, 'max')
    revalidatePath('/')
    return { success: true, revalidated: tag, timestamp: Date.now() }
  } catch (error: any) {
    console.error('revalidateProductsAction error:', error)
    return { success: false, error: error.message }
  }
}

export type { ProductStockStatus }

/**
 * Server Action to check real-time stock status of a product.
 * Returns whether product has available keys or downloadable assets.
 */
export async function getProductStockStatusAction(productId: string): Promise<{
  success: boolean
  stock?: ProductStockStatus
  error?: string
}> {
  if (!productId) return { success: false, error: 'Product ID required' }
  try {
    const admin = getAdminClient()
    const { data: prod } = await admin
      .from('products')
      .select('id, name, slug, delivery_method, license_type, download_url, download_url_win, download_url_mac, external_url')
      .eq('id', productId)
      .maybeSingle()

    if (!prod) return { success: false, error: 'Product not found' }
    const stock = await checkProductStockStatus(admin, prod)
    return { success: true, stock }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
