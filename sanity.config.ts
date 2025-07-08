import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {enhancedTextEditor} from './plugins/enhancedTextEditor'

export default defineConfig({
  name: 'default',
  title: 'Maha Tradings',

  projectId: 'yz4oom2n',
  dataset: 'production',

  plugins: [
    structureTool({
      // Configure the structure tool for better portable text handling
      structure: (S) => {
        return S.list()
          .title('Content')
          .items([
            // Regular document types
            S.documentTypeListItem('article').title('Articles'),
            S.documentTypeListItem('category').title('Categories'),
          ])
      },
    }), 
    visionTool(),
    // Add the enhanced text editor plugin
    enhancedTextEditor
  ],

  schema: {
    types: schemaTypes,
  },
})
