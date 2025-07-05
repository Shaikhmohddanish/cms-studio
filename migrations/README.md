# Title Migration

This migration converts string titles to rich text format for both articles and categories.

## What it does

- Converts existing string titles to rich text (array of blocks)
- Maintains backward compatibility during migration
- Updates slug generation to handle both formats

## How to run

1. Run the migration using Sanity CLI:
```bash
sanity migration run convertTitleToRichText
```

2. After migration is complete, you can optionally remove the legacy string validation from the schemas.

## Note

The schemas now include temporary validation that accepts both string and array formats. This ensures existing documents won't break during the migration process.
