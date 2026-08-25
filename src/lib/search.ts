/**
 * ProducerToy High-Performance Universal Search Engine
 * Matches across Name, Slug, Category, Subcategory, Category Slugs, Brand, Description, Product Type, VST Formats, and Tags.
 */

export function matchesSearchQuery(product: any, query: string): boolean {
  if (!query || !query.trim()) return true

  const terms = query
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (terms.length === 0) return true

  // Collect all searchable text fields into one unified corpus string
  const name = product.name || ''
  const slug = product.slug || ''
  const brand = product.brand || product.brands?.name || ''
  const brandSlug = product.brands?.slug || ''
  const catName = product.categories?.name || product.category || ''
  const catSlug = product.categories?.slug || ''
  const subName = product.subcategories?.name || product.subcategory || ''
  const subSlug = product.subcategories?.slug || ''
  const catSlugs = Array.isArray(product.category_slugs) ? product.category_slugs.join(' ') : ''
  const shortDesc = product.short_description || ''
  const fullDesc = product.description || ''
  const prodType = product.product_type || ''
  const vstFormat = product.vst_format || ''
  const tags = Array.isArray(product.tags) ? product.tags.join(' ') : ''

  const searchableCorpus = `${name} ${slug} ${brand} ${brandSlug} ${catName} ${catSlug} ${subName} ${subSlug} ${catSlugs} ${shortDesc} ${fullDesc} ${prodType} ${vstFormat} ${tags}`.toLowerCase()

  // Every word token in the search query must match somewhere in the corpus
  return terms.every((term) => searchableCorpus.includes(term))
}
