import React, { useRef, useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Save, Edit, Bold, Italic, Underline, Link, List, ArrowLeft, Palette, Type, AlignLeft, AlignCenter, AlignRight, AlignJustify, Strikethrough, Plus, Minus } from 'lucide-react'
import { Helmet } from "react-helmet"
import './SigEditor.css'

const SigEditor = ({ value = '', setValue, onBack, onSave, showHeader = true, compact = false }) => {
  const editorRef = useRef(null)
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)
  const [selectedColor, setSelectedColor] = useState('#000000')
  const [isInitialized, setIsInitialized] = useState(false)
  const [selectedText, setSelectedText] = useState('')
  const [selectedRange, setSelectedRange] = useState(null)
  const [currentFontSize, setCurrentFontSize] = useState(4) // Start at size 4 (14px) - normal size

  // Font size mapping: 1=8px, 2=10px, 3=12px, 4=14px, 5=18px, 6=24px, 7=36px
  const fontSizeMap = {
    1: '8px',
    2: '10px', 
    3: '12px',
    4: '14px',
    5: '18px',
    6: '24px',
    7: '36px'
  }

  // Initialize editor content only once, then let it be uncontrolled
  useEffect(() => {
    if (editorRef.current && !isInitialized) {
      editorRef.current.innerHTML = value || ''
      setIsInitialized(true)
    }
  }, [value, isInitialized])

  const execCommand = useCallback((command, value = null) => {
    try {
      if (editorRef.current) {
        editorRef.current.focus()
        document.execCommand(command, false, value)
      }
    } catch (error) {
      console.error('Error executing command:', error)
    }
  }, [])

  // Only call onSave callback, don't update state during save to avoid React DOM conflicts
  const handleSave = useCallback(() => {
    try {
      if (editorRef.current && onSave) {
        const content = editorRef.current.innerHTML
        onSave(content)
      }
    } catch (error) {
      console.error('Error in handleSave:', error)
    }
  }, [onSave])

  const handleBack = useCallback(() => {
    try {
      if (onBack) {
        onBack()
      }
    } catch (error) {
      console.error('Error in handleBack:', error)
    }
  }, [onBack])

  const handleKeyDown = useCallback((e) => {
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
        case 's':
          e.preventDefault()
          execCommand('strikeThrough')
          break
      }
    }
  }, [execCommand])

  const handleSelectionChange = useCallback(() => {
    try {
      const selection = window.getSelection()
      if (selection.toString().trim()) {
        setSelectedText(selection.toString().trim())
        setSelectedRange(selection.getRangeAt(0).cloneRange())
      } else {
        setSelectedText('')
        setSelectedRange(null)
      }
    } catch (error) {
      console.error('Error in handleSelectionChange:', error)
    }
  }, [])

  const handleLinkSubmit = useCallback(() => {
    try {
      if (linkUrl.trim()) {
        const selection = window.getSelection()
        
        // If there's selected text, restore the selection
        if (selectedRange) {
          selection.removeAllRanges()
          selection.addRange(selectedRange)
        }
        
        // Create the link
        execCommand('createLink', linkUrl.trim())
        
        setIsLinkDialogOpen(false)
        setLinkUrl('')
        setSelectedText('')
        setSelectedRange(null)
      }
    } catch (error) {
      console.error('Error in handleLinkSubmit:', error)
    }
  }, [linkUrl, selectedRange, execCommand])

  const handleColorSelect = useCallback((color) => {
    try {
      setSelectedColor(color)
      execCommand('foreColor', color)
      setIsColorPickerOpen(false)
    } catch (error) {
      console.error('Error in handleColorSelect:', error)
    }
  }, [execCommand])

  const increaseFontSize = useCallback(() => {
    try {
      if (editorRef.current && currentFontSize < 7) {
        editorRef.current.focus()
        
        // Use the actual font size value directly
        const newSize = currentFontSize + 1
        execCommand('fontSize', newSize.toString())
        setCurrentFontSize(newSize)
      }
    } catch (error) {
      console.error('Error increasing font size:', error)
    }
  }, [currentFontSize, execCommand])

  const decreaseFontSize = useCallback(() => {
    try {
      if (editorRef.current && currentFontSize > 1) {
        editorRef.current.focus()
        
        // Use the actual font size value directly
        const newSize = currentFontSize - 1
        execCommand('fontSize', newSize.toString())
        setCurrentFontSize(newSize)
      }
    } catch (error) {
      console.error('Error decreasing font size:', error)
    }
  }, [currentFontSize, execCommand])

  const colors = [
    '#000000', '#374151', '#6B7280', '#9CA3AF',
    '#EF4444', '#F97316', '#EAB308', '#22C55E',
    '#3B82F6', '#8B5CF6', '#EC4899', '#F43F5E'
  ]

  return (
    <>
      <Helmet>
        <title>Larynx AI | Sign Off Editor</title>
        <link rel="canonical" href="https://www.larynxai.com/sig-editor" />
      </Helmet>
      
      <div className="bg-white overflow-hidden relative" style={{ width: '100vw', maxWidth: '100%' }}>
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-purple-200/20 to-blue-200/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, -30, 0]
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-3/4 right-1/4 w-48 h-48 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              x: [0, -30, 0],
              y: [0, 20, 0]
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-32 h-32 bg-gradient-to-br from-indigo-200/20 to-purple-200/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              x: [0, 20, 0],
              y: [0, -40, 0]
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        {/* Main Content */}
        <div className={`relative z-10 ${compact ? 'pt-0 pb-0' : 'pt-16 pb-8'}`}>
          <div className="max-w-6xl mx-auto px-6">
            {/* Header - Only show when showHeader is true */}
            {showHeader && (
              <motion.div
                className="text-center mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center justify-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <Edit className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-4xl font-bold text-gray-900">Sign Off Editor</h1>
                </div>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Create a professional email sign off that matches your brand. Use the toolbar below to format your text.
                </p>
              </motion.div>
            )}

            {/* Editor Card */}
            <motion.div
              className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Toolbar */}
              <div className="flex items-center gap-2 p-4 bg-gray-50 border-b border-gray-200 flex-wrap">
                {/* Text Formatting */}
                <div className="flex items-center space-x-1">
                  <button
                    className="toolbar-button"
                    onClick={() => execCommand('bold')}
                    title="Bold (Ctrl+B)"
                  >
                    <Bold size={16} />
                  </button>
                  <button
                    className="toolbar-button"
                    onClick={() => execCommand('italic')}
                    title="Italic (Ctrl+I)"
                  >
                    <Italic size={16} />
                  </button>
                  <button
                    className="toolbar-button"
                    onClick={() => execCommand('underline')}
                    title="Underline (Ctrl+U)"
                  >
                    <Underline size={16} />
                  </button>
                  <button
                    className="toolbar-button"
                    onClick={() => execCommand('strikeThrough')}
                    title="Strikethrough (Ctrl+S)"
                  >
                    <Strikethrough size={16} />
                  </button>
                </div>

                <div className="w-px h-6 bg-gray-300 mx-2"></div>

                {/* Font Size Controls with A indicator */}
                <div className="flex items-center space-x-1">
                  <button
                    className="toolbar-button"
                    onClick={decreaseFontSize}
                    title="Decrease Font Size"
                    disabled={currentFontSize <= 1}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-200 rounded">
                    A
                  </span>
                  <button
                    className="toolbar-button"
                    onClick={increaseFontSize}
                    title="Increase Font Size"
                    disabled={currentFontSize >= 7}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <div className="w-px h-6 bg-gray-300 mx-2"></div>

                {/* Alignment */}
                <div className="flex items-center space-x-1">
                  <button
                    className="toolbar-button"
                    onClick={() => execCommand('justifyLeft')}
                    title="Align Left"
                  >
                    <AlignLeft size={16} />
                  </button>
                  <button
                    className="toolbar-button"
                    onClick={() => execCommand('justifyCenter')}
                    title="Align Center"
                  >
                    <AlignCenter size={16} />
                  </button>
                  <button
                    className="toolbar-button"
                    onClick={() => execCommand('justifyRight')}
                    title="Align Right"
                  >
                    <AlignRight size={16} />
                  </button>
                  <button
                    className="toolbar-button"
                    onClick={() => execCommand('justifyFull')}
                    title="Justify"
                  >
                    <AlignJustify size={16} />
                  </button>
                </div>

                <div className="w-px h-6 bg-gray-300 mx-2"></div>

                {/* Links and Lists */}
                <div className="flex items-center space-x-1">
                  <button
                    className="toolbar-button"
                    onClick={() => setIsLinkDialogOpen(true)}
                    title="Add Link (select text first)"
                  >
                    <Link size={16} />
                  </button>
                  <button
                    className="toolbar-button"
                    onClick={() => execCommand('insertUnorderedList')}
                    title="Bullet List"
                  >
                    <List size={16} />
                  </button>
                </div>

                <div className="w-px h-6 bg-gray-300 mx-2"></div>

                {/* Color Picker */}
                <div className="relative">
                  <button
                    className="toolbar-button"
                    onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                    title="Text Color"
                  >
                    <Palette size={16} />
                  </button>
                  
                  {isColorPickerOpen && (
                    <motion.div
                      className="absolute top-full left-0 mt-2 p-4 bg-white border border-gray-200 rounded-xl shadow-lg z-50 min-w-max"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="color-palette-grid">
                        {colors.map((color) => (
                          <button
                            key={color}
                            className="color-swatch"
                            style={{ backgroundColor: color }}
                            onClick={() => handleColorSelect(color)}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Editor - Uncontrolled */}
              <div
                ref={editorRef}
                className={`editor-content ${compact ? 'p-3' : 'p-6'} ${compact ? 'min-h-[150px]' : 'min-h-[300px]'} text-gray-800 text-base leading-relaxed focus:outline-none bg-white`}
                contentEditable={true}
                onKeyDown={handleKeyDown}
                onSelect={handleSelectionChange}
                suppressContentEditableWarning={true}
                style={{ minHeight: compact ? '150px' : '300px' }}
              >
                {!value && (
                  <div className="text-gray-400 pointer-events-none">
                    Best Regards,
                    <br />
                    Your Name
                    <br />
                    <span className="text-sm">Company Name | Phone | Email</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              className={`flex flex-col lg:flex-row lg:justify-between items-center ${compact ? 'gap-4 mt-4' : 'gap-6 mt-8'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className={`flex items-start space-x-3 ${compact ? 'p-3' : 'p-4'} bg-blue-50 border border-blue-200 rounded-xl lg:flex-1 lg:max-w-2xl w-full`}>
                <div className="text-lg flex-shrink-0 mt-0.5">
                  💡
                </div>
                <div>
                  <p className="text-blue-800 font-medium text-sm">Pro Tips</p>
                  <p className="text-blue-700 text-sm leading-relaxed">
                    Use keyboard shortcuts: Ctrl+B for bold, Ctrl+I for italic, Ctrl+U for underline, Ctrl+S for strikethrough. 
                    Select text and click the link button to add hyperlinks.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 lg:flex-shrink-0 lg:ml-4 w-full lg:w-auto">
                {onBack && (
                  <button
                    onClick={handleBack}
                    className="px-6 py-3 border border-purple-300 text-purple-700 bg-white rounded-xl hover:bg-purple-50 hover:border-purple-400 transition-all duration-200 font-medium flex items-center justify-center space-x-2"
                  >
                    <ArrowLeft size={20} />
                    <span>Back</span>
                  </button>
                )}
                <button
                  onClick={handleSave}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium flex items-center justify-center space-x-2"
                >
                  <Save size={20} />
                  <span>Save Sign Off</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Link Dialog */}
        {isLinkDialogOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 w-full max-w-md"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Link</h3>
              {selectedText && (
                <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm text-purple-800 font-medium">Selected text:</p>
                  <p className="text-purple-700">"{selectedText}"</p>
                </div>
              )}
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                autoFocus
              />
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setIsLinkDialogOpen(false)
                    setLinkUrl('')
                    setSelectedText('')
                    setSelectedRange(null)
                  }}
                  className="px-6 py-2 border border-purple-300 text-purple-700 bg-white rounded-xl hover:bg-purple-50 hover:border-purple-400 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLinkSubmit}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
                >
                  Add Link
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </>
  )
}

export default SigEditor