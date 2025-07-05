import * as React from 'react'
import { set, unset, useClient, useFormValue } from 'sanity'
import { FormField } from 'sanity'
import { TextInput, Stack, Card, Text } from '@sanity/ui'
import type { ObjectInputProps, SlugValue, ObjectSchemaType } from 'sanity'

type ExtraProps = {
  fromField?: string
  docType?: string
}

function slugify(input: string) {
  return (input || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
}

// Helper to extract plain text from rich text blocks
function extractPlainText(blocks: any[]): string {
  if (!Array.isArray(blocks)) return ''
  return blocks
    .map(block => 
      block.children?.map((child: any) => child.text || '').join('') || ''
    )
    .join(' ')
    .trim()
}

export default function CustomSlugInput(
  props: ObjectInputProps<SlugValue, ObjectSchemaType> & ExtraProps
) {
  const { value, onChange, schemaType, elementProps, fromField = 'title', docType, readOnly } = props
  const client = useClient({ apiVersion: '2023-06-15' })
  const [inputValue, setInputValue] = React.useState(value?.current || '')
  const [isAuto, setIsAuto] = React.useState(true)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [uniqueSlug, setUniqueSlug] = React.useState(inputValue)
  const titleValue = useFormValue([fromField]) as string | any[] | undefined
  const id = useFormValue(['_id']) as string | undefined
  const prevTitle = React.useRef<string | undefined>(undefined)

  // Convert title to plain text
  const title = React.useMemo(() => {
    if (typeof titleValue === 'string') return titleValue
    if (Array.isArray(titleValue)) return extractPlainText(titleValue)
    return undefined
  }, [titleValue])

  // Helper: Both draft and published id
  const publishedId = id?.replace(/^drafts\./, '') || ''
  const draftId = id?.startsWith('drafts.') ? id : `drafts.${id}`
  const allExcludedIds = [id, publishedId, draftId].filter(Boolean)

  // Manual change disables auto mode
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setIsAuto(false)
    const manualValue = slugify(e.target.value)
    setInputValue(manualValue)
    if (!readOnly) {
      onChange(manualValue ? set({ current: manualValue }) : unset())
    }
  }

  // Auto mode: sync slug to title
  React.useEffect(() => {
    if (isAuto && title && title !== prevTitle.current) {
      const base = slugify(title)
      setInputValue(base)
      prevTitle.current = title
    }
  }, [title, isAuto])

  // Uniqueness and conditional patch logic
  React.useEffect(() => {
    let ignore = false
    async function checkUnique() {
      setLoading(true)
      setError(null)
      const base = slugify(inputValue)
      try {
        const typeName = docType || schemaType?.name
        if (!typeName) throw new Error('No document type provided')
        const query = `*[_type == $type && defined(slug.current)]{ "slug": slug.current, _id }`
        const params = { type: typeName }
        const docs = await client.fetch(query, params)

        // Exclude all forms of current doc (draft, published)
        const allSlugs = docs
          .filter((doc: any) =>
            !allExcludedIds.includes(doc._id)
          )
          .map((doc: any) => doc.slug)
        let candidate = base
        let i = 1
        while (candidate && allSlugs.includes(candidate)) {
          i += 1
          candidate = `${base}-${i}`
        }
        if (!ignore) {
          setUniqueSlug(candidate)
          setLoading(false)
          setError(null)
          // Only patch if not readOnly and candidate is new
          if (!readOnly && candidate && value?.current !== candidate) {
            setInputValue(candidate)
            onChange(set({ current: candidate }))
          }
        }
      } catch (e: any) {
        if (!ignore) {
          setError('Error checking slug uniqueness')
          setLoading(false)
        }
      }
    }
    if (inputValue) checkUnique()
    else if (!readOnly) onChange(unset())
    return () => {
      ignore = true
    }
    // eslint-disable-next-line
  }, [inputValue, schemaType?.name, docType, id, readOnly])

  return (
    <FormField title={schemaType.title} description={schemaType.description}>
      <Stack space={2}>
        <TextInput
          {...elementProps}
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Auto-generated from title"
          disabled={loading || readOnly}
        />
        {loading && <Text size={1}>Checking uniqueness…</Text>}
        {error && <Text size={1} style={{ color: 'var(--card-critical-fg-color, #d32f2f)' }}>{error}</Text>}
        {!loading && !error && inputValue && uniqueSlug !== inputValue && (
          <Card tone="caution" padding={2} radius={2}>
            <Text size={1}>Slug taken, using: <b>{uniqueSlug}</b></Text>
          </Card>
        )}
      </Stack>
    </FormField>
  )
}
