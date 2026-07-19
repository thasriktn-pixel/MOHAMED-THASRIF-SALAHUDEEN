/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Plus, ClipboardList, User, Car, Clock, CheckCircle2, Wrench, Package, X, Edit2, Play, AlertCircle } from 'lucide-react';
import { JobCard, Vehicle, Customer, ServiceTemplate, Part, User as UserType } from '../types';

interface JobCardsProps {
  jobCards: JobCard[];
  vehicles: Vehicle[];
  customers: Customer[];
  templates: ServiceTemplate[];
  parts: Part[];
  users: UserType[];
  onAddJobCard: (job: Omit<JobCard, 'id' | 'jobNo' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateJobCard: (id: string, job: Partial<JobCard>) => void;
  onGenerateInvoiceFromJob: (job: JobCard) => void;
}

export default function JobCards({
  jobCards,
  vehicles,
  customers,
  templates,
  parts,
  users,
  onAddJobCard,
  onUpdateJobCard,
  onGenerateInvoiceFromJob,
}: JobCardsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // New Job Card Form State
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedMechanicId, setSelectedMechanicId] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [customServices, setCustomServices] = useState<{ name: string; price: number }[]>([]);
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState('');

  // Selected Parts
  const [selectedParts, setSelectedParts] = useState<{ partId: string; qty: number }[]>([]);
  const [tempPartId, setTempPartId] = useState('');
  const [tempPartQty, setTempPartQty] = useState(1);

  // Filter mechanics
  const mechanics = users.filter((u) => u.role === 'mechanic' || u.role === 'owner' || u.role === 'manager');

  // Filtered Job Cards
  const filteredJobs = jobCards.filter((job) => {
    const q = searchQuery.toLowerCase();
    const veh = vehicles.find((v) => v.id === job.vehicleId);
    const cust = customers.find((c) => c.id === job.customerId);
    return (
      job.jobNo.toLowerCase().includes(q) ||
      (veh && veh.registration.toLowerCase().includes(q)) ||
      (cust && cust.name.toLowerCase().includes(q))
    );
  });

  const selectedJob = jobCards.find((j) => j.id === selectedJobId);

  const handleAddCustomService = () => {
    if (!customName || !customPrice) return;
    setCustomServices([...customServices, { name: customName, price: Number(customPrice) }]);
    setCustomName('');
    setCustomPrice('');
  };

  const handleRemoveCustomService = (index: number) => {
    setCustomServices(customServices.filter((_, i) => i !== index));
  };

  const handleAddPart = () => {
    if (!tempPartId || tempPartQty <= 0) return;
    const existing = selectedParts.find((p) => p.partId === tempPartId);
    if (existing) {
      setSelectedParts(
        selectedParts.map((p) => (p.partId === tempPartId ? { ...p, qty: p.qty + Number(tempPartQty) } : p))
      );
    } else {
      setSelectedParts([...selectedParts, { partId: tempPartId, qty: Number(tempPartQty) }]);
    }
    setTempPartId('');
    setTempPartQty(1);
  };

  const handleRemovePart = (partId: string) => {
    setSelectedParts(selectedParts.filter((p) => p.partId !== partId));
  };

