import React from 'react'
import { useQuill } from 'react-quilljs'
import 'quill/dist/quill.snow.css'

// Custom SVG Icons
const Save = () => (
  <svg style={{ display: 'inline', width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const Edit = () => (
  <svg style={{ display: 'inline', width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
)

const SignatureEditor = ({ value, setValue, onBack, onSave }) => {
  const { quill, quillRef } = useQuill({
    theme: 'snow',
    modules: {
      toolbar: [
        ['bold', 'italic', 'underline'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['link'],
        ['clean']
      ]
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
    <div style={styles.container}>
      <style>
        {`
          /* Custom Quill Editor Styling */
          .ql-toolbar {
            background: linear-gradient(145deg, rgba(55, 65, 81, 0.8), rgba(17, 24, 39, 0.8)) !important;
            border: 1px solid #374151 !important;
            border-radius: 12px 12px 0 0 !important;
            border-bottom: none !important;
            padding: 16px !important;
          }
          
          .ql-toolbar .ql-stroke {
            stroke: #d1d5db !important;
          }
          
          .ql-toolbar .ql-fill {
            fill: #d1d5db !important;
          }
          
          .ql-toolbar button:hover {
            background: rgba(139, 92, 246, 0.3) !important;
            border-radius: 6px !important;
          }
          
          .ql-toolbar button.ql-active {
            background: rgba(139, 92, 246, 0.5) !important;
            border-radius: 6px !important;
          }
          
          .ql-container {
            background: linear-gradient(145deg, rgba(17, 24, 39, 0.8), rgba(0, 0, 0, 0.8)) !important;
            border: 1px solid #374151 !important;
            border-radius: 0 0 12px 12px !important;
            border-top: none !important;
          }
          
          .ql-editor {
            color: white !important;
            font-family: Arial, sans-serif !important;
            font-size: 14px !important;
            line-height: 1.6 !important;
            padding: 24px !important;
            min-height: 150px !important;
          }
          
          .ql-editor.ql-blank::before {
            color: #9ca3af !important;
            font-style: italic !important;
          }
          
          .ql-picker-label {
            color: #d1d5db !important;
          }
          
          .ql-picker-options {
            background: rgba(17, 24, 39, 0.95) !important;
            border: 1px solid #374151 !important;
            border-radius: 8px !important;
            backdrop-filter: blur(20px) !important;
          }
          
          .ql-picker-item:hover {
            background: rgba(139, 92, 246, 0.3) !important;
          }
          
          .ql-tooltip {
            background: rgba(17, 24, 39, 0.95) !important;
            border: 1px solid #374151 !important;
            border-radius: 8px !important;
            backdrop-filter: blur(20px) !important;
            color: white !important;
          }
          
          .ql-tooltip input[type=text] {
            background: rgba(55, 65, 81, 0.8) !important;
            border: 1px solid #374151 !important;
            color: white !important;
            border-radius: 6px !important;
            padding: 8px !important;
          }
          
          .save-button:hover {
            transform: scale(1.02) !important;
            box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4) !important;
          }
        `}
      </style>
      
      <div style={styles.editorHeader}>
        <Edit />
        <span style={styles.editorTitle}>Signature Editor</span>
      </div>
      
      <div style={styles.editorWrapper}>
        <div ref={quillRef} style={styles.editor} />
      </div>
      
      <div style={styles.actions}>
        <div style={styles.hint}>
          <span style={styles.hintIcon}>💡</span>
          <span style={styles.hintText}>
            Tip: Include your name, title, company, and contact information for professional emails
          </span>
        </div>
        <button 
          onClick={onSave}
          style={styles.saveButton}
          className="save-button"
        >
          <Save />
          <span>Save Signature</span>
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: {
    width: '100%'
  },
  editorHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
    color: '#8b5cf6'
  },
  editorTitle: {
    fontSize: '16px',
    fontWeight: '600'
  },
  editorWrapper: {
    marginBottom: '24px',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)'
  },
  editor: {
    borderRadius: '12px'
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap'
  },
  hint: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
    padding: '12px 16px',
    background: 'rgba(59, 130, 246, 0.1)',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    borderRadius: '8px'
  },
  hintIcon: {
    fontSize: '16px'
  },
  hintText: {
    fontSize: '13px',
    color: '#d1d5db',
    lineHeight: '1.4'
  },
  saveButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'linear-gradient(45deg, #8b5cf6, #3b82f6)',
    color: 'white',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    flexShrink: 0
  }
}

export default SignatureEditor