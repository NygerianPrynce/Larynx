import React from 'react'
import { useQuill } from 'react-quilljs'
import 'quill/dist/quill.snow.css'

const SignatureEditor = ({ value, setValue, onBack, onSave }) => {
  const { quill, quillRef } = useQuill({
    theme: 'snow',
    modules: {
      toolbar: [['bold', 'italic', 'underline'], [{ list: 'ordered' }, { list: 'bullet' }]]
    }
  })

  // Sync quill content to state
    React.useEffect(() => {
  if (quill && value !== undefined) {
    quill.clipboard.dangerouslyPasteHTML(value || '')
    quill.on('text-change', () => {
      setValue(quill.root.innerHTML)
    })
  }
}, [quill, value])

  return (
    <div>
      <div ref={quillRef} />
      <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
        <button onClick={onBack}>Back</button>
        <button onClick={onSave}>Save & Continue</button>
      </div>
    </div>
  )
}

export default SignatureEditor
