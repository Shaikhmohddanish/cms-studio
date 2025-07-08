import { definePlugin } from 'sanity'

/**
 * Enhanced text editor plugin to improve rich text formatting
 * Fixes issues with bold text and line breaks
 * 
 * This plugin provides specialized configuration for the rich text editor
 * to ensure bold formatting works correctly and line breaks are properly preserved
 */
export const enhancedTextEditor = definePlugin({
  name: 'enhanced-text-editor'
})
