/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Plus, UserCheck, Shield, Phone, MapPin, Eye, Edit, Save, X, History, FileSpreadsheet } from 'lucide-react';
import { Customer, Vehicle, Invoice } from '../types';

interface CustomerModuleProps {
  customers: Customer[];
  vehicles: Vehicle[];
  invoices: Invoice[];
  onAddCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  onUpdateCustomer: (id: string, customer: Partial<Customer>) => void;
}

export default function CustomerModule({
  customers,
  vehicles,
  invoices,
  onAddCustomer,
  onUpdateCustomer,
}: CustomerModuleProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // New Customer State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newNic, setNewNic] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Filtering
  const filteredCustomers = customers.filter((cust) => {
    const q = searchQuery.toLowerCase();
    return cust.name.toLowerCase().includes(q) || cust.phone.includes(q) || cust.nic.toLowerCase().includes(q);
  });

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const customerVehicles = selectedCustomerId ? vehicles.filter((v) => v.customerId === selectedCustomerId) : [];
  const customerInvoices = selectedCustomerId ? invoices.filter((i) => i.customerId === selectedCustomerId) : [];

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone || !newNic) return;
    onAddCustomer({
      name: newName,
      phone: newPhone,
      address: newAddress,
      nic: newNic,
      notes: newNotes,
      balance: 0,
    });
    // Reset Form
    setNewName('');
    setNewPhone('');
    setNewAddress('');
    setNewNic('');
    setNewNotes('');
    setShowAddForm(false);
  };

  const handleStartEdit = (cust: Customer) => {
    setEditingCustomer({ ...cust });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    onUpdateCustomer(editingCustomer.id, {
      name: editingCustomer.name,
      phone: editingCustomer.phone,
      address: editingCustomer.address,
      nic: editingCustomer.nic,
      notes: editingCustomer.notes,
    });
    setEditingCustomer(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Customers List Column */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-900">Customer Records</h2>
          <button
            id="cust-add-btn"
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-500 active:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10 cursor-pointer"
          >
            <Plus size={16} />
            Register Customer
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="cust-search-input"
            type="text"
            placeholder="Search customers by name, phone, or NIC..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-250 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
          />
        </div>

        {/* Customer List Card */}
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="divide-y divide-slate-50">
            {filteredCustomers.map((cust) => (
              <div
                key={cust.id}
                id={`customer-item-${cust.id}`}
                onClick={() => setSelectedCustomerId(cust.id)}
                className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                  selectedCustomerId === cust.id ? 'bg-blue-50/40 border-l-4 border-l-blue-600' : 'hover:bg-slate-50/60'
                }`}
              >
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                    {cust.name}
                    {cust.balance > 0 && (
                      <span className="text-[10px] bg-amber-50 border border-amber-200 text-amber-700 px-1.5 py-0.5 rounded-full font-bold">
                        Credit: Rs. {cust.balance.toLocaleString()}
                      </span>
                    )}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Phone size={12} /> {cust.phone}
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Shield size={12} /> {cust.nic}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    id={`view-cust-history-${cust.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCustomerId(cust.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View History"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    id={`edit-cust-btn-${cust.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEdit(cust);
                    }}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Edit Record"
                  >
                    <Edit size={16} />
                  </button>
                </div>
              </div>
            ))}
            {filteredCustomers.length === 0 && (
              <div className="py-12 text-center text-slate-400">
                No customer records found matching your search.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Customer Detail Column */}
      <div className="space-y-4">
        {/* Detail Card */}
        {selectedCustomer && !editingCustomer && !showAddForm && (
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800">{selectedCustomer.name}</h3>
                <p className="text-xs text-slate-400 mt-1">NIC: <span className="font-mono text-slate-600">{selectedCustomer.nic}</span></p>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono font-bold uppercase">
                Active Client
              </span>
            </div>

            {/* Profile Info */}
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2.5">
                <Phone size={16} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-slate-400 text-xs">Mobile Number</p>
                  <p className="text-slate-700 font-semibold">{selectedCustomer.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin size={16} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-slate-400 text-xs">Home Address</p>
                  <p className="text-slate-700">{selectedCustomer.address || 'No address provided'}</p>
                </div>
              </div>
            </div>

            {/* Credit Account Balance */}
            <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 block">Outstanding Credit</span>
                <span className={`text-base font-bold font-sans ${selectedCustomer.balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  Rs. {selectedCustomer.balance.toLocaleString()}
                </span>
              </div>
              <div className="p-2 bg-white border border-slate-100 text-slate-500 rounded-lg">
                <UserCheck size={18} />
              </div>
            </div>

            {/* Customer Notes */}
            {selectedCustomer.notes && (
              <div className="bg-amber-50/40 border border-amber-100/60 p-3 rounded-xl text-xs text-amber-800 space-y-1">
                <span className="font-semibold block font-mono">Customer Notes:</span>
                <p>{selectedCustomer.notes}</p>
              </div>
            )}

            {/* Customer Repair History & Invoices */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase font-mono">
                <History size={14} /> Registered Vehicles
              </h4>
              <div className="space-y-1.5">
                {customerVehicles.map((veh) => (
                  <div key={veh.id} className="flex justify-between items-center bg-slate-50/50 p-2.5 border border-slate-100 rounded-xl text-xs text-slate-700">
                    <div>
                      <span className="font-semibold block">{veh.make} {veh.model}</span>
                      <span className="text-[10px] text-slate-400">{veh.year} • {veh.engine}</span>
                    </div>
                    <span className="font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">
                      {veh.registration}
                    </span>
                  </div>
                ))}
                {customerVehicles.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-2">No vehicles registered.</p>
                )}
              </div>

              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase font-mono pt-2">
                <FileSpreadsheet size={14} /> Invoice Records
              </h4>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {customerInvoices.map((inv) => (
                  <div key={inv.id} className="flex justify-between items-center bg-slate-50/50 p-2 border border-slate-100 rounded-xl text-xs text-slate-700">
                    <div>
                      <span className="font-semibold block">{inv.invoiceNo}</span>
                      <span className="text-[10px] text-slate-400">{new Date(inv.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold block">Rs. {inv.total.toLocaleString()}</span>
                      <span className={`text-[9px] font-bold ${inv.paid ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {inv.paid ? 'PAID' : 'PENDING'}
                      </span>
                    </div>
                  </div>
                ))}
                {customerInvoices.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-2">No invoices created.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Register Customer Form */}
        {showAddForm && !editingCustomer && (
          <form id="cust-add-form" onSubmit={handleCreateCustomer} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm">Register New Customer</h3>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Customer Full Name *</label>
                <input
                  id="new-cust-name"
                  type="text"
                  required
                  placeholder="e.g. Ruwan Gunawardena"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Mobile Number (Sri Lanka) *</label>
                <input
                  id="new-cust-phone"
                  type="tel"
                  required
                  placeholder="e.g. 0771234567"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">NIC or ID Number *</label>
                <input
                  id="new-cust-nic"
                  type="text"
                  required
                  placeholder="e.g. 199014283921 or 901428392V"
                  value={newNic}
                  onChange={(e) => setNewNic(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Home/Office Address</label>
                <input
                  id="new-cust-address"
                  type="text"
                  placeholder="e.g. No. 12, Galle Road, Colombo 03"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Internal Notes</label>
                <textarea
                  id="new-cust-notes"
                  rows={3}
                  placeholder="Enter custom observations, preferences..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                type="submit"
                id="submit-new-cust-btn"
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-md cursor-pointer text-center"
              >
                Register Customer
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

        {/* Edit Customer Form */}
        {editingCustomer && (
          <form id="cust-edit-form" onSubmit={handleSaveEdit} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm">Edit Customer Record</h3>
              <button
                type="button"
                onClick={() => setEditingCustomer(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Customer Full Name *</label>
                <input
                  id="edit-cust-name"
                  type="text"
                  required
                  value={editingCustomer.name}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Mobile Number (Sri Lanka) *</label>
                <input
                  id="edit-cust-phone"
                  type="tel"
                  required
                  value={editingCustomer.phone}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">NIC or ID Number *</label>
                <input
                  id="edit-cust-nic"
                  type="text"
                  required
                  value={editingCustomer.nic}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, nic: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Home/Office Address</label>
                <input
                  id="edit-cust-address"
                  type="text"
                  value={editingCustomer.address}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, address: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Internal Notes</label>
                <textarea
                  id="edit-cust-notes"
                  rows={3}
                  value={editingCustomer.notes}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, notes: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                type="submit"
                id="save-cust-btn"
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-md cursor-pointer text-center"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setEditingCustomer(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-2 px-3 rounded-xl cursor-pointer text-center"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {!selectedCustomerId && !showAddForm && !editingCustomer && (
          <div className="bg-slate-50 border border-slate-100/80 rounded-2xl p-6 text-center text-slate-400 text-xs py-16">
            Click any customer's eye icon to inspect their outstanding balance, vehicles, and billing details here.
          </div>
        )}
      </div>
    </div>
  );
}
