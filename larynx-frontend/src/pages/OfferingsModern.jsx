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

const Package = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
)

const OfferingsModern = () => {
  const navigate = useNavigate()
  const api = import.meta.env.VITE_API_URL
  const [offerings, setOfferings] = useState([])
  const [hasError, setHasError] = useState(false)
  
  const [newOffering, setNewOffering] = useState({ name: '', price: '', pricingType: '', category: '' })
  const [customCategoryInput, setCustomCategoryInput] = useState('')
  const [showCustomCategoryInput, setShowCustomCategoryInput] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editingOffering, setEditingOffering] = useState({ name: '', price: '', pricingType: '', category: '' })
  const [showAddForm, setShowAddForm] = useState(false)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [uploadFile, setUploadFile] = useState(null)
  const [specialInstructions, setSpecialInstructions] = useState('All services include free initial consultation. Custom packages available upon request. Rush orders require 48-hour notice with additional fees. Delivery available within 20-mile radius. 30-day satisfaction guarantee on all services.')

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
      setOfferings(data.inventory || [])
    } catch (error) {
      handleError(error, 'fetchInventory')
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
      await fetchWithErrorHandling(`${api}/inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newOffering.name,
          price: parseFloat(normalizedPrice)
        })
      })
      
      // Refresh the inventory after successful addition
      await fetchInventory()
      
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
      await fetchWithErrorHandling(`${api}/inventory/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingOffering.name,
          price: parseFloat(normalizedPrice)
        })
      })
      
      // Refresh the inventory after successful update
      await fetchInventory()
      
      setEditingId(null)
      setEditingOffering({ name: '', price: '', category: '' })
    } catch (error) {
      handleError(error, 'handleSaveEdit')
    }
  }

  const handleDeleteOffering = async (id) => {
    try {
      await fetchWithErrorHandling(`${api}/inventory/${id}`, {
        method: 'DELETE'
      })
      
      // Refresh the inventory after successful deletion
      await fetchInventory()
    } catch (error) {
      handleError(error, 'handleDeleteOffering')
    }
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      setUploadFile(file)
      // Simulate processing
      setTimeout(() => {
        setShowUploadForm(false)
        setUploadFile(null)
      }, 2000)
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
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Upload a CSV file with your offerings</p>
              <div className="flex items-center justify-center gap-4">
                <input
                  type="file"
                  accept=".csv"
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
                {offerings.length === 0 ? (
                  <>
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
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
  )
}

export default OfferingsModern
