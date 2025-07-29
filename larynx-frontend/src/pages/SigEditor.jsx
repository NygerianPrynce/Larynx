import React, { useRef, useState, useEffect } from 'react'

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

const Bold = () => (
  <svg style={{ display: 'inline', width: '16px', height: '16px' }} fill="currentColor" viewBox="0 0 24 24">
    <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/>
  </svg>
)

const Italic = () => (
  <svg style={{ display: 'inline', width: '16px', height: '16px' }} fill="currentColor" viewBox="0 0 24 24">
    <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"/>
  </svg>
)

const Underline = () => (
  <svg style={{ display: 'inline', width: '16px', height: '16px' }} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"/>
  </svg>
)

const Link = () => (
  <svg style={{ display: 'inline', width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
  </svg>
)

const ListBullet = () => (
  <svg style={{ display: 'inline', width: '16px', height: '16px' }} fill="currentColor" viewBox="0 0 24 24">
    <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/>
  </svg>
)

const ListNumbered = () => (
  <svg style={{ display: 'inline', width: '16px', height: '16px' }} fill="currentColor" viewBox="0 0 24 24">
    <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/>
  </svg>
)

const ClearFormat = () => (
  <svg style={{ display: 'inline', width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h8m-8 5h12" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 14l4-4m0 4l-4-4" />
  </svg>
)

const SigEditor = ({ value = '', setValue, onBack, onSave }) => {
  const editorRef = useRef(null)
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')

  // Properly sync the value with the contentEditable div
  useEffect(() => {
    if (editorRef.current) {
      // Convert plain text line breaks to HTML line breaks if needed
      let htmlContent = value || ''
      
      // If the value looks like plain text (no HTML tags), convert line breaks
      if (htmlContent && !htmlContent.includes('<') && htmlContent.includes('\n')) {
        htmlContent = htmlContent.replace(/\n/g, '<br>')
      }
      
      // Only update if the content is actually different to avoid cursor issues
      if (editorRef.current.innerHTML !== htmlContent) {
        editorRef.current.innerHTML = htmlContent
      }
    }
  }, [value])

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    updateValue()
  }

  const updateValue = () => {
    if (editorRef.current) {
      setValue(editorRef.current.innerHTML)
    }
  }

  const insertLink = () => {
    if (linkUrl) {
      execCommand('createLink', linkUrl)
      setShowLinkDialog(false)
      setLinkUrl('')
    }
  }

  const handleKeyDown = (e) => {
    // Handle common keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault()
          execCommand('bold')
          break
        case 'i':
          e.preventDefault()
          execCommand('italic')
          break
        case 'u':
          e.preventDefault()
          execCommand('underline')
          break
      }
    }
  }

  const handleInput = () => {
    updateValue()
  }

  return (
    <div style={styles.container}>
      <style>
        {`
          .toolbar-button {
            background: transparent !important;
            border: 1px solid transparent !important;
            border-radius: 6px !important;
            color: #d1d5db !important;
            padding: 8px !important;
            cursor: pointer !important;
            transition: all 0.3s ease !important;
          }
          
          .toolbar-button:hover {
            background: rgba(139, 92, 246, 0.3) !important;
            border-color: rgba(139, 92, 246, 0.5) !important;
          }
          
          .toolbar-button.active {
            background: rgba(139, 92, 246, 0.5) !important;
            border-color: rgba(139, 92, 246, 0.7) !important;
          }
          
          .editor-content {
            outline: none !important;
          }
          
          .editor-content p {
            margin: 0 0 12px 0 !important;
          }
          
          .editor-content ul, .editor-content ol {
            margin: 12px 0 !important;
            padding-left: 20px !important;
          }
          
          .editor-content a {
            color: #8b5cf6 !important;
            text-decoration: underline !important;
          }
          
          .save-button:hover {
            transform: scale(1.02) !important;
            box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4) !important;
          }
          
          .link-dialog {
            position: absolute;
            top: 100%;
            left: 0;
            background: rgba(17, 24, 39, 0.95);
            border: 1px solid #374151;
            border-radius: 8px;
            padding: 16px;
            backdrop-filter: blur(20px);
            z-index: 1000;
            width: 300px;
          }
          
          .link-input {
            width: 100%;
            padding: 8px 12px;
            background: rgba(55, 65, 81, 0.8);
            border: 1px solid #374151;
            border-radius: 6px;
            color: white;
            font-size: 14px;
            margin-bottom: 12px;
          }
          
          .link-buttons {
            display: flex;
            gap: 8px;
            justify-content: flex-end;
          }
          
          .link-button {
            padding: 6px 12px;
            border: none;
            border-radius: 4px;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s;
          }
          
          .link-button.primary {
            background: #8b5cf6;
            color: white;
          }
          
          .link-button.secondary {
            background: transparent;
            color: #d1d5db;
            border: 1px solid #374151;
          }
          
          .link-button:hover {
            opacity: 0.8;
          }
        `}
      </style>
      
      <div style={styles.editorHeader}>
        <Edit />
        <span style={styles.editorTitle}>Signature Editor</span>
      </div>
      
      <div style={styles.editorWrapper}>
        {/* Toolbar */}
        <div style={styles.toolbar}>
          <button
            className="toolbar-button"
            onClick={() => execCommand('bold')}
            title="Bold (Ctrl+B)"
          >
            <Bold />
          </button>
          <button
            className="toolbar-button"
            onClick={() => execCommand('italic')}
            title="Italic (Ctrl+I)"
          >
            <Italic />
          </button>
          <button
            className="toolbar-button"
            onClick={() => execCommand('underline')}
            title="Underline (Ctrl+U)"
          >
            <Underline />
          </button>
          
          <div style={styles.separator}></div>
          
          <button
            className="toolbar-button"
            onClick={() => execCommand('insertUnorderedList')}
            title="Bullet List"
          >
            <ListBullet />
          </button>
          <button
            className="toolbar-button"
            onClick={() => execCommand('insertOrderedList')}
            title="Numbered List"
          >
            <ListNumbered />
          </button>
          
          <div style={styles.separator}></div>
          
          <div style={styles.linkContainer}>
            <button
              className="toolbar-button"
              onClick={() => setShowLinkDialog(!showLinkDialog)}
              title="Insert Link"
            >
              <Link />
            </button>
            {showLinkDialog && (
              <div className="link-dialog">
                <input
                  type="text"
                  className="link-input"
                  placeholder="Enter URL (https://example.com)"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && insertLink()}
                  autoFocus
                />
                <div className="link-buttons">
                  <button
                    className="link-button secondary"
                    onClick={() => {
                      setShowLinkDialog(false)
                      setLinkUrl('')
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="link-button primary"
                    onClick={insertLink}
                  >
                    Insert
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div style={styles.separator}></div>
          
          <button
            className="toolbar-button"
            onClick={() => execCommand('removeFormat')}
            title="Clear Formatting"
          >
            <ClearFormat />
          </button>
        </div>
        
        {/* Editor */}
        <div
          ref={editorRef}
          className="editor-content"
          contentEditable={true}
          style={styles.editor}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          suppressContentEditableWarning={true}
        >
          {!value && <div style={{ color: '#9ca3af', pointerEvents: 'none' }}>Enter your email signature...</div>}
        </div>
      </div>
      
      <div style={styles.actions}>
        <div style={styles.hint}>
          <span style={styles.hintIcon}>💡</span>
          <span style={styles.hintText}>
            Use the toolbar above to format your signature. Try Ctrl+B for bold, Ctrl+I for italic, Ctrl+U for underline
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
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
    border: '1px solid #374151'
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '16px',
    background: 'linear-gradient(145deg, rgba(55, 65, 81, 0.8), rgba(17, 24, 39, 0.8))',
    borderBottom: '1px solid #374151',
    flexWrap: 'wrap'
  },
  separator: {
    width: '1px',
    height: '24px',
    background: '#374151',
    margin: '0 8px'
  },
  linkContainer: {
    position: 'relative'
  },
  editor: {
    minHeight: '200px',
    padding: '24px',
    background: 'linear-gradient(145deg, rgba(17, 24, 39, 0.8), rgba(0, 0, 0, 0.8))',
    color: 'white',
    fontSize: '14px',
    fontFamily: 'Arial, sans-serif',
    lineHeight: '1.6',
    overflowY: 'auto'
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

export default SigEditor