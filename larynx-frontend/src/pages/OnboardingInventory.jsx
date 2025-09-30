import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit3, Check, X, Upload, Package, Save } from 'lucide-react';

const OnboardingInventory = ({ onBack, onNext }) => {
  // Placeholder data for testing - matching the actual offerings page structure
  const [offerings, setOfferings] = useState([
    { id: 1, name: '6ft Round Tables', price: '$25', pricingType: 'per_unit', category: 'Furniture' },
    { id: 2, name: 'White Garden Chairs', price: '$5', pricingType: 'per_unit', category: 'Furniture' },
    { id: 3, name: 'Party Platter Package', price: '$150', pricingType: 'fixed', category: 'Food & Beverages' },
    { id: 4, name: 'Full Event Catering', price: '$45', pricingType: 'per_person', category: 'Catering' }
  ]);
  
  const [newOffering, setNewOffering] = useState({ name: '', price: '', pricingType: '', category: '' });
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [showCustomCategoryInput, setShowCustomCategoryInput] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingOffering, setEditingOffering] = useState({ name: '', price: '', pricingType: '', category: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [specialInstructions, setSpecialInstructions] = useState('All services include free initial consultation. Custom packages available upon request. Rush orders require 48-hour notice with additional fees. Delivery available within 20-mile radius. 30-day satisfaction guarantee on all services.');

  const defaultCategories = ['Catering', 'Event Rentals', 'Food & Beverages', 'Furniture', 'Decorations', 'Party Supplies', 'Venue Services'];
  const [customCategories, setCustomCategories] = useState(['Chairs', 'Tables', 'Party Platters', 'Drinks', 'Linens', 'Lighting']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categories = [...defaultCategories, ...customCategories, 'Other'];
  
  // Helper function to format price display
  const formatPrice = (price, pricingType) => {
    if (!price) return '';
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
    return `$${price}${pricingTypeMap[pricingType] || ''}`;
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
  ];

  // Filter offerings based on selected category
  const filteredOfferings = selectedCategory === 'All' 
    ? offerings 
    : offerings.filter(offering => offering.category === selectedCategory);

  // Helper function to normalize price input
  const normalizePrice = (price) => {
    return price.replace(/[^0-9.]/g, '');
  };

  const handleAddOffering = () => {
    if (newOffering.name && newOffering.price) {
      const normalizedPrice = normalizePrice(newOffering.price);
      const offering = {
        id: Date.now(),
        name: newOffering.name.trim(),
        price: normalizedPrice,
        pricingType: newOffering.pricingType || 'fixed',
        category: newOffering.category || 'Other'
      };
      setOfferings([...offerings, offering]);
      setNewOffering({ name: '', price: '', pricingType: '', category: '' });
      setShowAddForm(false);
    }
  };

  const handleDeleteOffering = (id) => {
    setOfferings(offerings.filter(offering => offering.id !== id));
  };

  const handleEditOffering = (id) => {
    const offering = offerings.find(o => o.id === id);
    setEditingId(id);
    setEditingOffering({ ...offering });
  };

  const handleSaveEdit = () => {
    if (editingOffering.name && editingOffering.price) {
      const normalizedPrice = normalizePrice(editingOffering.price);
      setOfferings(offerings.map(offering => 
        offering.id === editingId 
          ? { ...editingOffering, price: normalizedPrice }
          : offering
      ));
      setEditingId(null);
      setEditingOffering({ name: '', price: '', pricingType: '', category: '' });
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadFile(file);
      // Here you would typically process the CSV file
      console.log('File uploaded:', file.name);
    }
  };

  const addCustomCategory = () => {
    if (customCategoryInput.trim() && !customCategories.includes(customCategoryInput.trim())) {
      setCustomCategories([...customCategories, customCategoryInput.trim()]);
      
      // If we're editing an offering, set it for the editing offering, otherwise for the new offering
      if (editingId) {
        setEditingOffering({...editingOffering, category: customCategoryInput.trim()});
      } else {
        setNewOffering({...newOffering, category: customCategoryInput.trim()});
      }
      
      setCustomCategoryInput('');
      setShowCustomCategoryInput(false);
    }
  };

  const handleNext = () => {
    // Save offerings data (you can add API call here later)
    console.log('Offerings saved:', offerings);
    console.log('Special instructions:', specialInstructions);
    if (onNext) onNext();
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: { y: -2 }
  };

  return (
    <div className="p-8">

      {/* Content */}
      <motion.div
        className="w-full mx-auto"
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
            className="flex items-center justify-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add New Offering
          </button>
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Upload className="w-5 h-5" />
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Offering Name</label>
                <input
                  type="text"
                  value={newOffering.name}
                  onChange={(e) => setNewOffering({...newOffering, name: e.target.value})}
                  placeholder="Enter offering name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                <input
                  type="text"
                  value={newOffering.price}
                  onChange={(e) => setNewOffering({...newOffering, price: e.target.value})}
                  placeholder="Enter price (e.g., 299, 2500)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pricing Type</label>
                <select
                  value={newOffering.pricingType}
                  onChange={(e) => setNewOffering({...newOffering, pricingType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {pricingTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={newOffering.category}
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      setShowCustomCategoryInput(true);
                      setNewOffering({...newOffering, category: ''});
                    } else {
                      setNewOffering({...newOffering, category: e.target.value});
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                  <option value="custom">+ Add Custom Category</option>
                </select>
                {showCustomCategoryInput && (
                  <div className="flex flex-col gap-2 mt-2">
                    <input
                      type="text"
                      value={customCategoryInput}
                      onChange={(e) => setCustomCategoryInput(e.target.value)}
                      placeholder="Enter custom category"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={addCustomCategory}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors whitespace-nowrap"
                      >
                        Add Category
                      </button>
                      <button
                        onClick={() => {
                          setShowCustomCategoryInput(false);
                          setCustomCategoryInput('');
                        }}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 bg-transparent border border-purple-300 hover:bg-gray-100/30 rounded-lg transition-colors whitespace-nowrap"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAddOffering}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
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
                  className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors cursor-pointer"
                >
                  <Upload className="w-5 h-5" />
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
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
          <div className="overflow-x-auto">
            {filteredOfferings.length > 0 ? (
              <table className="w-full">
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
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                          />
                        ) : (
                          <div className="text-sm font-medium text-gray-900">{offering.name}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingId === offering.id ? (
                          <div className="min-w-0">
                            <select
                              value={editingOffering.category}
                              onChange={(e) => {
                                if (e.target.value === 'custom') {
                                  setShowCustomCategoryInput(true);
                                  setEditingOffering({...editingOffering, category: ''});
                                } else {
                                  setEditingOffering({...editingOffering, category: e.target.value});
                                }
                              }}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                            >
                              {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                              <option value="custom">+ Add Custom Category</option>
                            </select>
                            {showCustomCategoryInput && editingId === offering.id && (
                              <div className="flex flex-col gap-2 mt-2">
                                <input
                                  type="text"
                                  value={customCategoryInput}
                                  onChange={(e) => setCustomCategoryInput(e.target.value)}
                                  placeholder="Enter custom category"
                                  className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                />
                                <div className="flex gap-1 justify-end">
                                  <button
                                    onClick={addCustomCategory}
                                    className="px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors whitespace-nowrap text-sm"
                                  >
                                    Add
                                  </button>
                                  <button
                                    onClick={() => {
                                      setShowCustomCategoryInput(false);
                                      setCustomCategoryInput('');
                                    }}
                                    className="px-2 py-1 text-gray-600 hover:text-gray-800 bg-transparent border border-purple-300 hover:bg-gray-100/30 rounded transition-colors whitespace-nowrap text-sm"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 whitespace-nowrap">
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
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
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
                            className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
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
                              <Save className="w-4 h-4" />
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
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteOffering(offering.id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded bg-transparent hover:bg-red-100/30 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
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
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                {offerings.length === 0 ? (
                  <>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No offerings yet</h3>
                    <p className="text-gray-600 mb-6">Get started by adding your first offering</p>
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
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
                        className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            placeholder="Example: All services include free initial consultation. Rush orders require 48-hour notice. Custom packages available upon request. Delivery available within 20-mile radius..."
          />
        </motion.div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-8 mt-8 border-t border-gray-200">
          <motion.button
            onClick={onBack}
            className="px-6 py-3 border border-purple-300 text-purple-700 bg-white rounded-xl hover:bg-purple-50 hover:border-purple-400 transition-all duration-200 font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Back
          </motion.button>
          <motion.button
            onClick={handleNext}
            className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all duration-200 font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Continue to Next Step
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingInventory;
