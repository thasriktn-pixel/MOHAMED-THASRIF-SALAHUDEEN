/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Plus, Package, ScanLine, AlertCircle, ShoppingCart, User, PlusCircle, MinusCircle, X, ArrowUpRight } from 'lucide-react';
import { Part } from '../types';

interface InventoryModuleProps {
  parts: Part[];
  onAddPart: (part: Omit<Part, 'id'>) => void;
  onUpdatePart: (id: string, part: Partial<Part>) => void;
}

export default function InventoryModule({
  parts,
  onAddPart,
  onUpdatePart,
}: InventoryModuleProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [scanResult, setScanResult] = useState<string | null>(null);

  // New Part State
  const [newName, setNewName] = useState('');
  const [newPartNumber, setNewPartNumber] = useState('');
  const [newBarcode, setNewBarcode] = useState('');
  const [newSupplier, setNewSupplier] = useState('');
  const [newPurchasePrice, setNewPurchasePrice] = useState(0);
  const [newSellingPrice, setNewSellingPrice] = useState(0);
  const [newStock, setNewStock] = useState(1);
  const [newMinStock, setNewMinStock] = useState(5);
  const [newCategory, setNewCategory] = useState('Filters');

  // Filtering
  const filteredParts = parts.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.partNumber.toLowerCase().includes(q) ||
      p.barcode.includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  });

  const handleCreatePart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPartNumber || newPurchasePrice <= 0 || newSellingPrice <= 0) return;

    onAddPart({
      barcode: newBarcode || Math.floor(1000000000000 + Math.random() * 9000000000000).toString(),
      partNumber: newPartNumber,
      name: newName,
      supplier: newSupplier,
      purchasePrice: Number(newPurchasePrice),
      sellingPrice: Number(newSellingPrice),
      stock: Number(newStock),
      minStock: Number(newMinStock),
      category: newCategory,
    });

    // Reset Form
    setNewName('');
    setNewPartNumber('');
    setNewBarcode('');
    setNewSupplier('');
    setNewPurchasePrice(0);
    setNewSellingPrice(0);
    setNewStock(1);
    setNewMinStock(5);
    setNewCategory('Filters');
    setShowAddForm(false);
  };

  const handleAdjustStock = (id: string, amount: number) => {
    const part = parts.find((p) => p.id === id);
    if (!part) return;
    const nextStock = Math.max(0, part.stock + amount);
    onUpdatePart(id, { stock: nextStock });
  };

  const handleSimulateScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedBarcode) return;

    const matchedPart = parts.find((p) => p.barcode === scannedBarcode || p.partNumber === scannedBarcode);
    if (matchedPart) {
      // Found! Increment stock by 1 as an automatic receipt simulation
      const nextStock = matchedPart.stock + 1;
      onUpdatePart(matchedPart.id, { stock: nextStock });
      setScanResult(`FOUND: ${matchedPart.name}. Stock incremented by 1 (New Stock: ${nextStock})`);
    } else {
      setScanResult(`NOT FOUND: Barcode ${scannedBarcode} does not match any current stock items.`);
    }
    setScannedBarcode('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Spare Parts Inventory column */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Spare Parts Inventory</h2>
            <p className="text-xs text-slate-500 mt-0.5">Control automotive parts levels, update supplier catalogs, and restock.</p>
          </div>
          <button
            id="inv-newpart-btn"
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-500 active:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10 cursor-pointer whitespace-nowrap"
          >
            <Plus size={16} />
            Add Spare Part
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="inv-search-input"
            type="text"
            placeholder="Search parts by name, barcode, serial number or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-250 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
          />
        </div>

        {/* Inventory list block */}
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-mono text-[10px] uppercase">
                  <th className="p-4 font-normal">Part Details</th>
                  <th className="p-4 font-normal">Supplier</th>
                  <th className="p-4 font-normal text-right">Cost (Rs.)</th>
                  <th className="p-4 font-normal text-right">Selling (Rs.)</th>
                  <th className="p-4 font-normal text-center">Stock Level</th>
                  <th className="p-4 font-normal text-center">Adjust</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredParts.map((part) => {
                  const isLow = part.stock <= part.minStock;
                  return (
                    <tr key={part.id} className="hover:bg-slate-50/20 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                          {part.name}
                          {isLow && (
                            <span className="bg-rose-50 border border-rose-200 text-rose-700 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider flex items-center gap-0.5 animate-pulse">
                              <AlertCircle size={10} /> Low Stock
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5 flex gap-2">
                          <span>PN: {part.partNumber}</span>
                          <span>•</span>
                          <span>Barcode: {part.barcode}</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-600">{part.supplier}</td>
                      <td className="p-4 text-right text-slate-500">Rs. {part.purchasePrice.toLocaleString()}</td>
                      <td className="p-4 text-right font-bold text-slate-700">Rs. {part.sellingPrice.toLocaleString()}</td>
                      <td className="p-4 text-center">
                        <span
                          className={`font-mono font-bold text-xs inline-block px-2.5 py-0.5 rounded-full border ${
                            isLow
                              ? 'bg-rose-50 border-rose-200 text-rose-700'
                              : 'bg-emerald-50 border-emerald-250 text-emerald-700'
                          }`}
                        >
                          {part.stock} / {part.minStock}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            id={`add-stock-btn-${part.id}`}
                            onClick={() => handleAdjustStock(part.id, 1)}
                            className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Restock +1"
                          >
                            <PlusCircle size={16} />
                          </button>
                          <button
                            id={`deduct-stock-btn-${part.id}`}
                            onClick={() => handleAdjustStock(part.id, -1)}
                            disabled={part.stock <= 0}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-30"
                            title="Deduct -1"
                          >
                            <MinusCircle size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Barcode scan simulator & Form column */}
      <div className="space-y-4">
        {/* Barcode scanner simulator */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
            <ScanLine className="text-blue-500" size={18} />
            <h3 className="font-bold text-sm text-slate-800">Barcode Scanning Simulator</h3>
          </div>

          <p className="text-[11px] text-slate-500 leading-normal">
            Automate stock updates! Scan an item's barcode or enter its Part Number below to simulate a laser scanner registering stock receipt.
          </p>

          <form id="barcode-scan-form" onSubmit={handleSimulateScan} className="flex gap-1">
            <input
              id="scanned-barcode-input"
              type="text"
              placeholder="Enter barcode or part number (e.g. TOY-15601)..."
              value={scannedBarcode}
              onChange={(e) => setScannedBarcode(e.target.value)}
              className="flex-1 bg-white border border-slate-200 rounded-xl py-2 px-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
            />
            <button
              type="submit"
              id="simulate-scan-btn"
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3 rounded-xl cursor-pointer"
            >
              Scan Laser
            </button>
          </form>

          {scanResult && (
            <div className={`p-3 rounded-xl border text-[11px] font-medium ${
              scanResult.startsWith('FOUND') ? 'bg-emerald-50 border-emerald-150 text-emerald-800' : 'bg-rose-50 border-rose-150 text-rose-800'
            }`}>
              {scanResult}
            </div>
          )}

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-mono block mb-1">Quick copy barcode template:</span>
            <div className="space-y-1.5 text-[10px] font-mono text-slate-600">
              <p className="flex justify-between">
                <span>Aqua Oil Filter:</span>
                <code className="bg-white border px-1 rounded text-slate-800 select-all">8801234560012</code>
              </p>
              <p className="flex justify-between">
                <span>Mobil 1 Oil (4L):</span>
                <code className="bg-white border px-1 rounded text-slate-800 select-all">4902345670023</code>
              </p>
            </div>
          </div>
        </div>

        {/* Add Part Form */}
        {showAddForm && (
          <form id="part-add-form" onSubmit={handleCreatePart} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm">Add New Spare Part</h3>
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
                <label className="block text-xs font-semibold text-slate-500 mb-1">Spare Part Name *</label>
                <input
                  id="new-part-name"
                  type="text"
                  required
                  placeholder="e.g. Suzuki Wagon R AC Cabin Filter"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Part Number (SKU) *</label>
                  <input
                    id="new-part-sku"
                    type="text"
                    required
                    placeholder="e.g. SG-AC-WAGONR"
                    value={newPartNumber}
                    onChange={(e) => setNewPartNumber(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Barcode (EAN-13)</label>
                  <input
                    id="new-part-barcode"
                    type="text"
                    placeholder="Auto-generated if empty"
                    value={newBarcode}
                    onChange={(e) => setNewBarcode(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Category *</label>
                  <select
                    id="new-part-category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                  >
                    <option value="Filters">Filters</option>
                    <option value="Lubricants">Lubricants</option>
                    <option value="Brakes">Brakes</option>
                    <option value="Suspension">Suspension</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Engine Parts">Engine Parts</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Supplier Supplier *</label>
                  <input
                    id="new-part-supplier"
                    type="text"
                    required
                    placeholder="e.g. Ranjith Motors"
                    value={newSupplier}
                    onChange={(e) => setNewSupplier(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Purchase Cost (Rs.) *</label>
                  <input
                    id="new-part-purchase"
                    type="number"
                    required
                    value={newPurchasePrice}
                    onChange={(e) => setNewPurchasePrice(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Selling Retail (Rs.) *</label>
                  <input
                    id="new-part-selling"
                    type="number"
                    required
                    value={newSellingPrice}
                    onChange={(e) => setNewSellingPrice(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Initial Stock *</label>
                  <input
                    id="new-part-stock"
                    type="number"
                    required
                    value={newStock}
                    onChange={(e) => setNewStock(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Min Threshold Alert *</label>
                  <input
                    id="new-part-minstock"
                    type="number"
                    required
                    value={newMinStock}
                    onChange={(e) => setNewMinStock(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                type="submit"
                id="submit-part-btn"
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-md cursor-pointer text-center"
              >
                Save Spare Part
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

        {!showAddForm && (
          <div className="bg-slate-50 border border-slate-100/80 rounded-2xl p-6 text-center text-slate-400 text-xs py-16">
            Click "Add Spare Part" to register new vendor items, or restock items directly in the table list view.
          </div>
        )}
      </div>
    </div>
  );
}
