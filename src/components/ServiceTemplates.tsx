/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Star, StarOff, Plus, Wrench, Edit, Trash2, X } from 'lucide-react';
import { ServiceTemplate } from '../types';

interface ServiceTemplatesProps {
  templates: ServiceTemplate[];
  onAddTemplate: (template: Omit<ServiceTemplate, 'id'>) => void;
  onUpdateTemplate: (id: string, template: Partial<ServiceTemplate>) => void;
  onDeleteTemplate: (id: string) => void;
}

export default function ServiceTemplates({
  templates,
  onAddTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
}: ServiceTemplatesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ServiceTemplate | null>(null);

  // New Template Form State
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPrice, setNewPrice] = useState(0);
  const [newCategory, setNewCategory] = useState<'maintenance' | 'repair' | 'diagnostics' | 'ac' | 'brakes' | 'suspension'>('maintenance');

  // Filtering (supports prefix search like 'oil', 'br', 'ac', 'diag' etc)
  const filteredTemplates = templates.filter((t) => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;

    // Direct match or prefix matching (first letters)
    const initials = t.name.split(' ').map(w => w[0]).join('').toLowerCase();
    const isPrefixMatch = t.name.toLowerCase().startsWith(q) || initials.startsWith(q);
    const isWordMatch = t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);

    return isPrefixMatch || isWordMatch;
  });

  const favorites = filteredTemplates.filter((t) => t.isFavorite);
  const others = filteredTemplates.filter((t) => !t.isFavorite);

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || newPrice <= 0) return;

    onAddTemplate({
      name: newName,
      description: newDesc,
      category: newCategory,
      defaultPrice: Number(newPrice),
      isFavorite: false,
    });

    setNewName('');
    setNewDesc('');
    setNewPrice(0);
    setNewCategory('maintenance');
    setShowAddForm(false);
  };

  const handleToggleFavorite = (id: string, currentVal: boolean) => {
    onUpdateTemplate(id, { isFavorite: !currentVal });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;
    onUpdateTemplate(editingTemplate.id, {
      name: editingTemplate.name,
      description: editingTemplate.description,
      category: editingTemplate.category,
      defaultPrice: Number(editingTemplate.defaultPrice),
    });
    setEditingTemplate(null);
  };

  const categoryLabels = {
    maintenance: 'General Maintenance',
    repair: 'Mechanical Repair',
    diagnostics: 'Diagnostics',
    ac: 'Air Conditioning',
    brakes: 'Brakes Service',
    suspension: 'Suspension',
  };

  const categoryColors = {
    maintenance: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    repair: 'bg-slate-50 text-slate-700 border-slate-200',
    diagnostics: 'bg-amber-50 text-amber-700 border-amber-200',
    ac: 'bg-sky-50 text-sky-700 border-sky-200',
    brakes: 'bg-rose-50 text-rose-700 border-rose-200',
    suspension: 'bg-teal-50 text-teal-700 border-teal-200',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Service Templates List Column */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Service Templates</h2>
            <p className="text-xs text-slate-500 mt-0.5">Reusable standard service templates with editable pricing.</p>
          </div>
          <button
            id="srv-add-btn"
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-500 active:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10 cursor-pointer whitespace-nowrap"
          >
            <Plus size={16} />
            Create Service
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="srv-search-input"
            type="text"
            placeholder="Search templates (e.g. 'oil', 'br' for brakes, 'ac', 'diag')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-250 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
          />
        </div>

        {/* Templates Display Card */}
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm p-5 space-y-6">
          {/* Favorites List */}
          {favorites.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold font-mono uppercase text-amber-600 flex items-center gap-1.5">
                <Star size={14} className="fill-amber-400 text-amber-500" /> Favorite Services
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {favorites.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 bg-amber-50/20 border border-amber-200/40 rounded-2xl flex flex-col justify-between hover:shadow-sm transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md border ${categoryColors[t.category]}`}>
                          {categoryLabels[t.category]}
                        </span>
                        <button
                          id={`fav-star-${t.id}`}
                          onClick={() => handleToggleFavorite(t.id, t.isFavorite)}
                          className="text-amber-500 hover:scale-110 transition-transform"
                        >
                          <Star size={16} className="fill-amber-400" />
                        </button>
                      </div>
                      <h4 className="font-bold text-sm text-slate-800 mt-2.5 leading-tight">{t.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{t.description}</p>
                    </div>

                    <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">Rs. {t.defaultPrice.toLocaleString()}</span>
                      <div className="flex gap-1.5">
                        <button
                          id={`edit-srv-${t.id}`}
                          onClick={() => setEditingTemplate(t)}
                          className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Edit size={13} />
                        </button>
                        <button
                          id={`del-srv-${t.id}`}
                          onClick={() => onDeleteTemplate(t.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Standard templates list */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold font-mono uppercase text-slate-500 flex items-center gap-1.5 pt-2">
              <Wrench size={14} /> Service Catalog
            </h3>
            <div className="divide-y divide-slate-50 border border-slate-100 rounded-xl overflow-hidden">
              {others.map((t) => (
                <div key={t.id} className="p-4 flex items-center justify-between bg-slate-50/20 hover:bg-slate-50/60 transition-colors">
                  <div className="space-y-1.5 max-w-[70%]">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 text-[8px] font-bold rounded border ${categoryColors[t.category]}`}>
                        {categoryLabels[t.category]}
                      </span>
                      <h4 className="font-bold text-xs text-slate-800">{t.name}</h4>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">{t.description}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-slate-700">Rs. {t.defaultPrice.toLocaleString()}</span>
                    <div className="flex items-center gap-1">
                      <button
                        id={`fav-star-oth-${t.id}`}
                        onClick={() => handleToggleFavorite(t.id, t.isFavorite)}
                        className="p-1 text-slate-400 hover:text-amber-500 rounded-lg transition-colors"
                      >
                        <StarOff size={14} />
                      </button>
                      <button
                        id={`edit-srv-oth-${t.id}`}
                        onClick={() => setEditingTemplate(t)}
                        className="p-1 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        id={`del-srv-oth-${t.id}`}
                        onClick={() => onDeleteTemplate(t.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {others.length === 0 && favorites.length === 0 && (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No services matching the search filters. Try 'oil', 'br', 'ac', 'diag'.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Editor & Creation Column */}
      <div className="space-y-4">
        {/* Create Service Form */}
        {showAddForm && !editingTemplate && (
          <form id="srv-add-form" onSubmit={handleCreateTemplate} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm">Create New Service</h3>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Service Name *</label>
                <input
                  id="new-srv-name"
                  type="text"
                  required
                  placeholder="e.g. Engine oil & filter change"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Service Description</label>
                <textarea
                  id="new-srv-desc"
                  rows={3}
                  placeholder="Describe parts replaced, diagnostics run..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Category *</label>
                  <select
                    id="new-srv-category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                  >
                    <option value="maintenance">Maintenance</option>
                    <option value="repair">Mechanical Repair</option>
                    <option value="diagnostics">Diagnostics</option>
                    <option value="ac">Air Conditioning</option>
                    <option value="brakes">Brakes Service</option>
                    <option value="suspension">Suspension</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Default Price (Rs.) *</label>
                  <input
                    id="new-srv-price"
                    type="number"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                type="submit"
                id="submit-new-srv-btn"
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-md cursor-pointer text-center"
              >
                Create Service
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-2 px-3 rounded-xl cursor-pointer text-center"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Edit Service Form */}
        {editingTemplate && (
          <form id="srv-edit-form" onSubmit={handleSaveEdit} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm">Edit Service Template</h3>
              <button
                type="button"
                onClick={() => setEditingTemplate(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Service Name *</label>
                <input
                  id="edit-srv-name"
                  type="text"
                  required
                  value={editingTemplate.name}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Service Description</label>
                <textarea
                  id="edit-srv-desc"
                  rows={3}
                  value={editingTemplate.description}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Category *</label>
                  <select
                    id="edit-srv-category"
                    value={editingTemplate.category}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, category: e.target.value as any })}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                  >
                    <option value="maintenance">Maintenance</option>
                    <option value="repair">Mechanical Repair</option>
                    <option value="diagnostics">Diagnostics</option>
                    <option value="ac">Air Conditioning</option>
                    <option value="brakes">Brakes Service</option>
                    <option value="suspension">Suspension</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Default Price (Rs.) *</label>
                  <input
                    id="edit-srv-price"
                    type="number"
                    required
                    value={editingTemplate.defaultPrice}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, defaultPrice: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                type="submit"
                id="save-srv-btn"
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-md cursor-pointer text-center"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setEditingTemplate(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-2 px-3 rounded-xl cursor-pointer text-center"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {!showAddForm && !editingTemplate && (
          <div className="bg-slate-50 border border-slate-100/80 rounded-2xl p-6 text-center text-slate-400 text-xs py-16">
            Click "Create Service" to add reusable packages, or click standard edit icons to modify current workshop pricing schemes.
          </div>
        )}
      </div>
    </div>
  );
}
