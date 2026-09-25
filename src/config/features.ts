/**
 * Global Feature Flags configuration for Producer Toy
 * Toggle features on or off cleanly across the entire platform.
 */
export const FEATURE_FLAGS = {
  /**
   * Brands & Manufacturers Ecosystem
   *
   * When set to false:
   * - Hides "Brands" link from Header & SubBar navigation (Desktop & Mobile)
   * - Hides "All Brands" link from Mobile Drawer
   * - Hides "Brands & Developers" link from Footer
   * - Hides "Developers" / "Brands" filter section from Store Catalog (EpicStoreBrowser)
   * - Hides "Brand" dropdown from CategoryFilterBar
   * - Hides "by [Brand]" from Product Cards
   * - Gracefully redirects /manufacturers and /brands routes to /store
   * - Excludes brand pages from sitemap.xml
   *
   * Future Enablement:
   * Simply flip this boolean to `true` to immediately restore all brand functionality.
   */
  ENABLE_BRANDS: false,
} as const

export const ENABLE_BRANDS = FEATURE_FLAGS.ENABLE_BRANDS
