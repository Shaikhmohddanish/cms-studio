// The BlockEditor component from 'sanity' needs to be imported properly 
// This file is currently not being used, but we're keeping it as a placeholder 
// for potential future customizations of the rich text editor

import React from 'react'

type InputProps = {
  value?: any
  onChange?: (value: any) => void
  [key: string]: any
}

// This is a simple wrapper that will pass through all props to the standard Sanity editor component
export const EnhancedRichTextInput = (props: InputProps) => {
  // Pass all props through to the standard component
  // The actual enhancement is now handled by the plugin instead
  return props.renderDefault ? props.renderDefault(props) : null
}
