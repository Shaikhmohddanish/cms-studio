/**
 * Serializers for rendering portable text content
 * 
 * These serializers can be used in your frontend code to correctly render
 * rich text content, including proper handling of line breaks and formatting
 */

export const blockContentSerializers = {
  types: {
    block: (props) => {
      // Handle different block styles
      const {style = 'normal'} = props.node
      
      // For each style, return the appropriate HTML element
      switch (style) {
        case 'h1':
          return `<h1>${props.children}</h1>`
        case 'h2':
          return `<h2>${props.children}</h2>`
        case 'h3':
          return `<h3>${props.children}</h3>`
        case 'h4':
          return `<h4>${props.children}</h4>`
        case 'blockquote':
          return `<blockquote>${props.children}</blockquote>`
        default:
          // For normal paragraphs, preserve whitespace and line breaks
          return `<p style="white-space: pre-wrap;">${props.children}</p>`
      }
    },
    // Custom type for explicit line breaks
    break: (props) => {
      const {style = 'single'} = props.node
      return style === 'single' ? '<br/>' : '<br/><br/>'
    },
    // Image handling
    image: (props) => {
      return `<figure><img src="${props.node.asset.url}" alt="${props.node.alt || ''}" /></figure>`
    }
  },
  marks: {
    // Handle decorators (bold, italic, etc.)
    strong: (props) => `<strong>${props.children}</strong>`,
    em: (props) => `<em>${props.children}</em>`,
    code: (props) => `<code>${props.children}</code>`,
    underline: (props) => `<span style="text-decoration: underline;">${props.children}</span>`,
    'strike-through': (props) => `<s>${props.children}</s>`,
    
    // Handle annotations (links)
    link: (props) => {
      const target = props.mark.blank ? 'target="_blank" rel="noopener"' : ''
      return `<a href="${props.mark.href}" ${target}>${props.children}</a>`
    }
  },
  // Preserve hard line breaks by default
  hardBreak: () => '<br />'
}
