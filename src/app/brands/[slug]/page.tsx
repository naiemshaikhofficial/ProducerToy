import BrandShowcasePage, { generateMetadata as brandGenerateMetadata, generateStaticParams as brandGenerateStaticParams } from '@/app/manufacturers/[slug]/page'

export const revalidate = 3600
export const generateStaticParams = brandGenerateStaticParams
export const generateMetadata = brandGenerateMetadata

export default BrandShowcasePage
