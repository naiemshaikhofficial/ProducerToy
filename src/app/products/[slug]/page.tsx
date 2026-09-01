import EpicProductDetailPage, { generateMetadata as epicGenerateMetadata } from '@/app/product/[slug]/page'

export const revalidate = false

export const generateMetadata = epicGenerateMetadata

export default EpicProductDetailPage
