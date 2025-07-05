import { defineMigration, at, set } from 'sanity/migrate'

export default defineMigration({
  title: 'Convert string titles to rich text',
  documentTypes: ['article', 'category'],
  
  migrate: {
    document(doc, context) {
      // Only process if the title is a string
      if (typeof doc.title === 'string') {
        const titleText = doc.title
        
        return at('title', set([
          {
            _type: 'block',
            _key: 'block_' + Math.random().toString(36).substr(2, 9),
            style: 'normal',
            markDefs: [],
            children: [
              {
                _type: 'span',
                _key: 'span_' + Math.random().toString(36).substr(2, 9),
                text: titleText,
                marks: []
              }
            ]
          }
        ]))
      }
      
      return []
    }
  }
})
