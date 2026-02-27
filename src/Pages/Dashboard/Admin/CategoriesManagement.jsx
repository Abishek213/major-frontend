import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Edit2, Check, X, RefreshCw, ChevronRight, ChevronDown, FolderTree, Sparkles, Layers, Filter, AlertTriangle, TrendingUp } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import api from '../../../utils/api';

const CategoriesManagement = () => {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [parentCategory, setParentCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editName, setEditName] = useState('');
  const [editParentCategory, setEditParentCategory] = useState('');
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.safeGet('/categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Organize categories into a hierarchical structure
  const organizeCategories = () => {
    const categoryMap = new Map();
    const rootCategories = [];

    categories.forEach(category => {
      categoryMap.set(category._id, { ...category, children: [] });
    });

    categories.forEach(category => {
      const categoryWithChildren = categoryMap.get(category._id);
      if (category.parentCategory?._id) {
        const parent = categoryMap.get(category.parentCategory._id);
        if (parent) {
          parent.children.push(categoryWithChildren);
        }
      } else {
        rootCategories.push(categoryWithChildren);
      }
    });

    return rootCategories;
  };

  const getCategoryNameById = (categoryId) => {
    const category = categories.find(cat => cat._id === categoryId);
    return category ? category.categoryName : '';
  };

  const toggleExpand = (categoryId) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Filter categories based on active tab
  const getFilteredCategories = () => {
    const organized = organizeCategories();
    
    const filterCategories = (catList) => {
      return catList.filter(category => {
        let passesFilter = true;
        
        if (activeTab === 'active') {
          passesFilter = category.isActive;
        } else if (activeTab === 'inactive') {
          passesFilter = !category.isActive;
        }
        
        if (passesFilter && category.children.length > 0) {
          category.children = filterCategories(category.children);
        }
        
        return passesFilter;
      });
    };
    
    return filterCategories(organized);
  };

  // Custom Badge Component
  const Badge = ({ children, variant = 'default', className = '' }) => {
    const baseStyles = "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium";
    
    const variants = {
      default: "bg-gray-100 text-gray-800 border border-gray-200",
      outline: "border border-gray-300 text-gray-700",
      success: "bg-emerald-100 text-emerald-800 border border-emerald-200",
      warning: "bg-amber-100 text-amber-800 border border-amber-200",
      error: "bg-red-100 text-red-800 border border-red-200",
      info: "bg-blue-100 text-blue-800 border border-blue-200",
      gradient: "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 border border-indigo-200"
    };
    
    return (
      <span className={`${baseStyles} ${variants[variant]} ${className}`}>
        {children}
      </span>
    );
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      setError(null);
      const response = await api.safePost('/categories', {
        categoryName: newCategoryName,
        parentCategory: parentCategory || null
      });

      setCategories([...categories, response.data]);
      setNewCategoryName('');
      setParentCategory('');
    } catch (err) {
      console.error('Error creating category:', err);
      setError(err.message);
    }
  };

  const handleDeactivateCategory = async (categoryId) => {
    try {
      setError(null);
      await api.safePatch(`/categories/${categoryId}/deactivate`);
      
      setCategories(categories.map(category => 
        category._id === categoryId 
          ? { ...category, isActive: false }
          : category
      ));
    } catch (err) {
      console.error('Error deactivating category:', err);
      setError(err.message || 'Failed to deactivate category');
    }
  };

  const handleReactivateCategory = async (categoryId) => {
    try {
      setError(null);
      await api.safePatch(`/categories/${categoryId}/reactivate`);
      
      setCategories(categories.map(category => 
        category._id === categoryId 
          ? { ...category, isActive: true }
          : category
      ));
    } catch (err) {
      console.error('Error reactivating category:', err);
      setError(err.message);
    }
  };

  const handleUpdateCategory = async (categoryId) => {
    try {
      setError(null);
      const response = await api.safePut(`/categories/${categoryId}`, {
        categoryName: editName,
        parentCategory: editParentCategory || null
      });

      setCategories(categories.map(cat => 
        cat._id === categoryId ? response.data : cat
      ));
      setEditingCategory(null);
    } catch (err) {
      console.error('Error updating category:', err);
      setError(err.message);
    }
  };

  const startEditing = (category) => {
    setEditingCategory(category._id);
    setEditName(category.categoryName);
    setEditParentCategory(category.parentCategory?._id || '');
  };

  const cancelEditing = () => {
    setEditingCategory(null);
    setEditName('');
    setEditParentCategory('');
  };

  if (loading) {
    return (
      <div className="space-y-8 p-4 md:p-6">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <RefreshCw className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700">Loading categories data...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeCategories = categories.filter(cat => cat.isActive);
  const filteredCategories = getFilteredCategories();

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Error Alert */}
      {error && (
        <div className="relative p-5 pl-14 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-lg shadow-sm animate-fade-in">
          <div className="absolute left-5 top-5">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div className="pr-10">
            <h4 className="font-bold text-red-800 mb-1">Action Required</h4>
            <p className="text-sm text-red-600">{error}</p>
          </div>
          <button 
            onClick={() => setError(null)} 
            className="absolute right-4 top-4 p-1 rounded-full hover:bg-red-100 transition-colors"
            aria-label="Close error"
          >
            <X className="w-5 h-5 text-red-500" />
          </button>
        </div>
      )}

      {/* Main Dashboard Container */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-6 md:p-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                  <Tag className="w-6 h-6 text-white" />
                </div>
                Categories Management Dashboard
              </h1>
              <p className="text-gray-600">
                Organize and manage your event categories hierarchy
              </p>
            </div>
            
            <button 
              onClick={fetchCategories}
              disabled={loading}
              className={`mt-4 md:mt-0 px-5 py-3 rounded-xl font-medium flex items-center gap-2 transition-all duration-300 ${
                loading 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  Refresh Data
                </>
              )}
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
                  <Tag className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-8 h-8 text-indigo-300" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">{categories.length}</h3>
              <p className="text-gray-600 font-medium">Total Categories</p>
              <div className="mt-3 h-2 bg-indigo-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: '100%' }}
                ></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-8 h-8 text-emerald-300" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">{activeCategories.length}</h3>
              <p className="text-gray-600 font-medium">Active Categories</p>
              <div className="mt-3 h-2 bg-emerald-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all duration-500"
                  style={{ width: categories.length > 0 ? `${(activeCategories.length / categories.length) * 100}%` : '0%' }}
                ></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center">
                  <FolderTree className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-8 h-8 text-amber-300" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">{categories.filter(c => !c.parentCategory).length}</h3>
              <p className="text-gray-600 font-medium">Root Categories</p>
              <div className="mt-3 h-2 bg-amber-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full transition-all duration-500"
                  style={{ width: '100%' }}
                ></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-rose-50 to-white border border-rose-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                  <Layers className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-8 h-8 text-rose-300" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">{categories.filter(c => c.parentCategory).length}</h3>
              <p className="text-gray-600 font-medium">Child Categories</p>
              <div className="mt-3 h-2 bg-rose-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-500"
                  style={{ width: categories.length > 0 ? `${(categories.filter(c => c.parentCategory).length / categories.length) * 100}%` : '0%' }}
                ></div>
              </div>
            </div>
          </div>

          {/* Categories Management Section */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Filter className="w-5 h-5 text-indigo-600" />
                  Manage Categories
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {categories.length} categories in the system
                </p>
              </div>
              
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2">
                <Tag className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Add Category Form */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6">
              <div className="mb-4">
                <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-indigo-600" />
                  Create New Category
                </h3>
                <p className="text-sm text-gray-600">
                  Add a new category to organize your events. Categories can have parent-child relationships.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name
                  </label>
                  <Input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Enter category name"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all bg-white"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parent Category
                  </label>
                  <Select 
                    value={parentCategory}
                    onValueChange={setParentCategory}
                  >
                    <SelectTrigger className="w-full border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-4 py-3">
                      <SelectValue placeholder="Select parent category" />
                    </SelectTrigger>
                    <SelectContent className="border border-gray-200 rounded-xl">
                      <SelectItem value="">None (Root Category)</SelectItem>
                      {activeCategories.map(category => (
                        <SelectItem key={category._id} value={category._id}>
                          <div className="flex items-center gap-2">
                            <FolderTree className="w-4 h-4 text-indigo-600" />
                            {category.categoryName}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleAddCategory}
                    disabled={!newCategoryName.trim()}
                    className={`w-full px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-300 ${
                      !newCategoryName.trim()
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg hover:scale-105'
                    }`}
                  >
                    <Plus className="w-5 h-5" />
                    Add Category
                  </button>
                </div>
              </div>
            </div>

            {/* Categories Table */}
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                      <th className="py-4 pl-6 text-left font-bold text-gray-700 text-sm uppercase tracking-wider">
                        Category Name
                      </th>
                      <th className="py-4 text-left font-bold text-gray-700 text-sm uppercase tracking-wider">
                        Parent Category
                      </th>
                      <th className="py-4 text-left font-bold text-gray-700 text-sm uppercase tracking-wider">
                        Status
                      </th>
                      <th className="py-4 pr-6 text-left font-bold text-gray-700 text-sm uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCategories.length > 0 ? (
                      filteredCategories.map((category) => (
                        <CategoryRow 
                          key={category._id} 
                          category={category}
                          categories={categories}
                          editingCategory={editingCategory}
                          editName={editName}
                          editParentCategory={editParentCategory}
                          expandedCategories={expandedCategories}
                          onToggleExpand={toggleExpand}
                          onStartEditing={startEditing}
                          onCancelEditing={cancelEditing}
                          onUpdateCategory={handleUpdateCategory}
                          onDeactivateCategory={handleDeactivateCategory}
                          onReactivateCategory={handleReactivateCategory}
                          onSetEditName={setEditName}
                          onSetEditParentCategory={setEditParentCategory}
                        />
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="py-16 text-center">
                          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <Tag className="w-12 h-12 text-gray-400" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-700 mb-2">
                            {activeTab === 'all' ? 'No Categories Found' : `No ${activeTab} Categories`}
                          </h3>
                          <p className="text-gray-500 mb-6">
                            {activeTab === 'all' 
                              ? 'Start by adding your first category' 
                              : `No ${activeTab} categories found in the system.`
                            }
                          </p>
                          <button
                            onClick={fetchCategories}
                            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 font-medium hover:from-indigo-200 hover:to-purple-200 transition-all duration-300 flex items-center gap-2 mx-auto"
                          >
                            <RefreshCw className="w-4 h-4" />
                            Refresh Categories
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Separate CategoryRow component for better organization
const CategoryRow = ({ 
  category, 
  categories,
  editingCategory, 
  editName, 
  editParentCategory, 
  expandedCategories,
  onToggleExpand,
  onStartEditing,
  onCancelEditing,
  onUpdateCategory,
  onDeactivateCategory,
  onReactivateCategory,
  onSetEditName,
  onSetEditParentCategory,
  level = 0,
  parentPath = []
}) => {
  const isExpanded = expandedCategories.has(category._id);
  const hasChildren = category.children && category.children.length > 0;
  const indentation = level * 24;

  const getCategoryNameById = (categoryId) => {
    const cat = categories.find(c => c._id === categoryId);
    return cat ? cat.categoryName : '';
  };

  const renderChildren = () => {
    if (!hasChildren || !isExpanded) return null;

    return category.children.map(child => (
      <CategoryRow 
        key={child._id} 
        category={child}
        categories={categories}
        editingCategory={editingCategory}
        editName={editName}
        editParentCategory={editParentCategory}
        expandedCategories={expandedCategories}
        onToggleExpand={onToggleExpand}
        onStartEditing={onStartEditing}
        onCancelEditing={onCancelEditing}
        onUpdateCategory={onUpdateCategory}
        onDeactivateCategory={onDeactivateCategory}
        onReactivateCategory={onReactivateCategory}
        onSetEditName={onSetEditName}
        onSetEditParentCategory={onSetEditParentCategory}
        level={level + 1}
        parentPath={[...parentPath, category._id]}
      />
    ));
  };

  return (
    <>
      <tr 
        key={category._id} 
        className="group border-b border-gray-100 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-all duration-300"
      >
        <td className="py-5 pl-6">
          <div className="flex items-center" style={{ paddingLeft: `${indentation}px` }}>
            {hasChildren && (
              <button
                onClick={() => onToggleExpand(category._id)}
                className="w-7 h-7 mr-3 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 hover:from-indigo-200 hover:to-purple-200 transition-all shadow-sm flex items-center justify-center group-hover:scale-110"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-indigo-600" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-indigo-600" />
                )}
              </button>
            )}
            {!hasChildren && <div className="w-10" />}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shadow-sm">
                {hasChildren ? (
                  <FolderTree className="w-5 h-5 text-indigo-600" />
                ) : (
                  <Tag className="w-5 h-5 text-indigo-600" />
                )}
              </div>
              {editingCategory === category._id ? (
                <Input
                  type="text"
                  value={editName}
                  onChange={(e) => onSetEditName(e.target.value)}
                  className="w-64 border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-4 py-2"
                />
              ) : (
                <div className="flex flex-col">
                  <span className="font-medium text-gray-800 group-hover:text-indigo-700 transition-colors">
                    {category.categoryName}
                  </span>
                  <span className="text-xs text-gray-500">
                    {hasChildren ? `${category.children.length} subcategories` : 'No subcategories'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </td>
        <td className="py-5">
          {editingCategory === category._id ? (
            <Select 
              value={editParentCategory}
              onValueChange={onSetEditParentCategory}
            >
              <SelectTrigger className="w-48 border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-4 py-2">
                <SelectValue>
                  {editParentCategory ? getCategoryNameById(editParentCategory) : "Parent Category"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="border border-gray-200 rounded-xl">
                <SelectItem value="">None</SelectItem>
                {categories
                  .filter(cat => 
                    cat._id !== category._id && 
                    !parentPath.includes(cat._id) &&
                    cat.isActive
                  )
                  .map(cat => (
                    <SelectItem key={cat._id} value={cat._id} className="hover:bg-indigo-50">
                      {cat.categoryName}
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
          ) : (
            <div className="flex items-center gap-2">
              {category.parentCategory ? (
                <>
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                    <Layers className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="font-medium text-gray-700">
                    {category.parentCategory.categoryName}
                  </span>
                </>
              ) : (
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-200">
                  Root Category
                </span>
              )}
            </div>
          )}
        </td>
        <td className="py-5">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${category.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              category.isActive 
                ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700' 
                : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700'
            }`}>
              {category.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </td>
        <td className="py-5 pr-6">
          <div className="flex items-center justify-end gap-3">
            {editingCategory === category._id ? (
              <>
                <button
                  onClick={() => onUpdateCategory(category._id)}
                  className="p-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <Check className="w-5 h-5" />
                </button>
                <button
                  onClick={onCancelEditing}
                  className="p-2 rounded-xl bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-black text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onStartEditing(category)}
                  className="group/edit p-2 rounded-xl bg-gradient-to-r from-blue-100 to-cyan-100 hover:from-blue-200 hover:to-cyan-200 transition-all duration-300"
                  title="Edit category"
                >
                  <Edit2 className="w-5 h-5 text-blue-600 group-hover/edit:scale-110 transition-transform" />
                </button>
                {category.isActive ? (
                  <button 
                    onClick={() => onDeactivateCategory(category._id)}
                    className="px-4 py-2 rounded-xl font-medium flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <Trash2 className="w-4 h-4" />
                    Deactivate
                  </button>
                ) : (
                  <button 
                    onClick={() => onReactivateCategory(category._id)}
                    className="px-4 py-2 rounded-xl font-medium flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reactivate
                  </button>
                )}
              </>
            )}
          </div>
        </td>
      </tr>
      {renderChildren()}
    </>
  );
};

export default CategoriesManagement;