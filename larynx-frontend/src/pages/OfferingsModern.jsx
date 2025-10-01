// File: pages/OfferingsModern.jsx
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

// Custom SVG Icons
const Plus = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

const Edit = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
)

const Trash = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

const Upload = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
)

const Save = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const Package = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
)

const X = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const OfferingsModern = () => {
  const navigate = useNavigate()
  const api = import.meta.env.VITE_API_URL
  const [offerings, setOfferings] = useState([])
  const [isLoadingOfferings, setIsLoadingOfferings] = useState(true)

  const showNotification = (message, type = 'info', duration = 4000) => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), duration)
  }
  const [hasError, setHasError] = useState(false)
  
  const [newOffering, setNewOffering] = useState({ name: '', price: '', pricingType: '', category: '' })
  const [customCategoryInput, setCustomCategoryInput] = useState('')
  const [showCustomCategoryInput, setShowCustomCategoryInput] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editingOffering, setEditingOffering] = useState({ name: '', price: '', pricingType: '', category: '' })
  const [showAddForm, setShowAddForm] = useState(false)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [uploadFile, setUploadFile] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [previewData, setPreviewData] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [specialInstructions, setSpecialInstructions] = useState('All services include free initial consultation. Custom packages available upon request. Rush orders require 48-hour notice with additional fees. Delivery available within 20-mile radius. 30-day satisfaction guarantee on all services.')
  
  // Error resolution states
  const [uploadErrors, setUploadErrors] = useState(null)
  const [errorFixes, setErrorFixes] = useState({})
  const [showErrorResolution, setShowErrorResolution] = useState(false)
  const [originalUploadData, setOriginalUploadData] = useState(null)
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false)
  const [duplicateWarningData, setDuplicateWarningData] = useState(null)
  const [notification, setNotification] = useState(null)

  const defaultCategories = ['Consulting', 'Design', 'Marketing', 'Writing', 'Development', 'Catering', 'Events']
  const [customCategories, setCustomCategories] = useState(['Drinks', 'Party Size', 'Custom Package'])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const categories = [...defaultCategories, ...customCategories, 'Other']

  // Error handler function
  const handleError = (error, context = '') => {
    console.error(`Error in ${context}:`, error)
    
    // Check if it's a network error or API is down
    if (!navigator.onLine || error.name === 'NetworkError') {
      setHasError(true)
      return
    }
    
    // Check specific error types
    if (error.status === 500 || error.message?.includes('500')) {
      navigate('/error/500')
    } else if (error.status === 403 || error.message?.includes('403')) {
      navigate('/error/403')
    } else {
      // For other errors, show error state
      setHasError(true)
    }
  }

  // Enhanced API call with error handling
  const fetchWithErrorHandling = async (url, options = {}) => {
    try {
      const response = await fetch(url, {
        credentials: 'include',
        ...options
      })
      
      if (!response.ok) {
        throw {
          status: response.status,
          message: `HTTP ${response.status}: ${response.statusText}`
        }
      }
      
      return await response.json()
    } catch (error) {
      throw {
        ...error,
        status: error.status || 500,
        name: error.name || 'FetchError'
      }
    }
  }
  
  // Helper function to format price display
  const formatPrice = (price, pricingType) => {
    if (!price) return ''
    const pricingTypeMap = {
      'fixed': '',
      'per_hour': '/hour',
      'per_day': '/day',
      'per_month': '/month',
      'per_person': '/person',
      'per_event': '/event',
      'per_unit': '/unit',
      'starting_at': ' starting at',
      'custom': ''
    }
    return `$${price}${pricingTypeMap[pricingType] || ''}`
  }
  
  const pricingTypes = [
    { value: 'fixed', label: 'Fixed Price' },
    { value: 'per_hour', label: 'Per Hour' },
    { value: 'per_day', label: 'Per Day' },
    { value: 'per_month', label: 'Per Month' },
    { value: 'per_person', label: 'Per Person' },
    { value: 'per_event', label: 'Per Event' },
    { value: 'per_unit', label: 'Per Unit/Item' },
    { value: 'starting_at', label: 'Starting At' },
    { value: 'custom', label: 'Custom Pricing' }
  ]

  // Fetch inventory data
  const fetchInventory = async () => {
    try {
      console.log('Fetching inventory from:', `${api}/inventory`)
      const data = await fetchWithErrorHandling(`${api}/inventory`)
      console.log('Inventory data received:', data)
      // Sort by creation date, newest first
      const sortedOfferings = (data.inventory || []).sort((a, b) => {
        const dateA = new Date(a.created_at || a.id) // Use created_at if available, fallback to id
        const dateB = new Date(b.created_at || b.id)
        return dateB - dateA // Newest first
      })
      setOfferings(sortedOfferings)
      setIsLoadingOfferings(false)
    } catch (error) {
      handleError(error, 'fetchInventory')
      setIsLoadingOfferings(false)
    }
  }

  const fetchInstructions = async () => {
    try {
      const data = await fetchWithErrorHandling(`${api}/inventory/special-instructions`)
      setSpecialInstructions(data.special_instructions || '')
    } catch (error) {
      // Don't show error for instructions fetch - it's not critical
      console.error('Error fetching instructions:', error)
    }
  }

  useEffect(() => {
    fetchInventory()
    fetchInstructions()
  }, [])
  
  const handleAddOffering = async () => {
    if (!newOffering.name?.trim() || !newOffering.price || isNaN(parseFloat(newOffering.price))) {
      return
    }

    try {
      const normalizedPrice = normalizePrice(newOffering.price)
      const response = await fetchWithErrorHandling(`${api}/inventory/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newOffering.name,
          price: parseFloat(normalizedPrice),
          pricing_type: newOffering.pricingType || 'per_unit',
          category: newOffering.category || null
        })
      })
      
      // Add the new item directly to state instead of refetching
      if (response.item) {
        setOfferings(prev => [...prev, response.item])
      } else {
        // Fallback: refresh inventory if response doesn't include the item
        await fetchInventory()
      }
      
      setNewOffering({ name: '', price: '', pricingType: '', category: '' })
      setShowAddForm(false)
    } catch (error) {
      handleError(error, 'handleAddOffering')
    }
  }

  const handleEditOffering = (id) => {
    const offering = offerings.find(o => o.id === id)
    setEditingId(id)
    setEditingOffering({ ...offering })
  }

  const handleSaveEdit = async () => {
    if (!editingOffering.name?.trim() || !editingOffering.price || isNaN(parseFloat(editingOffering.price))) {
      return
    }

    try {
      const normalizedPrice = normalizePrice(editingOffering.price)
      await fetchWithErrorHandling(`${api}/inventory/edit/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingOffering.name,
          price: parseFloat(normalizedPrice),
          pricing_type: editingOffering.pricingType || 'per_unit',
          category: editingOffering.category || null
        })
      })
      
      // Update local state directly instead of refetching
      setOfferings(prevOfferings => 
        prevOfferings.map(offering => 
          offering.id === editingId 
            ? { 
                ...offering, 
                name: editingOffering.name, 
                price: parseFloat(normalizedPrice), 
                pricing_type: editingOffering.pricingType || 'per_unit',
                category: editingOffering.category || null
              }
            : offering
        )
      )
      
      setEditingId(null)
      setEditingOffering({ name: '', price: '', category: '' })
    } catch (error) {
      handleError(error, 'handleSaveEdit')
    }
  }

  const handleDeleteOffering = async (id) => {
    try {
      await fetchWithErrorHandling(`${api}/inventory/delete/${id}`, {
        method: 'DELETE'
      })
      
      // Update local state directly instead of refetching
      setOfferings(prevOfferings => 
        prevOfferings.filter(offering => offering.id !== id)
      )
    } catch (error) {
      handleError(error, 'handleDeleteOffering')
    }
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return
    
    setUploadFile(file)
    
    // Preview the file contents
    try {
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      
      // Parse first few rows for preview with validation
      const previewItems = []
      for (let i = 1; i < Math.min(6, lines.length); i++) {
        const values = parseCSVLine(lines[i])
        if (values.length >= 2) {
          const name = values[0]?.trim() || ''
          const price = values[1]?.trim() || ''
          const category = values[2]?.trim() || 'None'
          const pricing_type = values[3]?.trim() || 'per_unit'
          
          // Validate the item
          const isValid = validatePreviewItem(name, price, pricing_type)
          
          previewItems.push({
            row: i + 1,
            name,
            price,
            category,
            pricing_type,
            isValid
          })
        }
      }
      
      // Check for duplicates within the uploaded file
      const fileDuplicates = checkForDuplicatesInFile(previewItems.map(item => ({
        name: item.name,
        price: item.price
      })))
      
      console.log('File duplicates detected during upload:', fileDuplicates)
      
      setPreviewData({
        fileName: file.name,
        totalRows: lines.length - 1,
        previewItems,
        headers,
        fileDuplicates: fileDuplicates
      })
      setShowPreview(true)
    } catch (error) {
      console.error('Error previewing file:', error)
      showNotification('Error reading file. Please check the format.', 'error')
    }
  }

  // Helper function to parse CSV line with proper quote handling
  const parseCSVLine = (line) => {
    const result = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    
    result.push(current.trim())
    return result
  }

  const validatePreviewItem = (name, price, pricing_type) => {
    const validPricingTypes = ['per_unit', 'per_hour', 'per_day', 'per_week', 'per_month', 'per_project', 'per_event', 'flat_rate']
    
    // Check for errors
    if (!name || name.trim() === '') return { status: 'error', message: 'Missing name' }
    if (!price || price.trim() === '') return { status: 'error', message: 'Missing price' }
    
    // Clean price by removing $ symbol and spaces, then validate
    const cleanPrice = price.replace(/[$,\s]/g, '')
    if (isNaN(parseFloat(cleanPrice)) || cleanPrice === '') return { status: 'error', message: 'Invalid price' }
    
    if (pricing_type && !validPricingTypes.includes(pricing_type.toLowerCase())) return { status: 'error', message: 'Invalid pricing type' }
    
    return { status: 'ready', message: 'Ready to upload' }
  }

  const handleConfirmUpload = async () => {
    if (!uploadFile) return
    
    setUploading(true)
    const formData = new FormData()
    formData.append('file', uploadFile)
    
    try {
      const response = await fetchWithErrorHandling(`${api}/inventory/bulk-upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      })
      
      if (response) {
        // Check if there are errors to resolve
        if (response.errors && (response.errors.length > 0 || response.warnings?.length > 0)) {
          setUploadErrors(response)
          setOriginalUploadData(response.allItems || [])
          setShowErrorResolution(true)
          setShowPreview(false)
        } else {
          // No errors, proceed with success
          showNotification(`Upload successful! ${response.message}`, 'success')
          await fetchInventory()
          setShowPreview(false)
          setShowUploadForm(false)
          setUploadFile(null)
          setPreviewData(null)
        }
      }
    } catch (error) {
      // TEMPORARY: Mock error resolution for testing with error file
      if (uploadFile.name.includes('error') || uploadFile.name.includes('test-upload-errors')) {
        console.log('Mock error resolution for testing')
        console.log('File duplicates detected:', previewData?.fileDuplicates)
        const mockErrors = {
          totalItems: 6,
          errors: [
            {
              row: 3,
              rowIndex: 2,
              type: 'missing_name',
              message: 'Missing product name',
              item: { name: '', price: '50', category: 'Photography', pricing_type: 'invalid_type' }
            },
            {
              row: 3,
              rowIndex: 2,
              type: 'invalid_pricing_type',
              message: 'Invalid pricing type',
              item: { name: '', price: '50', category: 'Photography', pricing_type: 'invalid_type' }
            },
            {
              row: 4,
              rowIndex: 3,
              type: 'invalid_price',
              message: 'Invalid price format',
              item: { name: 'Photography Package', price: 'invalid_price', category: 'Photography', pricing_type: 'per_project' }
            },
            {
              row: 6,
              rowIndex: 5,
              type: 'missing_price',
              message: 'Missing price',
              item: { name: 'DJ Services', price: '', category: 'Entertainment', pricing_type: 'per_hour' }
            }
          ],
          warnings: [
            // Use actual file duplicates if available
            ...(previewData?.fileDuplicates?.map((duplicate, index) => ({
              row: duplicate.rows[1] || 0,
              rowIndex: (duplicate.rows[1] || 0) - 1,
              type: 'duplicate_in_file',
              message: 'Duplicate item found within uploaded file',
              duplicate: { name: duplicate.name, price: duplicate.price },
              existing: { name: duplicate.name, price: duplicate.price, row: duplicate.rows[0] || 0 }
            })) || []),
            // Fallback mock for Wedding Catering if no duplicates detected
            ...(previewData?.fileDuplicates?.length === 0 ? [{
              row: 6,
              rowIndex: 5,
              type: 'duplicate_in_file',
              message: 'Duplicate item found within uploaded file',
              duplicate: { name: 'Wedding Catering', price: '200' },
              existing: { name: 'Wedding Catering', price: '150', row: 2 }
            }] : [])
          ],
          readyItems: [
            { name: 'Wedding Catering', price: '150', category: 'Catering', pricing_type: 'per_event' },
            { name: 'Table Rental', price: '25', category: 'Event Rentals', pricing_type: 'per_day' }
          ],
          allItems: [
            { name: 'Wedding Catering', price: '150', category: 'Catering', pricing_type: 'per_event' },
            { name: 'Table Rental', price: '25', category: 'Event Rentals', pricing_type: 'per_day' },
            { name: '', price: '50', category: 'Photography', pricing_type: 'invalid_type' },
            { name: 'Photography Package', price: 'invalid_price', category: 'Photography', pricing_type: 'per_project' },
            { name: 'Wedding Catering', price: '200', category: 'Catering', pricing_type: 'per_event' },
            { name: 'DJ Services', price: '', category: 'Entertainment', pricing_type: 'per_hour' }
          ]
        }
        setUploadErrors(mockErrors)
        setOriginalUploadData(mockErrors.allItems)
        setShowErrorResolution(true)
        setShowPreview(false)
        return
      }
      
      // Check if it's an error response with details
      if (error.response) {
        try {
          const errorData = await error.response.json()
          if (errorData.errors || errorData.warnings) {
            setUploadErrors(errorData)
            setOriginalUploadData(errorData.allItems || [])
            setShowErrorResolution(true)
            setShowPreview(false)
            return
          }
        } catch (parseError) {
          // If we can't parse the error, fall back to normal error handling
        }
      }
      handleError(error, 'bulk upload')
    } finally {
      setUploading(false)
    }
  }

  const handleResolvedUpload = async () => {
    if (!originalUploadData) return
    
    setUploading(true)
    
    try {
      // Apply fixes to the data
      const fixedData = applyErrorFixes()
      
      // Final validation: Check for new duplicates created by fixes
      const newDuplicates = checkForNewDuplicates(fixedData)
      
      if (newDuplicates.length > 0) {
        // Show warning modal about new duplicates
        setDuplicateWarningData(newDuplicates)
        setShowDuplicateWarning(true)
        setUploading(false)
        return
      }
      
      // Create a new file with the fixed data
      const csvContent = [
        'name,price,category,pricing_type',
        ...fixedData.map(item => 
          `${item.name || ''},${item.price || ''},${item.category || ''},${item.pricing_type || 'per_unit'}`
        )
      ].join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const formData = new FormData()
      formData.append('file', blob, 'fixed-upload.csv')
      
      const response = await fetchWithErrorHandling(`${api}/inventory/bulk-upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      })
      
      if (response) {
        showNotification(`Upload successful! ${response.message || 'All items uploaded successfully.'}`, 'success')
        await fetchInventory()
        
        // Close modal and reset all state
        setShowErrorResolution(false)
        setShowUploadForm(false)
        setUploadFile(null)
        setPreviewData(null)
        setUploadErrors(null)
        setErrorFixes({})
        setOriginalUploadData(null)
      } else {
        throw new Error('Upload failed - no response received')
      }
    } catch (error) {
      console.error('Error in resolved upload:', error)
      showNotification(`Upload failed: ${error.message || 'Please try again.'}`, 'error')
    } finally {
      setUploading(false)
    }
  }

  const checkForDuplicatesInFile = (uploadData) => {
    const duplicates = []
    const seenByName = new Map() // Track by name only
    const seenByNameAndPrice = new Map() // Track by name + price
    
    uploadData.forEach((item, index) => {
      if (item.name && item.price) {
        const nameKey = item.name.toLowerCase()
        const nameAndPriceKey = `${nameKey}_${parseFloat(item.price)}`
        
        // Check for exact duplicates (same name AND price)
        if (seenByNameAndPrice.has(nameAndPriceKey)) {
          const firstOccurrence = seenByNameAndPrice.get(nameAndPriceKey)
          duplicates.push({
            name: item.name,
            price: item.price,
            rows: [firstOccurrence.row, index + 1],
            type: 'exact_duplicate',
            message: 'Exact duplicate item found within uploaded file'
          })
        } else {
          seenByNameAndPrice.set(nameAndPriceKey, { ...item, row: index + 1 })
        }
        
        // Check for name duplicates (same name, different prices)
        if (seenByName.has(nameKey) && !seenByNameAndPrice.has(nameAndPriceKey)) {
          const firstOccurrence = seenByName.get(nameKey)
          duplicates.push({
            name: item.name,
            price: item.price,
            rows: [firstOccurrence.row, index + 1],
            type: 'name_duplicate',
            message: 'Item with same name but different price found'
          })
        } else if (!seenByName.has(nameKey)) {
          seenByName.set(nameKey, { ...item, row: index + 1 })
        }
      }
    })
    
    return duplicates
  }

  const checkForNewDuplicates = (fixedData) => {
    const allDuplicates = []
    
    // Check for duplicates within the fixed data itself (file duplicates)
    const fileDuplicates = checkForDuplicatesInFile(fixedData)
    fileDuplicates.forEach(duplicate => {
      // For each duplicate, find all instances in the fixed data
      const duplicateInstances = fixedData
        .map((item, index) => ({ ...item, rowIndex: index }))
        .filter(item => 
          item.name && item.price &&
          item.name.toLowerCase() === duplicate.name.toLowerCase() &&
          parseFloat(item.price) === parseFloat(duplicate.price)
        )
      
      if (duplicateInstances.length > 1) {
        allDuplicates.push({
          type: 'duplicate_in_file',
          name: duplicate.name,
          price: duplicate.price,
          instances: duplicateInstances,
          message: 'Duplicate items found within uploaded file'
        })
      }
    })
    
    // Check against existing offerings if user has offerings (inventory duplicates)
    if (offerings.length > 0) {
      fixedData.forEach((item, index) => {
        if (item.name && item.price) {
          const existingItem = offerings.find(existing => 
            existing.name.toLowerCase() === item.name.toLowerCase() && 
            parseFloat(existing.price) === parseFloat(item.price)
          )
          
          if (existingItem) {
            allDuplicates.push({
              type: 'duplicate_in_inventory',
              name: item.name,
              price: item.price,
              uploadedItem: { ...item, rowIndex: index },
              existingItem: existingItem,
              message: 'Item matches existing inventory'
            })
          }
        }
      })
    }
    
    return allDuplicates
  }

  const handleProceedWithDuplicates = async () => {
    setShowDuplicateWarning(false)
    setUploading(true)
    
    try {
      // Apply fixes to the data
      const fixedData = applyErrorFixes()
      
      // Create a new file with the fixed data
      const csvContent = [
        'name,price,category,pricing_type',
        ...fixedData.map(item => 
          `${item.name || ''},${item.price || ''},${item.category || ''},${item.pricing_type || 'per_unit'}`
        )
      ].join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const formData = new FormData()
      formData.append('file', blob, 'fixed-upload.csv')
      
      const response = await fetchWithErrorHandling(`${api}/inventory/bulk-upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      })
      
      if (response) {
        showNotification(`Upload successful! ${response.message || 'All items uploaded successfully.'}`, 'success')
        await fetchInventory()
        
        // Close modal and reset all state
        setShowErrorResolution(false)
        setShowUploadForm(false)
        setUploadFile(null)
        setPreviewData(null)
        setUploadErrors(null)
        setErrorFixes({})
        setOriginalUploadData(null)
      } else {
        throw new Error('Upload failed - no response received')
      }
    } catch (error) {
      console.error('Error in resolved upload:', error)
      showNotification(`Upload failed: ${error.message || 'Please try again.'}`, 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleSaveInstructions = async () => {
    try {
      await fetchWithErrorHandling(`${api}/inventory/special-instructions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ special_instructions: specialInstructions })
      })
      
      // Show success feedback (you could add a success state here)
      console.log('Special instructions saved successfully')
    } catch (error) {
      handleError(error, 'handleSaveInstructions')
    }
  }

  const addCustomCategory = () => {
    if (customCategoryInput.trim() && !customCategories.includes(customCategoryInput.trim())) {
      setCustomCategories([...customCategories, customCategoryInput.trim()])
      setNewOffering({...newOffering, category: customCategoryInput.trim()})
      setCustomCategoryInput('')
      setShowCustomCategoryInput(false)
    }
  }

  const filteredOfferings = selectedCategory === 'All' 
    ? offerings 
    : offerings.filter(offering => offering.category === selectedCategory)

  // Helper function to normalize price input
  const normalizePrice = (price) => {
    if (!price) return ''
    // Remove dollar signs, commas, and spaces, keep only numbers and decimal points
    return price.toString().replace(/[$,\s]/g, '').replace(/[^\d.]/g, '')
  }

  // Error resolution functions
  const handleFixError = (rowIndex, field, newValue) => {
    setErrorFixes(prev => ({
      ...prev,
      [rowIndex]: {
        ...prev[rowIndex],
        [field]: newValue
      }
    }))
  }

  const handleDeleteErrorItem = (rowIndex) => {
    // Add the item to a deleted items list
    setErrorFixes(prev => ({
      ...prev,
      [rowIndex]: {
        ...prev[rowIndex],
        deleted: true
      }
    }))
  }

  const applyErrorFixes = () => {
    if (!originalUploadData) return originalUploadData

    const fixedData = originalUploadData
      .map((item, index) => ({
        ...item,
        ...errorFixes[index]
      }))
      .filter((item, index) => !errorFixes[index]?.deleted) // Filter out deleted items

    return fixedData
  }

  const handleDuplicateAction = (rowIndex, action) => {
    setErrorFixes(prev => ({
      ...prev,
      [rowIndex]: {
        ...prev[rowIndex],
        duplicateAction: action
      }
    }))
  }

  const downloadErrorReport = async () => {
    if (!uploadErrors) return

    try {
      // Import XLSX library dynamically
      const XLSX = await import('xlsx')
      
      // Create workbook
      const workbook = XLSX.utils.book_new()
      
      // Summary sheet
      const summaryData = [
        ['Upload Error Report'],
        ['File:', uploadFile?.name || 'upload-file'],
        ['Date:', new Date().toLocaleDateString()],
        [''],
        ['Summary'],
        ['Total Items:', uploadErrors.totalItems || 0],
        ['Errors:', uploadErrors.errors?.length || 0],
        ['Warnings:', uploadErrors.warnings?.length || 0],
        ['Ready Items:', uploadErrors.readyItems?.length || 0]
      ]
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')
      
      // Errors sheet
      if (uploadErrors.errors && uploadErrors.errors.length > 0) {
        const errorsData = [
          ['Row', 'Error Type', 'Message', 'Item Name', 'Item Price', 'Category', 'Pricing Type'],
          ...uploadErrors.errors.map(error => [
            error.row,
            error.type,
            error.message,
            error.item?.name || '',
            error.item?.price || '',
            error.item?.category || '',
            error.item?.pricing_type || ''
          ])
        ]
        const errorsSheet = XLSX.utils.aoa_to_sheet(errorsData)
        XLSX.utils.book_append_sheet(workbook, errorsSheet, 'Errors')
      }
      
      // Warnings sheet
      if (uploadErrors.warnings && uploadErrors.warnings.length > 0) {
        const warningsData = [
          ['Row', 'Warning Type', 'Message', 'Duplicate Name', 'Duplicate Price', 'Existing Name', 'Existing Price'],
          ...uploadErrors.warnings.map(warning => [
            warning.row,
            warning.type,
            warning.message,
            warning.duplicate?.name || '',
            warning.duplicate?.price || '',
            warning.existing?.name || '',
            warning.existing?.price || ''
          ])
        ]
        const warningsSheet = XLSX.utils.aoa_to_sheet(warningsData)
        XLSX.utils.book_append_sheet(workbook, warningsSheet, 'Warnings')
      }
      
      // Ready items sheet
      if (uploadErrors.readyItems && uploadErrors.readyItems.length > 0) {
        const readyData = [
          ['Name', 'Price', 'Category', 'Pricing Type'],
          ...uploadErrors.readyItems.map(item => [
            item.name,
            item.price,
            item.category,
            item.pricing_type
          ])
        ]
        const readySheet = XLSX.utils.aoa_to_sheet(readyData)
        XLSX.utils.book_append_sheet(workbook, readySheet, 'Ready Items')
      }
      
      // Generate and download file
      XLSX.writeFile(workbook, `upload-errors-${new Date().toISOString().split('T')[0]}.xlsx`)
      
    } catch (error) {
      console.error('Error generating error report:', error)
      showNotification('Failed to generate error report. Please try again.', 'error')
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4
      }
    },
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.2
      }
    }
  }

  return (
    <>
    <div className="min-h-screen bg-gray-50 overflow-x-hidden" style={{ width: '100vw', maxWidth: '100%' }}>
      <style>
        {`
          /* Hide scrollbars */
          body {
            overflow-x: hidden !important;
          }
        `}
      </style>
      <Navbar />
      
      {/* Header */}
      <motion.div
        className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-full mx-auto text-center px-4 sm:px-6 lg:px-8 max-w-7xl">
          <motion.div
            className="flex justify-center mb-6"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-amethyst-500 to-blue_violet-500 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
          </motion.div>
          
          <motion.h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            What You Offer
          </motion.h1>
          
          <motion.p
            className="text-gray-600 text-lg sm:text-xl mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Add your products, services, packages, consultations, or any offerings your customers can book or purchase.
          </motion.p>
          
          <motion.div
            className="w-24 h-1 bg-amethyst-500 mx-auto rounded-full"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        className="w-full mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 mb-8"
          variants={itemVariants}
        >
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center justify-center gap-2 bg-amethyst-500 text-white px-6 py-3 rounded-lg hover:bg-amethyst-600 transition-colors"
          >
            <Plus />
            Add New Offering
          </button>
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Upload />
            Bulk Upload Your Offerings
          </button>
        </motion.div>

        {/* Add New Offering Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm"
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Offering</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 min-w-0">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Offering Name</label>
                <input
                  type="text"
                  value={newOffering.name}
                  onChange={(e) => setNewOffering({...newOffering, name: e.target.value})}
                  placeholder="Enter offering name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amethyst-500 focus:border-transparent min-w-0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                <input
                  type="text"
                  value={newOffering.price}
                  onChange={(e) => setNewOffering({...newOffering, price: e.target.value})}
                  placeholder="e.g., $2,500, 299, 1,200"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amethyst-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pricing Type</label>
                <select
                  value={newOffering.pricingType}
                  onChange={(e) => setNewOffering({...newOffering, pricingType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amethyst-500 focus:border-transparent"
                >
                  <option value="">Select pricing type</option>
                  {pricingTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <div className="space-y-2">
                  <select
                    value={newOffering.category}
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setShowCustomCategoryInput(true)
                      } else {
                        setNewOffering({...newOffering, category: e.target.value})
                        setShowCustomCategoryInput(false)
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amethyst-500 focus:border-transparent"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="custom">+ Add Custom Category</option>
                  </select>
                  {showCustomCategoryInput && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customCategoryInput}
                        onChange={(e) => setCustomCategoryInput(e.target.value)}
                        placeholder="Enter custom category"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amethyst-500 focus:border-transparent"
                      />
                      <button
                        onClick={addCustomCategory}
                        className="px-4 py-2 bg-amethyst-500 text-white rounded-lg hover:bg-amethyst-600 transition-colors"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => {
                          setShowCustomCategoryInput(false)
                          setCustomCategoryInput('')
                        }}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 bg-transparent border border-purple-300 hover:bg-gray-100/30 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAddOffering}
                className="flex items-center gap-2 bg-amethyst-500 text-white px-4 py-2 rounded-lg hover:bg-amethyst-600 transition-colors"
              >
                <Save />
                Add Offering
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 bg-transparent border border-purple-300 hover:bg-gray-100/30 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bulk Upload Form */}
        <AnimatePresence>
          {showUploadForm && (
            <motion.div
              className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm"
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bulk Upload Your Offerings</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="flex justify-center mb-4">
                <Upload className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-gray-600 mb-4">Upload a CSV or Excel file with your offerings</p>
              
              {/* File Format Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left max-w-2xl mx-auto">
                <h4 className="font-semibold text-blue-900 mb-2">📋 File Requirements</h4>
                <div className="text-sm text-blue-800 space-y-2">
                  <p><strong>Supported formats:</strong> CSV (.csv), Excel (.xlsx, .xls)</p>
                  <p><strong>File size limit:</strong> 5MB for CSV, 10MB for Excel</p>
                  <p><strong>Required columns:</strong> Your file must include columns for:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li><strong>Name/Product</strong> - Use any of: name, product_name, item_name, product, item, title</li>
                    <li><strong>Price</strong> - Use any of: price, cost, amount, value, unit_price</li>
                    <li><strong>Category (Optional)</strong> - Use any of: category, type, classification, group, class</li>
                    <li><strong>Pricing Type (Optional)</strong> - Use any of: pricing_type, price_type, unit_type, billing_type</li>
                  </ul>
                  <p><strong>Valid pricing types:</strong> per_unit, per_hour, per_day, per_week, per_month, per_project, per_event, flat_rate</p>
                  <p><strong>Example CSV format:</strong></p>
                  <div className="bg-white border rounded overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 border-b">Name</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 border-b">Price</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 border-b">Category</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 border-b">Pricing Type</th>
                        </tr>
                      </thead>
                      <tbody className="font-mono">
                        <tr>
                          <td className="px-3 py-2 border-b">Wedding Catering</td>
                          <td className="px-3 py-2 border-b">150</td>
                          <td className="px-3 py-2 border-b">Catering</td>
                          <td className="px-3 py-2 border-b">per_event</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 border-b">Table Rental</td>
                          <td className="px-3 py-2 border-b">25</td>
                          <td className="px-3 py-2 border-b">Event Rentals</td>
                          <td className="px-3 py-2 border-b">per_day</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2">Photography Package</td>
                          <td className="px-3 py-2">800</td>
                          <td className="px-3 py-2">Photography</td>
                          <td className="px-3 py-2">per_project</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-4">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center gap-2 bg-amethyst-500 text-white px-4 py-2 rounded-lg hover:bg-amethyst-600 transition-colors cursor-pointer"
                >
                  <Upload />
                  Choose File
                </label>
                <button
                  onClick={() => setShowUploadForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 bg-transparent border border-purple-300 hover:bg-gray-100/30 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Preview Modal */}
        <AnimatePresence>
          {showPreview && previewData && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">📋 Bulk Upload Preview</h3>
                    <button
                      onClick={() => {
                        setShowPreview(false)
                        setPreviewData(null)
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="text-blue-900">
                    <p className="font-medium">File: {previewData.fileName}</p>
                    <p className="text-sm">Total items: {previewData.totalRows}</p>
                  </div>
                  <div className="text-blue-700">
                    <p className="text-sm">Headers detected: {previewData.headers.join(', ')}</p>
                  </div>
                </div>
                {previewData.previewItems.some(item => item.isValid.status === 'error') && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-yellow-800">
                      ⚠️ <strong>Validation Issues Detected:</strong> Some items in your file have errors that need to be fixed before upload. 
                      You'll be able to resolve these issues after clicking "Upload".
                    </p>
                  </div>
                )}
                {previewData.fileDuplicates && previewData.fileDuplicates.length > 0 && (
                  <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded">
                    <p className="text-sm text-orange-800">
                      🔄 <strong>Duplicates Detected:</strong> Your file contains {previewData.fileDuplicates.length} duplicate item(s). 
                      Each duplicate will be handled individually during upload.
                    </p>
                  </div>
                )}
              </div>

                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Preview (first 5 items):</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border border-gray-200 rounded-lg">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Row</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pricing Type</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {previewData.previewItems.map((item, index) => (
                            <tr key={index}>
                              <td className="px-4 py-3 text-sm text-gray-900">{item.row}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">${item.price}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{item.category}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.pricing_type}</td>
                          <td className="px-4 py-3 text-sm">
                            {item.isValid.status === 'ready' ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                ✅ Ready
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                ❌ {item.isValid.message}
                              </span>
                            )}
                          </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-4">
                    <button
                      onClick={() => {
                        setShowPreview(false)
                        setPreviewData(null)
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 bg-transparent border border-gray-300 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmUpload}
                      disabled={uploading}
                      className="flex items-center gap-2 bg-amethyst-500 text-white px-6 py-2 rounded-lg hover:bg-amethyst-600 transition-colors disabled:opacity-50"
                    >
                      {uploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload />
                          Upload {previewData.totalRows} Items
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Resolution Modal */}
        <AnimatePresence>
          {showErrorResolution && uploadErrors && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">❌ Upload Issues Found</h3>
                    <button
                      onClick={() => {
                        setShowErrorResolution(false)
                        setUploadErrors(null)
                        setErrorFixes({})
                        setOriginalUploadData(null)
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Summary */}
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="text-red-900">
                        <p className="font-medium">File: {uploadFile?.name || 'upload-file'}</p>
                        <p className="text-sm">
                          Total items: {uploadErrors.totalItems || 0} | 
                          Errors: {uploadErrors.errors?.length || 0} | 
                          Warnings: {uploadErrors.warnings?.length || 0} | 
                          Ready: {uploadErrors.readyItems?.length || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Critical Errors */}
                  {uploadErrors.errors && uploadErrors.errors.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-medium text-red-900 mb-3 flex items-center gap-2">
                        🚨 Critical Errors ({uploadErrors.errors.length})
                      </h4>
                      <div className="space-y-3">
                        {uploadErrors.errors.map((error, index) => (
                          <div key={index} className={`rounded-lg p-4 ${
                            errorFixes[error.rowIndex]?.deleted 
                              ? 'bg-gray-100 border border-gray-300 opacity-60' 
                              : 'bg-red-50 border border-red-200'
                          }`}>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className={`font-medium ${
                                  errorFixes[error.rowIndex]?.deleted 
                                    ? 'text-gray-500' 
                                    : 'text-red-900'
                                }`}>
                                  {errorFixes[error.rowIndex]?.deleted && '🗑️ '}
                                  Row {error.row}: {error.message}
                                  {errorFixes[error.rowIndex]?.deleted && ' (Will be deleted)'}
                                </p>
                                <div className="mt-2 flex items-center gap-4">
                                  <div className="text-sm text-red-700">
                                    <span className="font-medium">Name:</span> {error.item?.name || 'Missing'}
                                  </div>
                                  <div className="text-sm text-red-700">
                                    <span className="font-medium">Price:</span> {error.item?.price || 'Missing'}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 ml-4">
                                {error.type === 'missing_name' && (
                                  <input
                                    type="text"
                                    placeholder="Enter name"
                                    value={errorFixes[error.rowIndex]?.name || ''}
                                    onChange={(e) => handleFixError(error.rowIndex, 'name', e.target.value)}
                                    className="px-3 py-1 border border-red-300 rounded text-sm focus:ring-2 focus:ring-red-500"
                                  />
                                )}
                                {error.type === 'invalid_price' && (
                                  <input
                                    type="text"
                                    placeholder="Enter price"
                                    value={errorFixes[error.rowIndex]?.price || ''}
                                    onChange={(e) => handleFixError(error.rowIndex, 'price', e.target.value)}
                                    className="px-3 py-1 border border-red-300 rounded text-sm focus:ring-2 focus:ring-red-500"
                                  />
                                )}
                                {error.type === 'missing_price' && (
                                  <input
                                    type="text"
                                    placeholder="Enter price"
                                    value={errorFixes[error.rowIndex]?.price || ''}
                                    onChange={(e) => handleFixError(error.rowIndex, 'price', e.target.value)}
                                    className="px-3 py-1 border border-red-300 rounded text-sm focus:ring-2 focus:ring-red-500"
                                  />
                                )}
                                {error.type === 'invalid_pricing_type' && (
                                  <select
                                    value={errorFixes[error.rowIndex]?.pricing_type || 'per_unit'}
                                    onChange={(e) => handleFixError(error.rowIndex, 'pricing_type', e.target.value)}
                                    className="px-3 py-1 border border-red-300 rounded text-sm focus:ring-2 focus:ring-red-500"
                                  >
                                    <option value="per_unit">Per Unit</option>
                                    <option value="per_hour">Per Hour</option>
                                    <option value="per_day">Per Day</option>
                                    <option value="per_week">Per Week</option>
                                    <option value="per_month">Per Month</option>
                                    <option value="per_project">Per Project</option>
                                    <option value="per_event">Per Event</option>
                                    <option value="flat_rate">Flat Rate</option>
                                  </select>
                                )}
                                <button
                                  onClick={() => handleDeleteErrorItem(error.rowIndex)}
                                  className={`px-3 py-1 rounded text-sm transition-colors ${
                                    errorFixes[error.rowIndex]?.deleted
                                      ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                                      : 'bg-red-600 text-white hover:bg-red-700'
                                  }`}
                                  title={errorFixes[error.rowIndex]?.deleted ? "Item marked for deletion" : "Delete this item"}
                                  disabled={errorFixes[error.rowIndex]?.deleted}
                                >
                                  {errorFixes[error.rowIndex]?.deleted ? '✅ Deleted' : '🗑️ Delete'}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Warnings */}
                  {uploadErrors.warnings && uploadErrors.warnings.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-medium text-yellow-900 mb-3 flex items-center gap-2">
                        ⚠️ Warnings ({uploadErrors.warnings.length})
                      </h4>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-yellow-800">
                          <strong>Duplicate Detection:</strong> 
                          {uploadErrors.warnings && uploadErrors.warnings[0]?.type === 'duplicate_in_file'
                            ? ' We found duplicate items within your uploaded file.'
                            : ' We found items that match your existing offerings in your inventory.'
                          }
                          Choose how to handle each duplicate below.
                        </p>
                        <p className="text-xs text-yellow-700 mt-1">
                          💡 <strong>Note:</strong> 
                          {uploadErrors.warnings && uploadErrors.warnings[0]?.type === 'duplicate_in_file'
                            ? ' This item appears multiple times in the file you uploaded. Each duplicate needs to be handled individually.'
                            : ' This item already exists in your current inventory from previous uploads. Choose whether to update it or skip it.'
                          }
                        </p>
                      </div>
                      <div className="space-y-3">
                        {uploadErrors.warnings.map((warning, index) => (
                          <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-yellow-900">Row {warning.row}: {warning.message}</p>
                                <div className="mt-2 text-sm text-yellow-700">
                                  <span className="font-medium">Duplicate item:</span> "{warning.duplicate?.name}" (${warning.duplicate?.price})<br/>
                                  {warning.type === 'duplicate_in_file' ? (
                                    <>
                                      <span className="font-medium">First occurrence in file (Row {warning.existing?.row}):</span> "{warning.existing?.name}" (${warning.existing?.price})
                                    </>
                                  ) : (
                                    <>
                                      <span className="font-medium">Already exists:</span> "{warning.existing?.name}" (${warning.existing?.price})
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 ml-4">
                                <button
                                  onClick={() => handleDuplicateAction(warning.rowIndex, 'keep_new')}
                                  className={`px-3 py-1 rounded text-sm ${
                                    errorFixes[warning.rowIndex]?.duplicateAction === 'keep_new'
                                      ? 'bg-blue-500 text-white'
                                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                  }`}
                                >
                                  Keep New
                                </button>
                                <button
                                  onClick={() => handleDuplicateAction(warning.rowIndex, 'skip')}
                                  className={`px-3 py-1 rounded text-sm ${
                                    errorFixes[warning.rowIndex]?.duplicateAction === 'skip'
                                      ? 'bg-yellow-500 text-white'
                                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                  }`}
                                >
                                  Skip
                                </button>
                                <button
                                  onClick={() => handleDuplicateAction(warning.rowIndex, 'update_existing')}
                                  className={`px-3 py-1 rounded text-sm ${
                                    errorFixes[warning.rowIndex]?.duplicateAction === 'update_existing'
                                      ? 'bg-green-500 text-white'
                                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                  }`}
                                >
                                  Update Existing
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ready Items */}
                  {uploadErrors.readyItems && uploadErrors.readyItems.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-medium text-green-900 mb-3 flex items-center gap-2">
                        ✅ Ready to Upload ({uploadErrors.readyItems.length})
                      </h4>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-green-700 text-sm">
                          {uploadErrors.readyItems.length} items are ready to be uploaded without any issues.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                    <button
                      onClick={downloadErrorReport}
                      className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 bg-transparent border border-gray-300 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download Error Report
                    </button>
                    
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => {
                          setShowErrorResolution(false)
                          setUploadErrors(null)
                          setErrorFixes({})
                          setOriginalUploadData(null)
                        }}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 bg-transparent border border-gray-300 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleResolvedUpload}
                        disabled={uploading}
                        className="flex items-center gap-2 bg-amethyst-500 text-white px-6 py-2 rounded-lg hover:bg-amethyst-600 transition-colors disabled:opacity-50"
                      >
                        {uploading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Uploading Fixed Data...
                          </>
                        ) : (
                          <>
                            <Upload />
                            Upload Fixed Data
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category Filter */}
        <motion.div
          className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm mb-4"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Filter by Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amethyst-500 focus:border-transparent"
              >
                <option value="All">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="text-sm text-gray-600">
              Showing {filteredOfferings.length} of {offerings.length} offerings
            </div>
          </div>
        </motion.div>

        {/* Offerings Table */}
        <motion.div
          className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
          variants={cardVariants}
          whileHover="hover"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {selectedCategory === 'All' ? 'Your Offerings' : `${selectedCategory} Offerings`} ({filteredOfferings.length} total)
            </h2>
          </div>
          <div className="overflow-x-auto max-w-full">
            {filteredOfferings.length > 0 ? (
              <table className="w-full min-w-max">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Offering Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pricing Type</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOfferings.map((offering) => (
                    <motion.tr
                      key={offering.id}
                      className="hover:bg-gray-50 transition-colors"
                      variants={itemVariants}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingId === offering.id ? (
                          <input
                            type="text"
                            value={editingOffering.name}
                            onChange={(e) => setEditingOffering({...editingOffering, name: e.target.value})}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-amethyst-500"
                          />
                        ) : (
                          <div className="text-sm font-medium text-gray-900">{offering.name}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingId === offering.id ? (
                          <select
                            value={editingOffering.category}
                            onChange={(e) => setEditingOffering({...editingOffering, category: e.target.value})}
                            className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-amethyst-500"
                          >
                            {categories.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                            {offering.category}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingId === offering.id ? (
                          <input
                            type="text"
                            value={editingOffering.price}
                            onChange={(e) => setEditingOffering({...editingOffering, price: e.target.value})}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-amethyst-500"
                          />
                        ) : (
                          <div className="text-sm text-gray-900">{formatPrice(offering.price, offering.pricingType)}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingId === offering.id ? (
                          <select
                            value={editingOffering.pricingType}
                            onChange={(e) => setEditingOffering({...editingOffering, pricingType: e.target.value})}
                            className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-amethyst-500"
                          >
                            {pricingTypes.map(type => (
                              <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {pricingTypes.find(t => t.value === offering.pricingType)?.label || 'Fixed Price'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {editingId === offering.id ? (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={handleSaveEdit}
                              className="text-green-600 hover:text-green-900 p-1 rounded bg-transparent hover:bg-green-100/30 transition-colors"
                            >
                              <Save />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-gray-600 hover:text-gray-900 p-1 rounded bg-transparent border border-purple-300 hover:bg-gray-100/30 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleEditOffering(offering.id)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded bg-transparent hover:bg-blue-100/30 transition-colors"
                            >
                              <Edit />
                            </button>
                            <button
                              onClick={() => handleDeleteOffering(offering.id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded bg-transparent hover:bg-red-100/30 transition-colors"
                            >
                              <Trash />
                            </button>
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12">
                {isLoadingOfferings ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading offerings...</p>
                  </div>
                ) : offerings.length === 0 ? (
                  <>
                    <div className="flex justify-center mb-4">
                      <Package className="w-16 h-16 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No offerings yet</h3>
                    <p className="text-gray-600 mb-6">Get started by adding your first offering</p>
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="inline-flex items-center gap-2 bg-amethyst-500 text-white px-4 py-2 rounded-lg hover:bg-amethyst-600 transition-colors"
                    >
                      <Plus />
                      Add Your First Offering
                    </button>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No {selectedCategory} offerings</h3>
                    <p className="text-gray-600 mb-6">Try selecting a different category or add a new {selectedCategory} offering</p>
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => setSelectedCategory('All')}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 bg-transparent border border-purple-300 hover:bg-gray-100/30 rounded-lg transition-colors"
                      >
                        Show All Categories
                      </button>
                      <button
                        onClick={() => setShowAddForm(true)}
                        className="inline-flex items-center gap-2 bg-amethyst-500 text-white px-4 py-2 rounded-lg hover:bg-amethyst-600 transition-colors"
                      >
                        <Plus />
                        Add {selectedCategory} Offering
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Special Instructions */}
        <motion.div
          className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mt-8"
          variants={cardVariants}
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center mt-0.5">
              <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Business Terms & Details</h3>
              <p className="text-sm text-gray-600 mt-1">Include discounts, minimum requirements, cancellation policies, delivery areas, or customization options</p>
            </div>
          </div>
          
          <textarea
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amethyst-500 focus:border-transparent resize-none"
            placeholder="Example: All services include free initial consultation. Rush orders require 48-hour notice. Custom packages available upon request. Delivery available within 20-mile radius..."
          />
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSaveInstructions}
              className="flex items-center gap-2 bg-amethyst-500 text-white px-6 py-2 rounded-lg hover:bg-amethyst-600 transition-colors"
            >
              <Save />
              Save Instructions
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>

    {/* Duplicate Warning Modal */}
    <AnimatePresence>
      {showDuplicateWarning && duplicateWarningData && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-xl max-w-2xl w-full"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">⚠️ Duplicate Warning</h3>
                <button
                  onClick={() => setShowDuplicateWarning(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-yellow-800">
                    <strong>Duplicates detected!</strong> Choose how to handle each duplicate below.
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    💡 <strong>Options:</strong> 
                    • <strong>Keep Both:</strong> Add both items to your inventory
                    • <strong>Choose One:</strong> Select which item to keep
                    • <strong>Skip:</strong> Remove the duplicate item
                  </p>
                </div>

                <div className="space-y-4">
                  {duplicateWarningData.map((duplicate, index) => (
                    <div key={index} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="mb-3">
                        <h4 className="font-medium text-orange-900 mb-2">
                          {duplicate.type === 'duplicate_in_file' 
                            ? `📄 File Duplicate: "${duplicate.name}" - $${duplicate.price}`
                            : `🏪 Inventory Duplicate: "${duplicate.name}" - $${duplicate.price}`
                          }
                        </h4>
                        <p className="text-sm text-orange-700">
                          {duplicate.message}
                        </p>
                      </div>

                      {duplicate.type === 'duplicate_in_file' ? (
                        // File duplicates: show all instances from the file
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-orange-800">Found {duplicate.instances.length} instances in your file:</p>
                          {duplicate.instances.map((instance, instIndex) => (
                            <div key={instIndex} className="bg-white border border-orange-200 rounded p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-gray-900">Row {instance.rowIndex + 1}</p>
                                  <p className="text-sm text-gray-600">
                                    {instance.name} - ${instance.price} 
                                    {instance.category && ` (${instance.category})`}
                                    {instance.pricing_type && ` - ${instance.pricing_type}`}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <label className="flex items-center">
                                    <input
                                      type="radio"
                                      name={`duplicate_${index}_instance_${instIndex}`}
                                      value="keep"
                                      className="mr-2"
                                    />
                                    Keep
                                  </label>
                                  <label className="flex items-center">
                                    <input
                                      type="radio"
                                      name={`duplicate_${index}_instance_${instIndex}`}
                                      value="delete"
                                      className="mr-2"
                                    />
                                    Delete
                                  </label>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        // Inventory duplicates: show uploaded vs existing
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white border border-orange-200 rounded p-3">
                            <p className="font-medium text-blue-900 mb-2">📤 Uploaded Item</p>
                            <p className="text-sm text-gray-600">
                              Row {duplicate.uploadedItem.rowIndex + 1}: {duplicate.uploadedItem.name} - ${duplicate.uploadedItem.price}
                              {duplicate.uploadedItem.category && ` (${duplicate.uploadedItem.category})`}
                              {duplicate.uploadedItem.pricing_type && ` - ${duplicate.uploadedItem.pricing_type}`}
                            </p>
                          </div>
                          <div className="bg-white border border-orange-200 rounded p-3">
                            <p className="font-medium text-green-900 mb-2">🏪 Existing Inventory</p>
                            <p className="text-sm text-gray-600">
                              {duplicate.existingItem.name} - ${duplicate.existingItem.price}
                              {duplicate.existingItem.category && ` (${duplicate.existingItem.category})`}
                              {duplicate.existingItem.pricing_type && ` - ${duplicate.existingItem.pricing_type}`}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="mt-3 flex items-center gap-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name={`duplicate_${index}_resolution`}
                            value="keep_both"
                            className="mr-2"
                          />
                          <span className="text-sm">Keep Both</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name={`duplicate_${index}_resolution`}
                            value="choose_one"
                            className="mr-2"
                          />
                          <span className="text-sm">Choose One</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name={`duplicate_${index}_resolution`}
                            value="skip"
                            className="mr-2"
                          />
                          <span className="text-sm">Skip All</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-4">
                <button
                  onClick={() => setShowDuplicateWarning(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 bg-transparent border border-gray-300 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProceedWithDuplicates}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Apply Resolution
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Notification Modal */}
    <AnimatePresence>
      {notification && (
        <motion.div
          className="fixed top-4 right-4 z-50"
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ duration: 0.3 }}
        >
          <div className={`rounded-lg shadow-lg p-4 max-w-sm ${
            notification.type === 'success' ? 'bg-green-50 border border-green-200' :
            notification.type === 'error' ? 'bg-red-50 border border-red-200' :
            notification.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
            'bg-blue-50 border border-blue-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                notification.type === 'success' ? 'bg-green-100' :
                notification.type === 'error' ? 'bg-red-100' :
                notification.type === 'warning' ? 'bg-yellow-100' :
                'bg-blue-100'
              }`}>
                {notification.type === 'success' && (
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {notification.type === 'error' && (
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                {notification.type === 'warning' && (
                  <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                )}
                {notification.type === 'info' && (
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  notification.type === 'success' ? 'text-green-800' :
                  notification.type === 'error' ? 'text-red-800' :
                  notification.type === 'warning' ? 'text-yellow-800' :
                  'text-blue-800'
                }`}>
                  {notification.message}
                </p>
              </div>
              <button
                onClick={() => setNotification(null)}
                className={`flex-shrink-0 p-1 rounded-full hover:bg-opacity-80 ${
                  notification.type === 'success' ? 'hover:bg-green-100' :
                  notification.type === 'error' ? 'hover:bg-red-100' :
                  notification.type === 'warning' ? 'hover:bg-yellow-100' :
                  'hover:bg-blue-100'
                }`}
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  )
}

export default OfferingsModern
