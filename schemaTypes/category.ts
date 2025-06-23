import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Category Title',
      type: 'string',
      validation: Rule => Rule.required(),
    }),    defineField({
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
