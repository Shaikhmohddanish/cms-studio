import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Category Title',
      type: 'array',
      of: [{ 
        type: 'block',
        styles: [{title: 'Normal', value: 'normal'}],
        lists: [],
        marks: {
          decorators: [
            {title: 'Strong', value: 'strong'},
            {title: 'Emphasis', value: 'em'},
            {title: 'Underline', value: 'underline'},
          ],
          // Add link support to titles as well
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
              ],
            },
          ],
        },
      }],
      validation: Rule => Rule.required().custom((value) => {
        // Handle legacy string titles during migration
        if (typeof value === 'string') {
          return true // Allow strings temporarily during migration
        }
        if (!value || !Array.isArray(value) || value.length === 0) {
          return 'Title is required'
        }
        return true
      }),
    }),    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'Click "Generate" to create slug from title (auto-adds numbers for duplicates)',
      options: {
        source: 'title',
        maxLength: 96,        slugify: async (input: string | any[], context: any) => {
          // Handle both string (legacy) and array (rich text) formats
          let titleText = ''
          if (typeof input === 'string') {
            titleText = input
          } else if (Array.isArray(input)) {
            // Extract plain text from rich text blocks
            titleText = input
              .filter(block => block._type === 'block' && block.children)
              .map(block => 
                block.children
                  .filter((child: any) => child._type === 'span')
                  .map((child: any) => child.text)
                  .join('')
              )
              .join(' ')
          }
          
          const slugBase = titleText
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9\-]/g, '')

          try {
            const client = context.getClient({ apiVersion: '2023-06-15' })
            
            // Get all existing category slugs
            const existingSlugs = await client.fetch(
              `*[_type == "category" && defined(slug.current)] {
                "slug": slug.current
              }`
            )

            const allSlugs = existingSlugs.map((doc: { slug: string }) => doc.slug)
            console.log('All category slugs:', allSlugs)

            // Filter slugs that match our pattern
            const matchingSlugs = allSlugs.filter((slug: string) => {
              return slug === slugBase || (slug && slug.match(new RegExp(`^${slugBase}-\\d+$`)))
            })

            console.log('Matching slugs for', slugBase, ':', matchingSlugs)

            // If no matching slugs, use base slug
            if (matchingSlugs.length === 0) {
              console.log('No matches found, using base slug:', slugBase)
              return slugBase
            }

            // Find highest number
            let maxNumber = 0
            matchingSlugs.forEach((slug: string) => {
              if (slug === slugBase) {
                maxNumber = Math.max(maxNumber, 1) // Base slug counts as 1
              } else {
                const match = slug.match(new RegExp(`^${slugBase}-(\\d+)$`))
                if (match) {
                  const num = parseInt(match[1], 10)
                  maxNumber = Math.max(maxNumber, num)
                }
              }
            })

            const nextNumber = maxNumber + 1
            const newSlug = `${slugBase}-${nextNumber}`
            
            console.log('Max number found:', maxNumber)
            console.log('Next slug will be:', newSlug)
            
            return newSlug

          } catch (error) {
            console.error('Error generating slug:', error)
            return slugBase + '-1'
          }
        },
      },
      validation: Rule => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      slug: 'slug'
    },
    prepare(selection) {
      const { title, slug } = selection
      return {
        title: title,
        subtitle: slug?.current ? `/${slug.current}` : 'No slug'
      }
    }
  }
})
