import {defineType, defineArrayMember} from 'sanity'

/**
 * This is the schema definition for the rich text fields used for
 * editorial content in the CMS.
 */
export default defineType({
  title: 'Block Content',
  name: 'blockContent',
  type: 'array',
  of: [
    defineArrayMember({
      title: 'Block',
      type: 'block',
      // Styles let you set what your user can mark up blocks with. These
      // correspond with HTML tags, but you can set any title or value
      // you want and decide how you want to deal with it where you want to
      // use your content.
      styles: [
        {title: 'Normal', value: 'normal'},
        {title: 'H1', value: 'h1'},
        {title: 'H2', value: 'h2'},
        {title: 'H3', value: 'h3'},
        {title: 'H4', value: 'h4'},
        {title: 'Quote', value: 'blockquote'},
      ],
      lists: [
        {title: 'Bullet', value: 'bullet'},
        {title: 'Number', value: 'number'},
      ],
      // Marks let you mark up inline text in the block editor.
      marks: {
        // Decorators usually style text with HTML tags
        decorators: [
          {title: 'Strong', value: 'strong'},
          {title: 'Emphasis', value: 'em'},
          {title: 'Code', value: 'code'},
          {title: 'Underline', value: 'underline'},
          {title: 'Strike', value: 'strike-through'},
        ],
        // Annotations can be any object structure – e.g. a link or a footnote.
        annotations: [
          {
            title: 'URL',
            name: 'link',
            type: 'object',
            fields: [
              {
                title: 'URL',
                name: 'href',
                type: 'url',
              },
              {
                title: 'Open in new tab',
                name: 'blank',
                type: 'boolean',
                initialValue: true,
              },
            ],
          },
        ],
      },
      // Enable special options for better formatting and line break handling
      options: {
        // Ensure spellcheck is enabled
        spellCheck: true
      }
    }),
    // You can add additional types here
    defineArrayMember({
      type: 'image',
      options: {hotspot: true},
    }),
    // Add a custom type for hard line breaks
    defineArrayMember({
      name: 'break',
      type: 'object',
      title: 'Line Break',
      fields: [
        {
          name: 'style',
          type: 'string',
          options: {
            list: [
              {title: 'Single Break', value: 'single'},
              {title: 'Double Break', value: 'double'},
            ],
          },
          initialValue: 'single',
        },
      ],
      preview: {
        prepare() {
          return {
            title: 'Line Break',
          }
        },
      },
    }),
  ],
})
