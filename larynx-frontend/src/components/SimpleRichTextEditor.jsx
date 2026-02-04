import React, { useRef, useState, useEffect, useCallback } from 'react'
import { Bold, Italic, Underline, Palette, Plus, Minus } from 'lucide-react'
import { motion } from 'framer-motion'
import '../pages/SigEditor.css'

const SimpleRichTextEditor = ({ value = '', onChange, placeholder = '', minHeight = '120px' }) => {
  const editorRef = useRef(null)
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)
  const [selectedColor, setSelectedColor] = useState('#000000')
  const [currentFontSize, setCurrentFontSize] = useState(4) // Size 4 = 20px

  // Font size mapping
  const fontSizeMap = {
    1: '8px',
    2: '10px', 
    3: '12px',
    4: '20px', // Normal text size
    5: '18px',
    6: '24px',
    7: '36px'
  }

  // Initialize editor content - only set initial value, don't update on every change
  useEffect(() => {
    if (editorRef.current && !editorRef.current.hasAttribute('data-initialized')) {
      if (value) {
        editorRef.current.innerHTML = value
        editorRef.current.removeAttribute('data-empty')
      } else {
        editorRef.current.innerHTML = ''
        editorRef.current.setAttribute('data-empty', 'true')
      }
      editorRef.current.setAttribute('data-initialized', 'true')
    }
  }, []) // Only run once on mount

  // Sync content changes to parent - use requestAnimationFrame to avoid cursor jumping
  const handleInput = useCallback((e) => {
    // Use requestAnimationFrame to batch updates and preserve cursor
    requestAnimationFrame(() => {
      if (onChange && editorRef.current) {
        onChange(editorRef.current.innerHTML)
      }
      // Update placeholder visibility
      if (editorRef.current) {
        const isEmpty = !editorRef.current.textContent || editorRef.current.textContent.trim() === ''
        if (isEmpty) {
          editorRef.current.setAttribute('data-empty', 'true')
        } else {
          editorRef.current.removeAttribute('data-empty')
        }
      }
    })
  }, [onChange])

  const execCommand = useCallback((command, value = null) => {
    try {
      if (editorRef.current) {
        editorRef.current.focus()
        document.execCommand(command, false, value)
        handleInput()
      }
    } catch (error) {
      console.error('Error executing command:', error)
    }
  }, [handleInput])

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
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 bg-gray-50 border-b border-gray-200 flex-wrap">
        {/* Text Formatting */}
        <div className="flex items-center space-x-1">
          <button
            type="button"
            className="p-2 bg-white hover:bg-gray-100 rounded transition-colors text-gray-700 border border-gray-200"
            onClick={() => execCommand('bold')}
            title="Bold (Ctrl+B)"
          >
            <Bold size={16} />
          </button>
          <button
            type="button"
            className="p-2 bg-white hover:bg-gray-100 rounded transition-colors text-gray-700 border border-gray-200"
            onClick={() => execCommand('italic')}
            title="Italic (Ctrl+I)"
          >
            <Italic size={16} />
          </button>
          <button
            type="button"
            className="p-2 bg-white hover:bg-gray-100 rounded transition-colors text-gray-700 border border-gray-200"
            onClick={() => execCommand('underline')}
            title="Underline (Ctrl+U)"
          >
            <Underline size={16} />
          </button>
        </div>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Font Size Controls */}
        <div className="flex items-center space-x-1">
          <button
            type="button"
            className="p-2 bg-white hover:bg-gray-100 rounded transition-colors disabled:opacity-50 text-gray-700 border border-gray-200"
            onClick={decreaseFontSize}
            title="Decrease Font Size"
            disabled={currentFontSize <= 1}
          >
            <Minus size={16} />
          </button>
          <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded">
            A
          </span>
          <button
            type="button"
            className="p-2 bg-white hover:bg-gray-100 rounded transition-colors disabled:opacity-50 text-gray-700 border border-gray-200"
            onClick={increaseFontSize}
            title="Increase Font Size"
            disabled={currentFontSize >= 7}
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Color Picker */}
        <div className="relative">
          <button
            type="button"
            className="p-2 bg-white hover:bg-gray-100 rounded transition-colors text-gray-700 border border-gray-200"
            onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
            title="Text Color"
          >
            <Palette size={16} />
          </button>
          
          {isColorPickerOpen && (
            <motion.div
              className="absolute top-full left-0 mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="grid grid-cols-4 gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-500 transition-colors"
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorSelect(color)}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        className="editor-content p-4 text-gray-800 leading-relaxed focus:outline-none"
        contentEditable={true}
        onInput={handleInput}
        onBlur={handleInput}
        style={{ minHeight, direction: 'ltr', fontSize: '16px' }}
        dir="ltr"
        suppressContentEditableWarning={true}
        data-placeholder={placeholder}
      />
    </div>
  )
}

export default SimpleRichTextEditor

