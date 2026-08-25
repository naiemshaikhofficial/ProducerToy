import EpicProductDetailPage, { generateMetadata as epicGenerateMetadata } from '@/app/product/[slug]/page'

export const revalidate = 3600

export const generateMetadata = epicGenerateMetadata

export default EpicProductDetailPage