  const handleCreateJobCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicleId || !selectedMechanicId) return;

    const veh = vehicles.find((v) => v.id === selectedVehicleId);
    if (!veh) return;

    // Calculate total cost estimate
    let totalCost = 0;
    // Add selected templates
    selectedServices.forEach((sid) => {
      const s = templates.find((t) => t.id === sid);
      if (s) totalCost += s.defaultPrice;
    });
    // Add custom services
    customServices.forEach((cs) => (totalCost += cs.price));
    // Add parts
    const itemsNeeded = selectedParts.map((sp) => {
      const p = parts.find((part) => part.id === sp.partId);
      const price = p ? p.sellingPrice : 0;
      const name = p ? p.name : 'Unknown';
      totalCost += price * sp.qty;
      return { partId: sp.partId, qty: sp.qty, name, price };
    });

    onAddJobCard({
      vehicleId: selectedVehicleId,
      customerId: veh.customerId,
      mechanicId: selectedMechanicId,
      status: 'waiting',
      notes,
      serviceIds: selectedServices,
      customServices,
      itemsNeeded,
      cost: totalCost,
    });

    // Reset fields
    setSelectedVehicleId('');
    setSelectedMechanicId('');
    setNotes('');
    setSelectedServices([]);
    setCustomServices([]);
    setSelectedParts([]);
    setShowAddForm(false);
  };

  const handleUpdateStatus = (jobId: string, newStatus: any) => {
    onUpdateJobCard(jobId, { status: newStatus });
  };

  const statusColors = {
    waiting: 'bg-amber-50 text-amber-700 border-amber-200',
    in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    delivered: 'bg-slate-50 text-slate-700 border-slate-200',
  };

  const statusLabels = {
    waiting: 'Waiting',
    in_progress: 'In Progress',
    completed: 'Completed',
    delivered: 'Delivered',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Job Cards Column */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex flex-col sm:flex-row items-slate-800 justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Job Cards & Diagnostics</h2>
            <p className="text-xs text-slate-500 mt-0.5">Approve, update, and manage repairs & diagnostics.</p>
          </div>
          <button
            id="job-add-btn"
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-500 active:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10 cursor-pointer whitespace-nowrap"
          >
            <Plus size={16} />
            Create Job Card
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="job-search-input"
            type="text"
            placeholder="Search by Job No, Registration plate, or Customer Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-250 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
          />
        </div>

        {/* Job Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredJobs.map((job) => {
            const veh = vehicles.find((v) => v.id === job.vehicleId);
            const cust = customers.find((c) => c.id === job.customerId);
            const mech = users.find((u) => u.id === job.mechanicId);
            return (
              <div
                key={job.id}
                id={`job-card-item-${job.id}`}
                onClick={() => setSelectedJobId(job.id)}
                className={`bg-white border rounded-2xl p-4.5 shadow-sm hover:shadow-md transition-all cursor-pointer ${
                  selectedJobId === job.id ? 'border-blue-500 ring-1 ring-blue-500/20' : 'border-slate-100'
                }`}
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold font-mono text-slate-400">{job.jobNo}</span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${statusColors[job.status]}`}>
                    {statusLabels[job.status]}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-slate-800">
                    {veh ? `${veh.make} ${veh.model}` : 'Unknown Vehicle'}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-mono font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px]">
                      {veh ? veh.registration : 'N/A'}
                    </span>
                    <span>• {cust ? cust.name : 'Unknown Owner'}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-50 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Assigned: <strong className="text-slate-600">{mech ? mech.name : 'Unassigned'}</strong></span>
                  <span className="font-bold text-slate-800">Rs. {job.cost.toLocaleString()}</span>
                </div>

                <div className="mt-3.5 border-t border-slate-50 pt-2.5 flex justify-end gap-1.5">
                  {job.status === 'waiting' && (
                    <button
                      id={`job-start-btn-${job.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateStatus(job.id, 'in_progress');
                      }}
                      className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg font-bold text-[10px] transition-all"
                    >
                      <Play size={10} className="fill-blue-700" /> Start Job
                    </button>
                  )}
                  {job.status === 'in_progress' && (
                    <button
                      id={`job-complete-btn-${job.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateStatus(job.id, 'completed');
                      }}
                      className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg font-bold text-[10px] transition-all"
                    >
                      <CheckCircle2 size={10} /> Complete
                    </button>
                  )}
                  {job.status === 'completed' && (
                    <button
                      id={`job-invoice-btn-${job.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onGenerateInvoiceFromJob(job);
                      }}
                      className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 rounded-lg font-bold text-[10px] transition-all"
                    >
                      Generate Invoice
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {filteredJobs.length === 0 && (
            <div className="py-12 text-center text-slate-400 col-span-2">
              No diagnostic job cards recorded.
            </div>
          )}
        </div>
      </div>

      {/* Inspect Job Card Detail Column */}
      <div className="space-y-4">
        {selectedJob && !showAddForm && (
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm text-slate-800">{selectedJob.jobNo}</h3>
                <span className="text-[10px] text-slate-400 font-mono">Date: {new Date(selectedJob.createdAt).toLocaleDateString()}</span>
              </div>
              <span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${statusColors[selectedJob.status]}`}>
                {statusLabels[selectedJob.status]}
              </span>
            </div>

            {/* Vehicle & Client */}
            <div className="space-y-2.5 text-xs text-slate-600 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Car size={14} className="text-slate-400" /> Vehicle:</span>
                <strong className="text-slate-800">
                  {(() => {
                    const v = vehicles.find((v) => v.id === selectedJob.vehicleId);
                    return v ? `${v.make} ${v.model} (${v.registration})` : 'Unknown';
                  })()}
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5"><User size={14} className="text-slate-400" /> Client:</span>
                <strong className="text-slate-800">
                  {(() => {
                    const c = customers.find((c) => c.id === selectedJob.customerId);
                    return c ? `${c.name} (${c.phone})` : 'Unknown';
                  })()}
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Wrench size={14} className="text-slate-400" /> Mechanic:</span>
                <strong className="text-slate-800">
                  {(() => {
                    const m = users.find((u) => u.id === selectedJob.mechanicId);
                    return m ? m.name : 'Unassigned';
                  })()}
                </strong>
              </div>
            </div>

            {/* Selected standard services & custom services */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase font-mono tracking-wider">Services Detailed</h4>
              <div className="space-y-1.5 text-xs">
                {selectedJob.serviceIds.map((sid) => {
                  const s = templates.find((t) => t.id === sid);
                  return s ? (
                    <div key={sid} className="flex justify-between p-2 bg-slate-50/20 border border-slate-100 rounded-xl">
                      <span>{s.name}</span>
                      <strong className="text-slate-700">Rs. {s.defaultPrice.toLocaleString()}</strong>
                    </div>
                  ) : null;
                })}
                {selectedJob.customServices.map((cs, i) => (
                  <div key={i} className="flex justify-between p-2 bg-slate-50/20 border border-slate-100 rounded-xl">
                    <span>{cs.name} <em className="text-[10px] text-slate-400">(custom)</em></span>
                    <strong className="text-slate-700">Rs. {cs.price.toLocaleString()}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Spare Parts Detailed */}
            {selectedJob.itemsNeeded.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase font-mono tracking-wider">Spare Parts Reserved</h4>
                <div className="space-y-1.5 text-xs">
                  {selectedJob.itemsNeeded.map((item, i) => (
                    <div key={i} className="flex justify-between p-2 bg-slate-50/20 border border-slate-100 rounded-xl items-center">
                      <div>
                        <span>{item.name}</span>
                        <span className="text-[10px] text-slate-400 block">Rs. {item.price.toLocaleString()} x {item.qty}</span>
                      </div>
                      <strong className="text-slate-700">Rs. {(item.price * item.qty).toLocaleString()}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {selectedJob.notes && (
              <div className="bg-blue-50/30 border border-blue-100/50 p-3 rounded-xl text-xs text-slate-700">
                <span className="font-semibold block font-mono text-slate-500 mb-0.5">Complaint/Observations:</span>
                <p className="italic">"{selectedJob.notes}"</p>
              </div>
            )}

            {/* Total Estimate */}
            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-500">Total Diagnostic Cost:</span>
              <strong className="text-base font-bold text-slate-800">Rs. {selectedJob.cost.toLocaleString()}</strong>
            </div>

            {/* Workflow Control */}
            <div className="pt-2 flex gap-1.5">
              {selectedJob.status === 'waiting' && (
                <button
                  id="job-start-action-btn"
                  onClick={() => handleUpdateStatus(selectedJob.id, 'in_progress')}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-md cursor-pointer text-center"
                >
                  Authorize & Start Work
                </button>
              )}
              {selectedJob.status === 'in_progress' && (
                <button
                  id="job-complete-action-btn"
                  onClick={() => handleUpdateStatus(selectedJob.id, 'completed')}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-md cursor-pointer text-center"
                >
                  Mark Work Completed
                </button>
              )}
              {selectedJob.status === 'completed' && (
                <button
                  id="job-invoice-action-btn"
                  onClick={() => onGenerateInvoiceFromJob(selectedJob)}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-md cursor-pointer text-center"
                >
                  Generate Invoice
                </button>
              )}
              {selectedJob.status === 'delivered' && (
                <div className="flex-1 bg-slate-100 text-slate-500 font-semibold text-center text-xs py-2 rounded-xl border border-slate-200">
                  Vehicle Delivered to Client
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create Job Card Form */}
        {showAddForm && (
          <form id="job-add-form" onSubmit={handleCreateJobCard} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm">Create Job Card</h3>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Vehicle Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Select Vehicle *</label>
                <select
                  id="job-veh-select"
                  required
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                >
                  <option value="">Choose Vehicle...</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.registration} — {v.make} {v.model}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mechanic Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Assign Mechanic *</label>
                <select
                  id="job-mech-select"
                  required
                  value={selectedMechanicId}
                  onChange={(e) => setSelectedMechanicId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                >
                  <option value="">Select Mechanic...</option>
                  {mechanics.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Standard templates checkboxes */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Select Standard Services</label>
                <div className="space-y-1.5 max-h-32 overflow-y-auto border border-slate-100 rounded-xl p-2.5">
                  {templates.map((s) => (
                    <label key={s.id} className="flex items-center gap-2 cursor-pointer py-0.5">
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(s.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedServices([...selectedServices, s.id]);
                          } else {
                            setSelectedServices(selectedServices.filter((id) => id !== s.id));
                          }
                        }}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs text-slate-700">{s.name} (Rs. {s.defaultPrice})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Custom Services builder */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-500 mb-0.5">Add Custom Task</label>
                <div className="flex gap-1">
                  <input
                    type="text"
                    placeholder="Task name (e.g. Engine flush)"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-xl py-2 px-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                  />
                  <input
                    type="number"
                    placeholder="Price (LKR)"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    className="w-24 bg-white border border-slate-200 rounded-xl py-2 px-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomService}
                    className="bg-blue-600 text-white px-3.5 rounded-xl font-bold hover:bg-blue-500 cursor-pointer text-center"
                  >
                    Add
                  </button>
                </div>
                {customServices.length > 0 && (
                  <div className="space-y-1 mt-1 border border-slate-100/60 p-2 rounded-xl bg-slate-50/20">
                    {customServices.map((cs, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[11px] text-slate-700">
                        <span>{cs.name} (Rs. {cs.price})</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomService(idx)}
                          className="text-rose-500 hover:scale-110 font-bold px-1"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Spare Parts Builder */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-500 mb-0.5">Reserve Inventory Spare Parts</label>
                <div className="flex gap-1">
                  <select
                    value={tempPartId}
                    onChange={(e) => setTempPartId(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-xl py-2 px-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                  >
                    <option value="">Choose spare part...</option>
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
                    className="w-16 bg-white border border-slate-200 rounded-xl py-2 px-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm text-center"
                  />
                  <button
                    type="button"
                    onClick={handleAddPart}
                    className="bg-emerald-600 text-white px-3.5 rounded-xl font-bold hover:bg-emerald-500 cursor-pointer text-center"
                  >
                    Add
                  </button>
                </div>
                {selectedParts.length > 0 && (
                  <div className="space-y-1 mt-1 border border-slate-100/60 p-2 rounded-xl bg-slate-50/20">
                    {selectedParts.map((sp) => {
                      const p = parts.find((part) => part.id === sp.partId);
                      return p ? (
                        <div key={sp.partId} className="flex justify-between items-center text-[11px] text-slate-700">
                          <span>{p.name} (Qty: {sp.qty})</span>
                          <button
                            type="button"
                            onClick={() => handleRemovePart(sp.partId)}
                            className="text-rose-500 hover:scale-110 font-bold px-1"
                          >
                            ✕
                          </button>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Diagnostic complaint observations / notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. customer complains of high-speed vibration..."
                  className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                type="submit"
                id="submit-job-btn"
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-md cursor-pointer text-center"
              >
                Create Job Card
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

        {!selectedJobId && !showAddForm && (
          <div className="bg-slate-50 border border-slate-100/80 rounded-2xl p-6 text-center text-slate-400 text-xs py-16">
            Click any active Job Card to inspect diagnostic templates, assign mechanics, manage parts, and transition states.
          </div>
        )}
      </div>
    </div>
  );
}
