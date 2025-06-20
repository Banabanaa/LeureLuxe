'use client'

import React from 'react'
import { defineConfig } from 'sanity'
import { visionTool } from '@sanity/vision'
import { structureTool } from 'sanity/structure'

import { customDocumentActions } from './sanity/plugins/customDocumentActions'
import { apiVersion, dataset, projectId } from './sanity/env'
import { schema } from './sanity/schemaTypes'
import { structure } from './sanity/structure'

export default defineConfig({
  basePath: '/admin',
  projectId,
  dataset,
  title: 'Admin Panel',
  schema,

  plugins: [
    structureTool({ structure }), 
    visionTool({ defaultApiVersion: apiVersion }),
  ],

  document: {
    actions: (prev, { schemaType }) => customDocumentActions(prev),
  },
})
