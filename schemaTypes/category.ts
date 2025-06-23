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
      options: {
        source: 'title',
        maxLength: 96,
        slugify: async (input: string, context: any) => {
          const slugBase = input
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9\-]/g, '') // remove non-url-safe chars

          let slug = slugBase
          let i = 1

          const existingSlugs = await context.getClient({ apiVersion: '2023-06-15' }).fetch(
            `*[_type == "category" && slug.current match $slugBase] {
              "slug": slug.current
            }`,
            { slugBase: `${slugBase}*` }
          )

          const usedSlugs = existingSlugs.map((doc: { slug: string }) => doc.slug)

          while (usedSlugs.includes(slug)) {
            i++
            slug = `${slugBase}-${i}`
          }

          return slug
        },
      },
      validation: Rule => Rule.required(),
    }),
  ],
})
