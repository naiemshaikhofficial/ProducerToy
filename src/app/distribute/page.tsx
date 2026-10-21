import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Distribute on Producer Toy — Redirecting to Creators Portal',
  description: 'Publish your music software, audio plugins, and sound packs with Producer Toy.',
}

export default function DistributePage() {
  redirect('https://creators.producertoy.com')
}
