/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, Plus, Receipt, User, Car, FileText, Printer, Copy, Share2, Check, X, Tag, DollarSign, ExternalLink } from 'lucide-react';
import { Invoice, Customer, Vehicle, ServiceTemplate, Part, JobCard } from '../types';

interface InvoiceModuleProps {
  invoices: Invoice[];
  customers: Customer[];
  vehicles: Vehicle[];
  templates: ServiceTemplate[];
  parts: Part[];
  jobCards: JobCard[];
  onAddInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNo' | 'createdAt'>) => void;
  onUpdateInvoice: (id: string, invoice: Partial<Invoice>) => void;
  activePrepopulatedJob: JobCard | null;
  clearPrepopulatedJob: () => void;
}

export default function InvoiceModule({
  invoices,
  customers,
  vehicles,
  templates,
  parts,
  jobCards,
  onAddInvoice,
  onUpdateInvoice,
  activePrepopulatedJob,
  clearPrepopulatedJob,
}: InvoiceModuleProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  // New Invoice Form State
  const [invoiceCustomerId, setInvoiceCustomerId] = useState('');
  const [invoiceVehicleId, setInvoiceVehicleId] = useState('');
  const [selectedServiceList, setSelectedServiceList] = useState<{ name: string; price: number }[]>([]);
  const [selectedPartList, setSelectedPartList] = useState<{ partId: string; name: string; qty: number; price: number }[]>([]);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [notes, setNotes] = useState('');
  const [isPaid, setIsPaid] = useState(true);

  // Direct addition builders
  const [tempServiceId, setTempServiceId] = useState('');
  const [tempPartId, setTempPartId] = useState('');
  const [tempPartQty, setTempPartQty] = useState(1);

  // Load Prepulated Job Card
  useEffect(() => {
    if (activePrepopulatedJob) {
      setInvoiceCustomerId(activePrepopulatedJob.customerId);
      setInvoiceVehicleId(activePrepopulatedJob.vehicleId);

      // Map services
      const mappedServices: { name: string; price: number }[] = [];
      activePrepopulatedJob.serviceIds.forEach((sid) => {
        const s = templates.find((t) => t.id === sid);
        if (s) mappedServices.push({ name: s.name, price: s.defaultPrice });
      });
      activePrepopulatedJob.customServices.forEach((cs) => mappedServices.push(cs));
      setSelectedServiceList(mappedServices);

      // Map parts
      const mappedParts = activePrepopulatedJob.itemsNeeded.map((item) => ({
        partId: item.partId,
        name: item.name,
        qty: item.qty,
        price: item.price,
      }));
      setSelectedPartList(mappedParts);

      setNotes(`Generated automatically from job card ${activePrepopulatedJob.jobNo}.`);
      setShowAddForm(true);
    }
  }, [activePrepopulatedJob, templates]);

  // Filters
  const filteredInvoices = invoices.filter((inv) => {
    const q = searchQuery.toLowerCase();
    const cust = customers.find((c) => c.id === inv.customerId);
    const veh = vehicles.find((v) => v.id === inv.vehicleId);
    return (
      inv.invoiceNo.toLowerCase().includes(q) ||
      (cust && cust.name.toLowerCase().includes(q)) ||
      (veh && veh.registration.toLowerCase().includes(q))
    );
  });

  const selectedInvoice = invoices.find((i) => i.id === selectedInvoiceId);

  // Math totals for creation
  const subtotalServices = selectedServiceList.reduce((sum, s) => sum + s.price, 0);
  const subtotalParts = selectedPartList.reduce((sum, p) => sum + p.price * p.qty, 0);
  const rawSubtotal = subtotalServices + subtotalParts;
  const computedTotal = Math.max(0, rawSubtotal - Number(discount) + Number(tax));

  const handleAddDirectService = () => {
    if (!tempServiceId) return;
    const s = templates.find((t) => t.id === tempServiceId);
    if (s) {
      setSelectedServiceList([...selectedServiceList, { name: s.name, price: s.defaultPrice }]);
    }
    setTempServiceId('');
  };

  const handleAddDirectPart = () => {
    if (!tempPartId || tempPartQty <= 0) return;
    const p = parts.find((part) => part.id === tempPartId);
    if (p) {
      const existing = selectedPartList.find((item) => item.partId === tempPartId);
      if (existing) {
        setSelectedPartList(
          selectedPartList.map((item) =>
            item.partId === tempPartId ? { ...item, qty: item.qty + Number(tempPartQty) } : item
          )
        );
      } else {
        setSelectedPartList([
          ...selectedPartList,
          { partId: tempPartId, name: p.name, qty: Number(tempPartQty), price: p.sellingPrice },
        ]);
      }
    }
    setTempPartId('');
    setTempPartQty(1);
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceCustomerId || !invoiceVehicleId) return;

    onAddInvoice({
      jobCardId: activePrepopulatedJob?.id,
      customerId: invoiceCustomerId,
      vehicleId: invoiceVehicleId,
      services: selectedServiceList,
      parts: selectedPartList,
      discount: Number(discount),
      tax: Number(tax),
      total: computedTotal,
      paid: isPaid,
      notes,
      status: isPaid ? 'paid' : 'pending',
    });

    // Reset Form
    setInvoiceCustomerId('');
    setInvoiceVehicleId('');
    setSelectedServiceList([]);
    setSelectedPartList([]);
    setDiscount(0);
    setTax(0);
    setNotes('');
    setIsPaid(true);
    setShowAddForm(false);
    clearPrepopulatedJob();
  };

  const handleDuplicateInvoice = (inv: Invoice) => {
    setInvoiceCustomerId(inv.customerId);
    setInvoiceVehicleId(inv.vehicleId);
    setSelectedServiceList([...inv.services]);
    setSelectedPartList([...inv.parts]);
    setDiscount(inv.discount);
    setTax(inv.tax);
    setNotes(`Duplicate copy of ${inv.invoiceNo}. ` + inv.notes);
    setIsPaid(inv.paid);
    setShowAddForm(true);
    setSelectedInvoiceId(null);
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 500);
  };

  const getWhatsAppLink = (inv: Invoice) => {
    const cust = customers.find((c) => c.id === inv.customerId);
    const veh = vehicles.find((v) => v.id === inv.vehicleId);
    const phone = cust ? cust.phone.replace(/^0/, '94') : ''; // Sri Lankan prefix
    const message = encodeURIComponent(
      `Hello ${cust ? cust.name : 'Customer'},\nYour vehicle ${veh ? `${veh.make} ${veh.model} (${veh.registration})` : ''} invoice ${inv.invoiceNo} is ready.\nTotal amount: Rs. ${inv.total.toLocaleString()}.\nStatus: ${inv.status.toUpperCase()}.\nThank you!\n- TS Workshop Manager`
    );
    return `https://wa.me/${phone}?text=${message}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Invoice Records Column */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Billing & Invoices</h2>
            <p className="text-xs text-slate-500 mt-0.5">Generate direct cash bills, counter invoices, or print reports.</p>
          </div>
          <button
            id="inv-add-btn"
            onClick={() => {
              clearPrepopulatedJob();
              setShowAddForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-500 active:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10 cursor-pointer whitespace-nowrap"
          >
            <Plus size={16} />
            Create Invoice
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="inv-search-input"
            type="text"
            placeholder="Search by Invoice No, Customer name, or Vehicle Plate..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-250 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
          />
        </div>

        {/* Invoice List */}
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="divide-y divide-slate-50">
            {filteredInvoices.map((inv) => {
              const cust = customers.find((c) => c.id === inv.customerId);
              const veh = vehicles.find((v) => v.id === inv.vehicleId);
              return (
                <div
                  key={inv.id}
                  id={`invoice-item-${inv.id}`}
                  onClick={() => setSelectedInvoiceId(inv.id)}
                  className={`p-4 flex items-center justify-between cursor-pointer transition-all ${
                    selectedInvoiceId === inv.id ? 'bg-blue-50/40 border-l-4 border-l-blue-600' : 'hover:bg-slate-50/60'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-800">{inv.invoiceNo}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          inv.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {inv.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <User size={12} className="text-slate-400" /> {cust ? cust.name : 'Unknown Client'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Car size={12} className="text-slate-400" /> {veh ? veh.registration : 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <strong className="text-slate-800 text-sm">Rs. {inv.total.toLocaleString()}</strong>
                      <span className="text-[10px] text-slate-400 block">{new Date(inv.createdAt).toLocaleDateString()}</span>
                    </div>
                    <button
                      id={`view-inv-btn-${inv.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedInvoiceId(inv.id);
                      }}
                      className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-lg transition-colors"
                    >
                      <FileText size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
            {filteredInvoices.length === 0 && (
              <div className="py-12 text-center text-slate-400 text-xs">
                No invoices recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invoice Detail / Printable View Column */}
      <div className="space-y-4">
        {selectedInvoice && !showAddForm && (
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-5">
            {/* Action panel */}
            <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl">
              <button
                id="invoice-print-btn"
                onClick={handlePrint}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg shadow-sm transition-all"
              >
                <Printer size={13} /> {isPrinting ? 'Spooling...' : 'Print / PDF'}
              </button>
              <button
                id="invoice-duplicate-btn"
                onClick={() => handleDuplicateInvoice(selectedInvoice)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg shadow-sm transition-all"
              >
                <Copy size={13} /> Duplicate
              </button>
              <a
                id="invoice-whatsapp-btn"
                href={getWhatsAppLink(selectedInvoice)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg shadow-sm transition-all"
              >
                <Share2 size={13} /> WhatsApp
              </a>
            </div>

            {/* Simulated Invoice Layout */}
            <div className="border border-slate-200 rounded-2xl p-6 space-y-5 font-sans relative bg-white overflow-hidden text-xs">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wide">TS Workshop Manager</h3>
                  <p className="text-[10px] text-slate-500">No. 45, Galle Road, Colombo 03, Sri Lanka</p>
                  <p className="text-[10px] text-slate-500">Phone: 011 234 5678 | owner@tsworkshop.com</p>
                </div>
                <div className="text-right">
                  <h4 className="font-bold text-base text-slate-800">INVOICE</h4>
                  <p className="text-[10px] font-semibold text-slate-600 mt-1">{selectedInvoice.invoiceNo}</p>
                  <p className="text-[10px] text-slate-400">Date: {new Date(selectedInvoice.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Bill to */}
              <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-3">
                <div>
                  <h5 className="font-bold text-slate-400 mb-1">CLIENT BILL TO:</h5>
                  <p className="font-bold text-slate-700">
                    {(() => {
                      const c = customers.find((c) => c.id === selectedInvoice.customerId);
                      return c ? c.name : 'Counter Customer';
                    })()}
                  </p>
                  <p className="text-slate-500 mt-0.5">
                    {(() => {
                      const c = customers.find((c) => c.id === selectedInvoice.customerId);
                      return c ? c.phone : '';
                    })()}
                  </p>
                </div>
                <div>
                  <h5 className="font-bold text-slate-400 mb-1">VEHICLE DETAILS:</h5>
                  <p className="font-semibold text-slate-700">
                    {(() => {
                      const v = vehicles.find((v) => v.id === selectedInvoice.vehicleId);
                      return v ? `${v.make} ${v.model}` : 'N/A';
                    })()}
                  </p>
                  <p className="font-mono bg-slate-100 text-slate-600 inline-block px-1.5 py-0.5 rounded text-[10px] font-bold mt-1">
                    {(() => {
                      const v = vehicles.find((v) => v.id === selectedInvoice.vehicleId);
                      return v ? v.registration : 'N/A';
                    })()}
                  </p>
                </div>
              </div>

              {/* Items List */}
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold text-[10px] uppercase">
                    <th className="py-1">Description</th>
                    <th className="py-1 text-center">Qty</th>
                    <th className="py-1 text-right">Price (Rs.)</th>
                    <th className="py-1 text-right">Total (Rs.)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedInvoice.services.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2">{item.name} <em className="text-[9px] text-slate-400">(service)</em></td>
                      <td className="py-2 text-center">1</td>
                      <td className="py-2 text-right">{item.price.toLocaleString()}</td>
                      <td className="py-2 text-right font-semibold text-slate-700">{item.price.toLocaleString()}</td>
                    </tr>
                  ))}
                  {selectedInvoice.parts.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2">{item.name}</td>
                      <td className="py-2 text-center">{item.qty}</td>
                      <td className="py-2 text-right">{item.price.toLocaleString()}</td>
                      <td className="py-2 text-right font-semibold text-slate-700">{(item.price * item.qty).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Math totals */}
              <div className="border-t border-slate-200 pt-3 flex flex-col items-end space-y-1 text-slate-600">
                <div className="flex justify-between w-48 text-[11px]">
                  <span>Subtotal:</span>
                  <span>Rs. {(selectedInvoice.total + selectedInvoice.discount - selectedInvoice.tax).toLocaleString()}</span>
                </div>
                {selectedInvoice.discount > 0 && (
                  <div className="flex justify-between w-48 text-[11px] text-rose-600 font-semibold">
                    <span>Discount:</span>
                    <span>- Rs. {selectedInvoice.discount.toLocaleString()}</span>
                  </div>
                )}
                {selectedInvoice.tax > 0 && (
                  <div className="flex justify-between w-48 text-[11px]">
                    <span>Tax (VAT):</span>
                    <span>+ Rs. {selectedInvoice.tax.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between w-48 border-t border-slate-200 pt-2 text-sm font-bold text-slate-800">
                  <span>Grand Total:</span>
                  <span>Rs. {selectedInvoice.total.toLocaleString()}</span>
                </div>
              </div>

              {selectedInvoice.notes && (
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[10px] text-slate-500 italic mt-3">
                  <strong>Notes:</strong> {selectedInvoice.notes}
                </div>
              )}

              {/* Stamp / Paid indicator */}
              <div className="absolute right-6 bottom-32 opacity-15 select-none transform rotate-12">
                {selectedInvoice.status === 'paid' ? (
                  <span className="border-4 border-emerald-500 rounded-xl px-4 py-2 font-black text-2xl text-emerald-500 tracking-wider">
                    PAID
                  </span>
                ) : (
                  <span className="border-4 border-rose-500 rounded-xl px-4 py-2 font-black text-2xl text-rose-500 tracking-wider">
                    PENDING
                  </span>
                )}
              </div>
            </div>

            {/* Quick action to toggle payment status if pending */}
            {selectedInvoice.status === 'pending' && (
              <button
                id="invoice-mark-paid"
                onClick={() => onUpdateInvoice(selectedInvoice.id, { status: 'paid', paid: true })}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-md cursor-pointer text-center"
              >
                Mark Invoice as Paid (Collect Cash)
              </button>
            )}
          </div>
        )}

        {/* Generate Invoice / Cash Sale Form */}
        {showAddForm && (
          <form id="invoice-add-form" onSubmit={handleCreateInvoice} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm">
                {activePrepopulatedJob ? 'Invoice for Job Card' : 'Direct Cash Sale Invoice'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  clearPrepopulatedJob();
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Select Customer */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Customer / Client *</label>
                <select
                  id="inv-cust-select"
                  required
                  value={invoiceCustomerId}
                  onChange={(e) => setInvoiceCustomerId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                  disabled={!!activePrepopulatedJob}
                >
                  <option value="">Counter Sales (Or choose Client...)</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Vehicle */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Vehicle *</label>
                <select
                  id="inv-veh-select"
                  required
                  value={invoiceVehicleId}
                  onChange={(e) => setInvoiceVehicleId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                  disabled={!!activePrepopulatedJob}
                >
                  <option value="">Select Vehicle...</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.registration} — {v.make} {v.model}
                    </option>
                  ))}
                </select>
              </div>

              {/* Services items list editor (ONLY if direct sale) */}
              {!activePrepopulatedJob && (
                <div className="space-y-1.5 pt-2 border-t border-slate-50">
                  <label className="block text-xs font-semibold text-slate-500 mb-0.5">Add Services to Invoice</label>
                  <div className="flex gap-1">
                    <select
                      value={tempServiceId}
                      onChange={(e) => setTempServiceId(e.target.value)}
                      className="flex-1 bg-white border border-slate-200 rounded-xl py-2 px-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                    >
                      <option value="">Choose standard service...</option>
                      {templates.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} (Rs. {t.defaultPrice})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleAddDirectService}
                      className="bg-blue-600 text-white px-3.5 rounded-xl font-bold hover:bg-blue-500 cursor-pointer text-center"
                    >
                      Add
                    </button>
                  </div>
                  {selectedServiceList.length > 0 && (
                    <div className="space-y-1 mt-1 border border-slate-100 p-2 rounded-xl bg-slate-50/20">
                      {selectedServiceList.map((cs, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[11px] text-slate-700">
                          <span>{cs.name} (Rs. {cs.price})</span>
                          <button
                            type="button"
                            onClick={() => setSelectedServiceList(selectedServiceList.filter((_, i) => i !== idx))}
                            className="text-rose-500 font-bold px-1"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Parts items list editor (ONLY if direct sale) */}
              {!activePrepopulatedJob && (
                <div className="space-y-1.5 pt-2 border-t border-slate-50">
                  <label className="block text-xs font-semibold text-slate-500 mb-0.5">Add Spare Parts from Stock</label>
                  <div className="flex gap-1">
                    <select
                      value={tempPartId}
                      onChange={(e) => setTempPartId(e.target.value)}
                      className="flex-1 bg-white border border-slate-200 rounded-xl py-2 px-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                    >
                      <option value="">Choose part...</option>
                      {parts.map((p) => (
                        <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                          {p.name} ({p.stock} left) — Rs. {p.sellingPrice}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={1}
                      value={tempPartQty}
                      onChange={(e) => setTempPartQty(Number(e.target.value))}
                      className="w-14 bg-white border border-slate-200 rounded-xl py-2 px-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 text-center shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={handleAddDirectPart}
                      className="bg-emerald-600 text-white px-3.5 rounded-xl font-bold hover:bg-emerald-500 cursor-pointer text-center"
                    >
                      Add
                    </button>
                  </div>
                  {selectedPartList.length > 0 && (
                    <div className="space-y-1 mt-1 border border-slate-100 p-2 rounded-xl bg-slate-50/20">
                      {selectedPartList.map((sp) => (
                        <div key={sp.partId} className="flex justify-between items-center text-[11px] text-slate-700">
                          <span>{sp.name} (Qty: {sp.qty} • Rs. {sp.price})</span>
                          <button
                            type="button"
                            onClick={() => setSelectedPartList(selectedPartList.filter((item) => item.partId !== sp.partId))}
                            className="text-rose-500 font-bold px-1"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Discounts / Tax */}
              <div className="grid grid-cols-2 gap-2 border-t border-slate-50 pt-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Discount (LKR)</label>
                  <input
                    id="new-inv-discount"
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Tax / VAT (LKR)</label>
                  <input
                    id="new-inv-tax"
                    type="number"
                    value={tax}
                    onChange={(e) => setTax(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                  />
                </div>
              </div>

              {/* Payment Status Checkbox */}
              <div className="bg-slate-50 p-2.5 border border-slate-150 rounded-xl flex items-center justify-between">
                <span className="font-semibold text-slate-600 text-xs">Invoice marked as PAID</span>
                <input
                  id="new-inv-paid"
                  type="checkbox"
                  checked={isPaid}
                  onChange={(e) => setIsPaid(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4.5 w-4.5"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Invoice Notes / Disclaimers</label>
                <textarea
                  id="new-inv-notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Paid in cash. 1 month warranty on brake disc machining."
                  className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm resize-none"
                />
              </div>

              {/* Subtotal summary display */}
              <div className="bg-slate-900 text-slate-200 p-3.5 rounded-xl text-right font-mono text-xs">
                <p className="text-slate-400">Subtotal: Rs. {rawSubtotal.toLocaleString()}</p>
                <p className="font-bold text-sm text-white mt-1">Total Bill: Rs. {computedTotal.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                type="submit"
                id="submit-inv-btn"
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-md cursor-pointer text-center"
              >
                Save & Issue Invoice
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  clearPrepopulatedJob();
                }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-2 px-3 rounded-xl cursor-pointer text-center"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {!selectedInvoiceId && !showAddForm && (
          <div className="bg-slate-50 border border-slate-100/80 rounded-2xl p-6 text-center text-slate-400 text-xs py-16">
            Click any invoice record to preview the print copy, download PDF, share via WhatsApp, duplicate, or adjust payment status.
          </div>
        )}
      </div>
    </div>
  );
}
