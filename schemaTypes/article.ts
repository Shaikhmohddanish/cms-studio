// /studio/schemas/article.ts
import {defineType, defineField} from 'sanity'
import React from 'react'

export default defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  fields: [
    // Post title
    defineField({
      name: 'title',
      title: 'Post Title',
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
    }),
    // Post description (short)
    defineField({
      name: 'description',
      title: 'Post Description',
      type: 'text',
      rows: 3,
    }),    // Feature image
    defineField({
      name: 'featureImage',
      title: 'Feature Image',
      type: 'image',
      options: {
        hotspot: false,
        storeOriginalFilename: true,
        accept: 'image/*',
      },
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
            
            // Get all existing article slugs
            const existingSlugs = await client.fetch(
              `*[_type == "article" && defined(slug.current)] {
                "slug": slug.current
              }`
            )

            const allSlugs = existingSlugs.map((doc: { slug: string }) => doc.slug)
            console.log('All article slugs:', allSlugs)

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
      type: 'blockContent', // Use our new blockContent type here
      validation: Rule => Rule.required(),
    }),
  ],
})
