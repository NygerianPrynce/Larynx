// File: pages/InventoryPage.jsx
import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'

// Custom SVG Icons
const Plus = () => (
  <svg style={{ display: 'inline', width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

const Edit = () => (
  <svg style={{ display: 'inline', width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
)

const Trash = () => (
  <svg style={{ display: 'inline', width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

const Upload = () => (
  <svg style={{ display: 'inline', width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
)

const Save = () => (
  <svg style={{ display: 'inline', width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const X = () => (
  <svg style={{ display: 'inline', width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const InventoryPage = ({ onNext, embedded = false }) => {
  const [inventory, setInventory] = useState([])
  const [newItem, setNewItem] = useState({ name: '', price: '' })
  const [editingItemId, setEditingItemId] = useState(null)
  const [editedItem, setEditedItem] = useState({ name: '', price: '' })
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [instructionsSaved, setInstructionsSaved] = useState(false)
  const [particles, setParticles] = useState([])
  const api = import.meta.env.VITE_API_URL

  useEffect(() => {
    // Generate floating particles
    const generateParticles = () => {
      const newParticles = []
      for (let i = 0; i < 50; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.2 + 0.05,
          duration: Math.random() * 20 + 15,
          delay: Math.random() * 10
        })
      }
      setParticles(newParticles)
    }
    generateParticles()
  }, [])

  const fetchInventory = async () => {
    try {
      console.log('Fetching inventory from:', `${api}/inventory`) // Debug log
      const res = await fetch(`${api}/inventory`, { credentials: 'include' })
      console.log('Fetch inventory response status:', res.status) // Debug log
      
      if (res.ok) {
        const data = await res.json()
        console.log('Inventory data received:', data) // Debug log
        setInventory(data.inventory || [])
      } else {
        console.error('Failed to fetch inventory:', res.status)
        const errorText = await res.text()
        console.error('Error response:', errorText)
      }
    } catch (error) {
      console.error('Network error fetching inventory:', error)
    }
  }

  const fetchInstructions = async () => {
    try {
      const res = await fetch(`${api}/inventory/special-instructions`, {
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        setSpecialInstructions(data.special_instructions || '')
      }
    } catch (error) {
      console.error('Error fetching instructions:', error)
    }
  }

  useEffect(() => {
    fetchInventory()
    fetchInstructions()
  }, [])

  const handleAdd = async () => {
    if (!newItem.name?.trim() || !newItem.price || isNaN(parseFloat(newItem.price))) {
      alert('Please enter a valid product name and price')
      return
    }
    
    console.log('API URL:', api) // Debug log
    console.log('Adding item:', { name: newItem.name.trim(), price: parseFloat(newItem.price) }) // Debug log
    
    try {
      const requestUrl = `${api}/inventory/add`
      console.log('Request URL:', requestUrl) // Debug log
      
      const requestBody = {
        name: newItem.name.trim(),
        price: parseFloat(newItem.price)
      }
      
      console.log('Request body:', requestBody) // Debug log
      
      const res = await fetch(requestUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      })
      
      console.log('Response status:', res.status) // Debug log
      console.log('Response headers:', Object.fromEntries(res.headers.entries())) // Debug log
      
      const responseText = await res.text()
      console.log('Raw response:', responseText) // Debug log
      
      let responseData
      try {
        responseData = JSON.parse(responseText)
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError)
        responseData = { message: responseText }
      }
      
      if (res.ok) {
        console.log('Item added successfully:', responseData)
        setNewItem({ name: '', price: '' })
        
        // Force refresh inventory after successful add
        console.log('Refreshing inventory...')
        await fetchInventory()
        
        // Show success message
        //alert(`Success: ${responseData.message || 'Item added successfully'}`)
      } else {
        console.error('Failed to add item. Status:', res.status)
        console.error('Error response:', responseData)
        
        // Handle different error types
        if (res.status === 401) {
          alert('You are not authenticated. Please log in again.')
          // Optionally redirect to login
        } else if (res.status === 422) {
          // Validation error from Pydantic
          const errorDetails = responseData.detail || responseData.message || 'Validation error'
          alert(`Validation error: ${JSON.stringify(errorDetails)}`)
        } else {
          alert(`Failed to add item: ${responseData.message || responseData.detail || 'Unknown error'}`)
        }
      }
    } catch (error) {
      console.error('Network error adding item:', error)
      alert(`Network error: ${error.message}. Please check your internet connection and try again.`)
    }
  }

  const handleEdit = async (id) => {
    if (!editedItem.name?.trim() || !editedItem.price || isNaN(parseFloat(editedItem.price))) {
      alert('Please enter a valid product name and price')
      return
    }
    
    console.log('Editing item:', id, editedItem) // Debug log
    
    try {
      const requestUrl = `${api}/inventory/edit/${id}`
      const requestBody = {
        name: editedItem.name.trim(),
        price: parseFloat(editedItem.price)
      }
      
      console.log('Edit request URL:', requestUrl)
      console.log('Edit request body:', requestBody)
      
      const res = await fetch(requestUrl, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      })
      
      console.log('Edit response status:', res.status)
      
      const responseText = await res.text()
      console.log('Edit raw response:', responseText)
      
      let responseData
      try {
        responseData = JSON.parse(responseText)
      } catch (parseError) {
        console.error('Failed to parse edit response as JSON:', parseError)
        responseData = { message: responseText }
      }
      
      if (res.ok) {
        console.log('Item edited successfully:', responseData)
        setEditingItemId(null)
        setEditedItem({ name: '', price: '' })
        await fetchInventory()
        //alert(`Success: ${responseData.message || 'Item updated successfully'}`)
      } else {
        console.error('Failed to edit item. Status:', res.status)
        console.error('Edit error response:', responseData)
        
        if (res.status === 401) {
          alert('You are not authenticated. Please log in again.')
        } else if (res.status === 422) {
          const errorDetails = responseData.detail || responseData.message || 'Validation error'
          alert(`Validation error: ${JSON.stringify(errorDetails)}`)
        } else {
          alert(`Failed to edit item: ${responseData.message || responseData.detail || 'Unknown error'}`)
        }
      }
    } catch (error) {
      console.error('Network error editing item:', error)
      alert(`Network error: ${error.message}. Please try again.`)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return
    }
    
    console.log('Deleting item:', id) // Debug log
    
    try {
      const requestUrl = `${api}/inventory/delete/${id}`
      console.log('Delete request URL:', requestUrl)
      
      const res = await fetch(requestUrl, {
        method: 'DELETE',
        headers: { 
          'Accept': 'application/json'
        },
        credentials: 'include'
      })
      
      console.log('Delete response status:', res.status)
      
      const responseText = await res.text()
      console.log('Delete raw response:', responseText)
      
      let responseData
      try {
        responseData = JSON.parse(responseText)
      } catch (parseError) {
        console.error('Failed to parse delete response as JSON:', parseError)
        responseData = { message: responseText }
      }
      
      if (res.ok) {
        console.log('Item deleted successfully:', responseData)
        await fetchInventory()
        //alert(`Success: ${responseData.message || 'Item deleted successfully'}`)
      } else {
        console.error('Failed to delete item. Status:', res.status)
        console.error('Delete error response:', responseData)
        
        if (res.status === 401) {
          alert('You are not authenticated. Please log in again.')
        } else if (res.status === 500) {
          alert('Server error: Failed to delete item. Please try again.')
        } else {
          alert(`Failed to delete item: ${responseData.message || responseData.detail || 'Unknown error'}`)
        }
      }
    } catch (error) {
      console.error('Network error deleting item:', error)
      alert(`Network error: ${error.message}. Please try again.`)
    }
  }

  const startEdit = (item) => {
    setEditingItemId(item.id)
    setEditedItem({ 
      name: item.name || '', 
      price: item.price?.toString() || '0' 
    })
  }

  const cancelEdit = () => {
    setEditingItemId(null)
    setEditedItem({ name: '', price: '' })
  }

  const handleCSVUpload = async () => {
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    setLoading(true)
    
    try {
      const res = await fetch(`${api}/inventory/bulk-upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      })
      
      if (res.ok) {
        setFile(null)
        await fetchInventory()
      } else {
        const errorData = await res.json()
        alert(`Failed to upload file: ${errorData.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Failed to upload file. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveInstructions = async () => {
    try {
      const res = await fetch(`${api}/inventory/special-instructions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ special_instructions: specialInstructions })
      })
      if (res.ok) {
        setInstructionsSaved(true)
        // Clear the saved message after 3 seconds
        setTimeout(() => setInstructionsSaved(false), 3000)
      }
    } catch (error) {
      console.error('Failed to save instructions:', error)
    }
  }

  return (
    <div style={embedded ? styles.embeddedContainer : styles.container}>
      <style>
        {`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          @keyframes float {
            0% { transform: translateY(100vh) translateX(0px) rotate(0deg); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(-100vh) translateX(30px) rotate(360deg); opacity: 0; }
          }
          
          @keyframes floatHorizontal {
            0% { transform: translateX(-3px); }
            50% { transform: translateX(3px); }
            100% { transform: translateX(-3px); }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 0.1; transform: scale(1); }
            50% { opacity: 0.3; transform: scale(1.05); }
          }
          
          .table-row:hover {
            background: rgba(55, 65, 81, 0.3) !important;
          }
          
          .action-button:hover {
            transform: scale(1.05) !important;
          }
          
          .primary-button:hover {
            transform: scale(1.02) !important;
            box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4) !important;
          }
          
          .upload-button:hover {
            background: rgba(59, 130, 246, 0.9) !important;
          }
          
          .file-input-label:hover {
            background: rgba(139, 92, 246, 0.3) !important;
            border-color: #8b5cf6 !important;
            transform: scale(1.02) !important;
          }
          
          .done-button:hover {
            background: rgba(16, 185, 129, 0.9) !important;
            transform: scale(1.05) !important;
          }
        `}
      </style>

      {/* Animated Background */}
      <div style={styles.backgroundOrb1}></div>
      <div style={styles.backgroundOrb2}></div>
      
      {/* Floating Particles */}
      <div style={styles.particleContainer}>
        {particles.map((particle) => (
          <div
            key={particle.id}
            style={{
              position: 'absolute',
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, rgba(59, 130, 246, 0.1) 50%, transparent 100%)',
              borderRadius: '50%',
              pointerEvents: 'none',
              opacity: particle.opacity,
              animation: `float ${particle.duration}s linear infinite ${particle.delay}s, floatHorizontal 4s ease-in-out infinite ${particle.delay * 0.2}s`
            }}
          />
        ))}
      </div>

      {!embedded && <Navbar />}
      
      <div style={styles.main}>
        {/* Header - only show if not embedded */}
        {!embedded && (
          <div style={styles.header}>
            <h1 style={styles.title}>Inventory Management</h1>
            <p style={styles.subtitle}>
              Manage your product catalog and pricing - include delivery fees and special charges
            </p>
          </div>
        )}

        {/* Add New Item Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Add New Item</h2>
          <div style={styles.addItemForm}>
            <input
              style={styles.input}
              placeholder="Product name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
            />
            <input
              style={styles.input}
              type="number"
              step="0.01"
              placeholder="Price ($)"
              value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
            />
            <button 
              style={styles.addButton} 
              className="primary-button"
              onClick={handleAdd}
              disabled={!newItem.name?.trim() || !newItem.price}
            >
              <Plus />
              <span>Add Item</span>
            </button>
          </div>
        </div>

        {/* Bulk Upload Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Bulk Upload</h2>
          <div style={styles.uploadForm}>
            <div style={styles.fileInputWrapper}>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                id="file-upload"
                style={styles.hiddenFileInput}
                onChange={(e) => setFile(e.target.files[0])}
              />
              <label htmlFor="file-upload" style={styles.fileInputLabel} className="file-input-label">
                <Upload />
                <span>{file ? file.name : 'Choose CSV or Excel file'}</span>
              </label>
            </div>
            <button 
              style={styles.uploadButton} 
              className="upload-button"
              onClick={handleCSVUpload}
              disabled={!file || loading}
            >
              <span>{loading ? 'Uploading...' : 'Upload to Inventory'}</span>
            </button>
          </div>
          <div style={styles.uploadHint}>
            <div style={styles.hintIcon}>💡</div>
            <div style={styles.hintContent}>
              <div style={styles.hintTitle}>File Requirements:</div>
              <div style={styles.hintText}>
                Your file must include columns for <strong>name</strong> (name, product_name, item_name, product, item, title) 
                and <strong>price</strong> (price, cost, amount, value, unit_price)
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Current Inventory ({inventory.length} items)</h2>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.th}>Product Name</th>
                  <th style={styles.th}>Price</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.id} style={styles.tableRow} className="table-row">
                    <td style={styles.td}>
                      {editingItemId === item.id ? (
                        <input
                          style={styles.editInput}
                          value={editedItem.name}
                          onChange={(e) => setEditedItem({ ...editedItem, name: e.target.value })}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') handleEdit(item.id)
                            if (e.key === 'Escape') cancelEdit()
                          }}
                          autoFocus
                        />
                      ) : (
                        <span style={styles.itemName}>{item.name}</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      {editingItemId === item.id ? (
                        <input
                          style={styles.editInput}
                          type="number"
                          step="0.01"
                          value={editedItem.price}
                          onChange={(e) => setEditedItem({ ...editedItem, price: e.target.value })}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') handleEdit(item.id)
                            if (e.key === 'Escape') cancelEdit()
                          }}
                        />
                      ) : (
                        <span style={styles.price}>${parseFloat(item.price || 0).toFixed(2)}</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actions}>
                        {editingItemId === item.id ? (
                          <>
                            <button 
                              style={styles.saveButton} 
                              className="action-button"
                              onClick={() => handleEdit(item.id)}
                              title="Save changes"
                            >
                              <Save />
                            </button>
                            <button 
                              style={styles.cancelButton} 
                              className="action-button"
                              onClick={cancelEdit}
                              title="Cancel editing"
                            >
                              <X />
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              style={styles.editButton} 
                              className="action-button"
                              onClick={() => startEdit(item)}
                              title="Edit item"
                            >
                              <Edit />
                            </button>
                            <button 
                              style={styles.deleteButton} 
                              className="action-button"
                              onClick={() => handleDelete(item.id)}
                              title="Delete item"
                            >
                              <Trash />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {inventory.length === 0 && (
              <div style={styles.emptyState}>
                <p>No items in inventory yet. Add your first item above!</p>
              </div>
            )}
          </div>
        </div>

        {/* Special Instructions */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Special Instructions</h2>
          <textarea
            style={styles.textarea}
            placeholder="e.g. $10 minimum order, delivery fee waived over $50, bulk discounts available..."
            value={specialInstructions}
            onChange={(e) => {
              setSpecialInstructions(e.target.value)
              setInstructionsSaved(false)
            }}
          />
          <div style={styles.instructionsActions}>
            <button
              style={styles.saveInstructionsButton}
              onClick={handleSaveInstructions}
            >
              <Save />
              <span>Save Instructions</span>
            </button>
            {instructionsSaved && (
              <div style={styles.savedMessage}>
                <Save />
                <span>Special instructions saved!</span>
              </div>
            )}
          </div>
        </div>

        {/* Done Button - only show in embedded mode */}
        {embedded && (
          <div style={styles.footer}>
            <button
              style={styles.embeddedDoneButton}
              className="done-button"
              onClick={async () => {
                await handleSaveInstructions()
                if (onNext) onNext()
              }}
            >
              Continue to Next Step
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  embeddedContainer: {
    margin: 0,
    padding: 0,
    background: 'transparent',
    color: 'white',
    fontFamily: 'Arial, sans-serif',
    position: 'relative'
  },
  container: {
    margin: 0,
    padding: 0,
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a1a 0%, #000000 50%, #2d2d2d 100%)',
    color: 'white',
    fontFamily: 'Arial, sans-serif',
    position: 'relative',
    overflow: 'hidden'
  },
  backgroundOrb1: {
    position: 'absolute',
    top: '20%',
    left: '15%',
    width: '250px',
    height: '250px',
    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(60px)',
    animation: 'pulse 8s ease-in-out infinite'
  },
  backgroundOrb2: {
    position: 'absolute',
    bottom: '20%',
    right: '15%',
    width: '200px',
    height: '200px',
    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(60px)',
    animation: 'pulse 8s ease-in-out infinite 4s'
  },
  particleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    overflow: 'hidden'
  },
  main: {
    position: 'relative',
    zIndex: 10,
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '32px'
  },
  header: {
    textAlign: 'center',
    marginBottom: '48px',
    padding: '48px 0'
  },
  title: {
    fontSize: '48px',
    fontWeight: 'bold',
    marginBottom: '16px',
    background: 'linear-gradient(45deg, #ffffff, #a855f7, #8b5cf6)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  subtitle: {
    fontSize: '18px',
    color: '#d1d5db',
    maxWidth: '600px',
    margin: '0 auto'
  },
  section: {
    marginBottom: '48px'
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '24px',
    color: 'white'
  },
  addItemForm: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    flexWrap: 'wrap',
    padding: '32px',
    background: 'linear-gradient(145deg, rgba(55, 65, 81, 0.5), rgba(17, 24, 39, 0.5))',
    backdropFilter: 'blur(20px)',
    borderRadius: '16px',
    border: '1px solid #374151'
  },
  input: {
    flex: 1,
    minWidth: '200px',
    padding: '12px 16px',
    background: 'rgba(17, 24, 39, 0.8)',
    border: '1px solid #374151',
    borderRadius: '8px',
    color: 'white',
    fontSize: '14px'
  },
  addButton: {
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
    opacity: 1
  },
  uploadForm: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    flexWrap: 'wrap',
    padding: '32px',
    background: 'linear-gradient(145deg, rgba(55, 65, 81, 0.5), rgba(17, 24, 39, 0.5))',
    backdropFilter: 'blur(20px)',
    borderRadius: '16px',
    border: '1px solid #374151'
  },
  fileInputWrapper: {
    flex: 1,
    minWidth: '250px'
  },
  hiddenFileInput: {
    display: 'none'
  },
  fileInputLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px',
    background: 'linear-gradient(145deg, rgba(55, 65, 81, 0.8), rgba(17, 24, 39, 0.8))',
    border: '2px dashed #374151',
    borderRadius: '12px',
    color: '#d1d5db',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'center',
    justifyContent: 'center'
  },
  uploadButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#3b82f6',
    color: 'white',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease'
  },
  tableContainer: {
    background: 'linear-gradient(145deg, rgba(55, 65, 81, 0.5), rgba(17, 24, 39, 0.5))',
    backdropFilter: 'blur(20px)',
    borderRadius: '16px',
    border: '1px solid #374151',
    overflow: 'hidden'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  tableHeader: {
    background: 'rgba(139, 92, 246, 0.2)'
  },
  th: {
    padding: '16px',
    textAlign: 'left',
    fontWeight: '600',
    fontSize: '14px',
    color: '#e5e7eb',
    borderBottom: '1px solid #374151'
  },
  tableRow: {
    borderBottom: '1px solid #374151',
    transition: 'all 0.2s ease'
  },
  td: {
    padding: '16px',
    fontSize: '14px'
  },
  itemName: {
    color: 'white',
    fontWeight: '500'
  },
  price: {
    color: '#8b5cf6',
    fontWeight: '600'
  },
  editInput: {
    width: '100%',
    padding: '8px 12px',
    background: 'rgba(17, 24, 39, 0.8)',
    border: '1px solid #374151',
    borderRadius: '6px',
    color: 'white',
    fontSize: '14px'
  },
  actions: {
    display: 'flex',
    gap: '8px'
  },
  editButton: {
    padding: '8px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  deleteButton: {
    padding: '8px',
    background: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  saveButton: {
    padding: '8px',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  cancelButton: {
    padding: '8px',
    background: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  uploadHint: {
    marginTop: '16px',
    padding: '16px',
    background: 'rgba(59, 130, 246, 0.1)',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    borderRadius: '12px',
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start'
  },
  hintIcon: {
    fontSize: '20px',
    marginTop: '2px'
  },
  hintContent: {
    flex: 1
  },
  hintTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#3b82f6',
    marginBottom: '4px'
  },
  hintText: {
    fontSize: '13px',
    color: '#d1d5db',
    lineHeight: '1.4'
  },
  emptyState: {
    textAlign: 'center',
    padding: '64px 32px',
    color: '#9ca3af',
    fontSize: '16px'
  },
  textarea: {
    width: '100%',
    minHeight: '120px',
    padding: '16px',
    background: 'linear-gradient(145deg, rgba(55, 65, 81, 0.5), rgba(17, 24, 39, 0.5))',
    backdropFilter: 'blur(20px)',
    border: '1px solid #374151',
    borderRadius: '12px',
    color: 'white',
    fontSize: '14px',
    resize: 'vertical'
  },
  instructionsActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginTop: '16px'
  },
  saveInstructionsButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'linear-gradient(45deg, #8b5cf6, #3b82f6)',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease'
  },
  savedMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#10b981',
    fontSize: '14px',
    fontWeight: '500'
  },
  footer: {
    textAlign: 'center',
    marginTop: '64px',
    paddingTop: '32px'
  },
  doneButton: {
    background: 'linear-gradient(45deg, #10b981, #059669)',
    color: 'white',
    padding: '16px 48px',
    border: 'none',
    borderRadius: '12px',
    fontSize: '18px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)'
  },
  embeddedDoneButton: {
    background: 'linear-gradient(45deg, #8b5cf6, #3b82f6)',
    color: 'white',
    padding: '16px 32px',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 8px 20px rgba(139, 92, 246, 0.3)'
  }
}

export default InventoryPage