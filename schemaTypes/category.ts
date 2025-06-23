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
    }),
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
        
        const query = `*[_type == "category" && slug.current == $slug && !(_id in [$id, "drafts." + $id])][0]`
        const result = await client.fetch(query, params)
        
        if (result) {
          return 'Slug is already in use'
        }
        
        return true
      }),
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
