// File: pages/InventoryPage.jsx
import React, { useEffect, useState } from 'react'

const InventoryPage = ({ onNext }) => {
  const [inventory, setInventory] = useState([])
  const [newItem, setNewItem] = useState({ name: '', price: '' })
  const [editingItemId, setEditingItemId] = useState(null)
  const [editedItem, setEditedItem] = useState({ name: '', price: '' })
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [instructionsSaved, setInstructionsSaved] = useState(false)
  const api = import.meta.env.VITE_API_URL

  const fetchInventory = async () => {
    const res = await fetch(`${api}/inventory`, { credentials: 'include' })
    const data = await res.json()
    setInventory(data.inventory || [])
  }

  const fetchInstructions = async () => {
    const res = await fetch(`${api}/inventory/special-instructions`, {
      credentials: 'include'
    })
    const data = await res.json()
    setSpecialInstructions(data.special_instructions || '')
  }

  useEffect(() => {
    fetchInventory()
    fetchInstructions()
  }, [])

  const handleAdd = async () => {
    const res = await fetch(`${api}/inventory/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        name: newItem.name,
        price: parseFloat(newItem.price)
      })
    })
    setNewItem({ name: '', price: '' })
    fetchInventory()
  }

  const handleEdit = async (id) => {
    const res = await fetch(`${api}/inventory/edit/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        name: editedItem.name,
        price: parseFloat(editedItem.price)
      })
    })
    setEditingItemId(null)
    fetchInventory()
  }

  const handleDelete = async (id) => {
    const res = await fetch(`${api}/inventory/delete/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    })
    fetchInventory()
  }

  const handleCSVUpload = async () => {
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    setLoading(true)
    const res = await fetch(`${api}/inventory/bulk-upload`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    })
    setFile(null)
    setLoading(false)
    fetchInventory()
  }

  const handleSaveInstructions = async () => {
    const res = await fetch(`${api}/inventory/special-instructions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ special_instructions: specialInstructions })
    })
    if (res.ok) setInstructionsSaved(true)
  }

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h2>Your Price List -- Include delivery fees or any kind of special fees here too!!!</h2>

      <table border={1} cellPadding={10} style={{ width: '100%', marginBottom: '1rem' }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Price ($)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((item) => (
            <tr key={item.id}>
              <td>
                {editingItemId === item.id ? (
                  <input
                    value={editedItem.name}
                    onChange={(e) => setEditedItem({ ...editedItem, name: e.target.value })}
                  />
                ) : (
                  item.name
                )}
              </td>
              <td>
                {editingItemId === item.id ? (
                  <input
                    type="number"
                    value={editedItem.price}
                    onChange={(e) => setEditedItem({ ...editedItem, price: e.target.value })}
                  />
                ) : (
                  item.price.toFixed(2)
                )}
              </td>
              <td>
                {editingItemId === item.id ? (
                  <>
                    <button onClick={() => handleEdit(item.id)}>Save</button>
                    <button onClick={() => setEditingItemId(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => {
                      setEditingItemId(item.id)
                      setEditedItem({ name: item.name, price: item.price })
                    }}>Edit</button>
                    <button onClick={() => handleDelete(item.id)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h4>Add Item</h4>
      <input
        placeholder="Name"
        value={newItem.name}
        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
      />
      <input
        type="number"
        placeholder="Price"
        value={newItem.price}
        onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
      />
      <button onClick={handleAdd}>Add</button>

      <h4 style={{ marginTop: '2rem' }}>Bulk Upload via CSV</h4>
      <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleCSVUpload} disabled={loading}>{loading ? 'Uploading...' : 'Upload'}</button>

      <h4 style={{ marginTop: '2rem' }}>Special Instructions</h4>
      <textarea
        style={{ width: '100%', height: '100px' }}
        placeholder="e.g. $10 minimum order, delivery fee waived over $50..."
        value={specialInstructions}
        onChange={(e) => {
          setSpecialInstructions(e.target.value)
          setInstructionsSaved(false)
        }}
      />
      <br />
      <div style={{ marginTop: '3rem', textAlign: 'right' }}>
    {/* Confirmation message */}
{instructionsSaved && (
  <p style={{ color: 'green', textAlign: 'right', marginTop: '1rem' }}>
    ✔ Special instructions saved!
  </p>
)}
  <button
    onClick={async () => {
      await handleSaveInstructions()  // Save instructions first
      onNext()                        // Then move to next step
    }}
    style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}
  >
    ✅ Done
  </button>
</div>

    </div>
  )
}

export default InventoryPage
