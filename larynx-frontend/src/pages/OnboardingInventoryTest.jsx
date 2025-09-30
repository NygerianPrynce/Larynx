import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit3, Check, X } from 'lucide-react';

const OnboardingInventoryTest = () => {
  const [inventory, setInventory] = useState([
    {
      id: 1,
      name: "6ft Round Table",
      price: "$25",
      description: "Perfect for intimate dining settings"
    },
    {
      id: 2,
      name: "White Garden Chairs",
      price: "$5",
      description: "Classic white chairs for outdoor events"
    }
  ]);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({ name: '', price: '', description: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  const handleAddItem = () => {
    if (newItem.name.trim() && newItem.price.trim()) {
      const item = {
        id: Date.now(),
        name: newItem.name.trim(),
        price: newItem.price.trim(),
        description: newItem.description.trim()
      };
      setInventory([...inventory, item]);
      setNewItem({ name: '', price: '', description: '' });
      setShowAddForm(false);
    }
  };

  const handleDeleteItem = (id) => {
    setInventory(inventory.filter(item => item.id !== id));
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
  };

  const handleSaveEdit = () => {
    if (editingItem.name.trim() && editingItem.price.trim()) {
      setInventory(inventory.map(item => 
        item.id === editingItem.id ? editingItem : item
      ));
      setEditingItem(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  return (
    <div className="min-h-screen bg-white" style={{ width: '100vw', maxWidth: '100%' }}>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Inventory Test</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Test Environment</span>
              <a 
                href="/onboarding" 
                className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors duration-200"
              >
                Back to Onboarding
              </a>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          <motion.div 
            className="bg-white border border-gray-200 rounded-2xl shadow-sm"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Header */}
            <div className="p-8 border-b border-gray-200">
              <motion.div variants={itemVariants}>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Add Your Products & Services</h2>
                <p className="text-gray-600">
                  Help Larynx AI understand what you offer so it can provide accurate responses to customer inquiries.
                </p>
              </motion.div>
            </div>

            {/* Inventory List */}
            <div className="p-8">
              <motion.div variants={itemVariants} className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Current Inventory</h3>
                  <motion.button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Item</span>
                  </motion.button>
                </div>

                {/* Inventory Items */}
                <div className="space-y-4">
                  {inventory.map((item) => (
                    <motion.div
                      key={item.id}
                      className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                      variants={itemVariants}
                      layout
                    >
                      {editingItem && editingItem.id === item.id ? (
                        // Edit Form
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                            <input
                              type="text"
                              value={editingItem.name}
                              onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="Enter item name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                            <input
                              type="text"
                              value={editingItem.price}
                              onChange={(e) => setEditingItem({...editingItem, price: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="e.g., $25, $10/hour"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                            <textarea
                              value={editingItem.description}
                              onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="Brief description of the item"
                              rows={2}
                            />
                          </div>
                          <div className="flex space-x-2">
                            <motion.button
                              onClick={handleSaveEdit}
                              className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Check className="w-4 h-4" />
                              <span>Save</span>
                            </motion.button>
                            <motion.button
                              onClick={handleCancelEdit}
                              className="flex items-center space-x-1 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <X className="w-4 h-4" />
                              <span>Cancel</span>
                            </motion.button>
                          </div>
                        </div>
                      ) : (
                        // Display Item
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="text-lg font-semibold text-gray-900">{item.name}</h4>
                              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium">
                                {item.price}
                              </span>
                            </div>
                            {item.description && (
                              <p className="text-gray-600 text-sm">{item.description}</p>
                            )}
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <motion.button
                              onClick={() => handleEditItem(item)}
                              className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Edit3 className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>

                {inventory.length === 0 && (
                  <motion.div 
                    className="text-center py-8 text-gray-500"
                    variants={itemVariants}
                  >
                    <p>No items added yet. Click "Add Item" to get started.</p>
                  </motion.div>
                )}
              </motion.div>

              {/* Add Item Form */}
              {showAddForm && (
                <motion.div
                  className="bg-purple-50 border border-purple-200 rounded-xl p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Add New Item</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                      <input
                        type="text"
                        value={newItem.name}
                        onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="e.g., 6ft Round Table"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                      <input
                        type="text"
                        value={newItem.price}
                        onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="e.g., $25, $10/hour, Free consultation"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                      <textarea
                        value={newItem.description}
                        onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Brief description of the item or service"
                        rows={3}
                      />
                    </div>
                    <div className="flex space-x-3">
                      <motion.button
                        onClick={handleAddItem}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Add Item
                      </motion.button>
                      <motion.button
                        onClick={() => {
                          setShowAddForm(false);
                          setNewItem({ name: '', price: '', description: '' });
                        }}
                        className="px-4 py-2 border border-purple-300 text-purple-700 bg-white rounded-lg hover:bg-purple-50 hover:border-purple-400 transition-colors duration-200"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
  );
};

export default OnboardingInventoryTest;
