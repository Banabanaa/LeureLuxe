import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: process.env.NEXT_PUBLIC_SANITY_USE_CDN === 'true', // Set via env: 'true' for CDN, 'false' for SSR/ISR
})
