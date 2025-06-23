// /studio/schemas/article.ts
import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  fields: [
    // Post title
    defineField({
      name: 'title',
      title: 'Post Title',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    // Post description (short)
    defineField({
      name: 'description',
      title: 'Post Description',
      type: 'text',
      rows: 3,
    }),
    // Feature image
    defineField({
      name: 'featureImage',
      title: 'Feature Image',
      type: 'image',
      options: { hotspot: true },
    }),
    // Blog category (reference)
    defineField({
      name: 'category',
      title: 'Blog Category',
      type: 'reference',
      to: [{ type: 'category' }],
    }),    // Slug
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'Click "Generate" to create slug from title (auto-adds numbers for duplicates)',
      options: {
        source: 'title',
        maxLength: 96,        slugify: async (input: string, context: any) => {
          const slugBase = input
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9\-]/g, '')

          try {
            const client = context.getClient({ apiVersion: '2023-06-15' })
            
            // Get all existing slugs that start with our base slug
            const existingSlugs = await client.fetch(
              `*[_type == "article" && slug.current match $slugPattern] {
                "slug": slug.current
              }`,
              { slugPattern: `${slugBase}*` }
            )

            const usedSlugs = existingSlugs.map((doc: { slug: string }) => doc.slug)

            // If base slug is not used, return it
            if (!usedSlugs.includes(slugBase)) {
              return slugBase
            }

            // Find the highest number used
            let highestNumber = 1
            usedSlugs.forEach((usedSlug: string) => {
              if (usedSlug === slugBase) {
                // Base slug exists, so we need at least -2
                highestNumber = Math.max(highestNumber, 1)
              } else if (usedSlug.startsWith(slugBase + '-')) {
                // Extract number from slug like "my-post-5"
                const numberPart = usedSlug.substring(slugBase.length + 1)
                const number = parseInt(numberPart, 10)
                if (!isNaN(number)) {
                  highestNumber = Math.max(highestNumber, number)
                }
              }
            })

            // Return the next available number
            return `${slugBase}-${highestNumber + 1}`

          } catch (error) {
            console.warn('Could not check for duplicate slugs:', error)
            return slugBase
          }
        },
      },
      validation: Rule => Rule.required(),
    }),// Post date (publishedAt)
    defineField({
      name: 'publishedAt',
      title: 'Post Date',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: Rule => Rule.required(),
    }),
    // Status: published/draft/inactive
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Published', value: 'published' },
          { title: 'Inactive', value: 'inactive' },
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
    }),
    // Meta title (SEO)
    defineField({
      name: 'metaTitle',
      title: 'Meta Title',
      type: 'string',
    }),
    // Meta description (SEO)
    defineField({
      name: 'metaDescription',
      title: 'Meta Description',
      type: 'text',
      rows: 3,
    }),
    // Keywords/tags
    defineField({
      name: 'keywords',
      title: 'Keywords',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    // Main rich content body
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [{ type: 'block' }],
      validation: Rule => Rule.required(),
    }),
  ],
})
