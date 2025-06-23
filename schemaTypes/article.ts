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
      options: {
        source: (doc: any) => doc.title,
        maxLength: 96,
        slugify: (input: string) => {
          return input
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9\-]/g, '')
        },
      },
      validation: Rule => Rule.required().custom(async (slug, context) => {
        if (!slug?.current) return true
        
        const { document, getClient } = context
        const client = getClient({ apiVersion: '2023-06-15' })
        const id = document?._id?.replace(/^drafts\./, '')
        
        const params = {
          slug: slug.current,
          id: id,
        }
        
        const query = `*[_type == "article" && slug.current == $slug && !(_id in [$id, "drafts." + $id])][0]`
        const result = await client.fetch(query, params)
        
        if (result) {
          return 'Slug is already in use'
        }
        
        return true
      }),
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
