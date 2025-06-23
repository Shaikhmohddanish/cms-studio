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
              // Get all existing slugs that start with our base slug
            const existingSlugs = await client.fetch(
              `*[_type == "category"] {
                "slug": slug.current
              }`
            )

            const usedSlugs = existingSlugs
              .map((doc: { slug: string }) => doc.slug)
              .filter((slug: string) => slug && slug.startsWith(slugBase))

            console.log('Base slug:', slugBase)
            console.log('Found existing slugs:', usedSlugs)

            // If base slug is not used, return it
            if (!usedSlugs.includes(slugBase)) {
              return slugBase
            }            // Find the highest number used
            let highestNumber = 1
            usedSlugs.forEach((usedSlug: string) => {
              if (usedSlug === slugBase) {
                // Base slug exists, so we need at least -2
                highestNumber = Math.max(highestNumber, 1)
              } else if (usedSlug.startsWith(slugBase + '-')) {
                // Extract number from slug like "category-5"
                const numberPart = usedSlug.substring(slugBase.length + 1)
                const number = parseInt(numberPart, 10)
                console.log(`Checking slug: ${usedSlug}, number part: ${numberPart}, parsed: ${number}`)
                if (!isNaN(number) && number > 0) {
                  highestNumber = Math.max(highestNumber, number)
                }
              }
            })

            console.log('Highest number found:', highestNumber)
            const finalSlug = `${slugBase}-${highestNumber + 1}`
            console.log('Generated final slug:', finalSlug)

            // Return the next available number
            return finalSlug

          } catch (error) {
            console.warn('Could not check for duplicate slugs:', error)
            return slugBase
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
