import EpicProductDetailPage, { generateMetadata as epicGenerateMetadata } from '@/app/product/[slug]/page'

export const dynamic = 'force-dynamic'

export const generateMetadata = epicGenerateMetadata

export default EpicProductDetailPage
