/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Plus, Car, User, Wrench, Shield, Calendar, Gauge, History, X, Edit, Eye } from 'lucide-react';
import { Vehicle, Customer, JobCard, Invoice } from '../types';

interface VehicleModuleProps {
  vehicles: Vehicle[];
  customers: Customer[];
  jobCards: JobCard[];
  invoices: Invoice[];
  onAddVehicle: (vehicle: Omit<Vehicle, 'id' | 'createdAt'>) => void;
  onUpdateVehicle: (id: string, vehicle: Partial<Vehicle>) => void;
}

export default function VehicleModule({
  vehicles,
  customers,
  jobCards,
  invoices,
  onAddVehicle,
  onUpdateVehicle,
}: VehicleModuleProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // New Vehicle Form State
  const [newReg, setNewReg] = useState('');
  const [newVin, setNewVin] = useState('');
  const [newMake, setNewMake] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newYear, setNewYear] = useState(new Date().getFullYear());
  const [newEngine, setNewEngine] = useState('');
  const [newMileage, setNewMileage] = useState(0);
  const [newCustId, setNewCustId] = useState('');

  // Filtering
  const filteredVehicles = vehicles.filter((v) => {
    const q = searchQuery.toLowerCase();
    return (
      v.registration.toLowerCase().includes(q) ||
      v.make.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q) ||
      v.vin.toLowerCase().includes(q)
    );
  });

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);
  const owner = selectedVehicle ? customers.find((c) => c.id === selectedVehicle.customerId) : null;

  // History lists
  const vehicleJobCards = selectedVehicleId
    ? jobCards.filter((j) => j.vehicleId === selectedVehicleId).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    : [];
  const vehicleInvoices = selectedVehicleId
    ? invoices.filter((i) => i.vehicleId === selectedVehicleId).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    : [];

  const handleCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReg || !newMake || !newModel || !newCustId) return;

    onAddVehicle({
      registration: newReg,
      vin: newVin,
      make: newMake,
      model: newModel,
      year: Number(newYear),
      engine: newEngine,
      mileage: Number(newMileage),
      customerId: newCustId,
    });

    // Reset Form
    setNewReg('');
    setNewVin('');
    setNewMake('');
    setNewModel('');
    setNewYear(new Date().getFullYear());
    setNewEngine('');
    setNewMileage(0);
    setNewCustId('');
    setShowAddForm(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle) return;
    onUpdateVehicle(editingVehicle.id, {
      registration: editingVehicle.registration,
      vin: editingVehicle.vin,
      make: editingVehicle.make,
      model: editingVehicle.model,
      year: Number(editingVehicle.year),
      engine: editingVehicle.engine,
      mileage: Number(editingVehicle.mileage),
      customerId: editingVehicle.customerId,
    });
    setEditingVehicle(null);
  };

  const statusLabels = {
    waiting: 'Waiting',
    in_progress: 'In Progress',
    completed: 'Completed',
    delivered: 'Delivered',
  };

  const statusColors = {
    waiting: 'bg-amber-100 text-amber-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-emerald-100 text-emerald-800',
    delivered: 'bg-slate-100 text-slate-800',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Vehicle List Column */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-900">Vehicle Records</h2>
          <button
            id="veh-add-btn"
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-500 active:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10 cursor-pointer"
          >
            <Plus size={16} />
            Register Vehicle
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="veh-search-input"
            type="text"
            placeholder="Search by registration (e.g. CAS-4829), make, model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-250 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
          />
        </div>

        {/* Grid or List of Vehicles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredVehicles.map((veh) => {
            const ownerCust = customers.find((c) => c.id === veh.customerId);
            return (
              <div
                key={veh.id}
                id={`vehicle-card-${veh.id}`}
                onClick={() => setSelectedVehicleId(veh.id)}
                className={`bg-white border p-4.5 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer ${
                  selectedVehicleId === veh.id ? 'border-blue-500 ring-1 ring-blue-500/20' : 'border-slate-100'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{veh.make} {veh.model}</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">{veh.year} • {veh.engine}</p>
                  </div>
                  <span className="font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-xs font-bold border border-blue-100/40">
                    {veh.registration}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-50 space-y-2 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <User size={13} className="text-slate-400" />
                    <span className="truncate">Owner: <strong className="text-slate-700">{ownerCust ? ownerCust.name : 'Unknown'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gauge size={13} className="text-slate-400" />
                    <span>Mileage: <strong className="text-slate-700">{veh.mileage.toLocaleString()} km</strong></span>
                  </div>
                </div>

                <div className="mt-4 flex justify-end gap-1.5 border-t border-slate-50 pt-2.5">
                  <button
                    id={`view-veh-history-${veh.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedVehicleId(veh.id);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    <History size={12} />
                    History
                  </button>
                  <button
                    id={`edit-veh-btn-${veh.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingVehicle({ ...veh });
                    }}
                    className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Edit size={14} />
                  </button>
                </div>
              </div>
            );
          })}
          {filteredVehicles.length === 0 && (
            <div className="py-12 text-center text-slate-400 col-span-2">
              No registered vehicles found.
            </div>
          )}
        </div>
      </div>

      {/* Vehicle Details & Timeline Column */}
      <div className="space-y-4">
        {selectedVehicle && !editingVehicle && !showAddForm && (
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-4 flex justify-between items-start">
              <div>
                <h3 className="font-bold text-slate-800 text-base">{selectedVehicle.make} {selectedVehicle.model}</h3>
                <p className="text-[10px] text-slate-400 mt-1">VIN: <span className="font-mono text-slate-600">{selectedVehicle.vin || 'N/A'}</span></p>
              </div>
              <span className="font-mono bg-blue-600 text-white px-2.5 py-1 rounded-xl text-xs font-bold">
                {selectedVehicle.registration}
              </span>
            </div>

            {/* Profile Info */}
            <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
              <div className="bg-slate-50 p-2.5 rounded-xl">
                <span className="text-slate-400 block mb-0.5">Year of Manufacture</span>
                <strong className="text-slate-700 text-sm flex items-center gap-1">
                  <Calendar size={13} className="text-slate-400" /> {selectedVehicle.year}
                </strong>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl">
                <span className="text-slate-400 block mb-0.5">Engine Code</span>
                <strong className="text-slate-700 text-sm flex items-center gap-1">
                  <Wrench size={13} className="text-slate-400" /> {selectedVehicle.engine}
                </strong>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl col-span-2">
                <span className="text-slate-400 block mb-0.5">Current Mileage</span>
                <strong className="text-slate-700 text-sm flex items-center gap-1">
                  <Gauge size={14} className="text-slate-400" /> {selectedVehicle.mileage.toLocaleString()} km
                </strong>
              </div>
            </div>

            {/* Owner Section */}
            {owner && (
              <div className="border-t border-slate-100 pt-4 space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase font-mono tracking-wider">Registered Owner</h4>
                <div className="flex items-center gap-2.5 bg-blue-50/20 border border-blue-100/30 p-3 rounded-xl">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-xs text-blue-700">
                    {owner.name.charAt(0)}
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-800">{owner.name}</h5>
                    <p className="text-[10px] text-slate-500">{owner.phone}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Repair History / Diagnostics Timeline */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase font-mono tracking-wider">Repair History Timeline</h4>
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {vehicleJobCards.map((job) => (
                  <div key={job.id} className="relative pl-4 border-l border-slate-200">
                    {/* Circle marker */}
                    <div className="absolute -left-[4.5px] top-1.5 h-2 w-2 rounded-full bg-blue-500" />
                    <div className="bg-slate-50/50 p-2.5 border border-slate-100 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700">{job.jobNo}</span>
                        <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded-md ${statusColors[job.status]}`}>
                          {statusLabels[job.status]}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">{new Date(job.createdAt).toLocaleDateString()}</p>
                      <p className="text-[11px] text-slate-600 leading-tight italic">"{job.notes}"</p>
                    </div>
                  </div>
                ))}
                {vehicleJobCards.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-4">No diagnostic history or job cards recorded yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Register Vehicle Form */}
        {showAddForm && !editingVehicle && (
          <form id="veh-add-form" onSubmit={handleCreateVehicle} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm">Register Vehicle</h3>
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
                <label className="block text-xs font-semibold text-slate-500 mb-1">Registration Plate (Sri Lanka) *</label>
                <input
                  id="new-veh-reg"
                  type="text"
                  required
                  placeholder="e.g. WP CAS-4829 or WP CAB-8851"
                  value={newReg}
                  onChange={(e) => setNewReg(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Make *</label>
                  <input
                    id="new-veh-make"
                    type="text"
                    required
                    placeholder="e.g. Toyota, Suzuki"
                    value={newMake}
                    onChange={(e) => setNewMake(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Model *</label>
                  <input
                    id="new-veh-model"
                    type="text"
                    required
                    placeholder="e.g. Aqua, Wagon R"
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Year of Manufacture</label>
                  <input
                    id="new-veh-year"
                    type="number"
                    value={newYear}
                    onChange={(e) => setNewYear(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Engine Spec</label>
                  <input
                    id="new-veh-engine"
                    type="text"
                    placeholder="e.g. 1NZ-FXE 1.5L"
                    value={newEngine}
                    onChange={(e) => setNewEngine(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Current Mileage (km)</label>
                  <input
                    id="new-veh-mileage"
                    type="number"
                    value={newMileage}
                    onChange={(e) => setNewMileage(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">VIN Number</label>
                  <input
                    id="new-veh-vin"
                    type="text"
                    placeholder="e.g. MRH53GF8..."
                    value={newVin}
                    onChange={(e) => setNewVin(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Owner Customer *</label>
                <select
                  id="new-veh-customer"
                  required
                  value={newCustId}
                  onChange={(e) => setNewCustId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                >
                  <option value="">Select Owner...</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                type="submit"
                id="submit-new-veh-btn"
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-md cursor-pointer text-center"
              >
                Register Vehicle
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

        {/* Edit Vehicle Form */}
        {editingVehicle && (
          <form id="veh-edit-form" onSubmit={handleSaveEdit} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm">Edit Vehicle Details</h3>
              <button
                type="button"
                onClick={() => setEditingVehicle(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Registration Plate *</label>
                <input
                  id="edit-veh-reg"
                  type="text"
                  required
                  value={editingVehicle.registration}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, registration: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Make *</label>
                  <input
                    id="edit-veh-make"
                    type="text"
                    required
                    value={editingVehicle.make}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, make: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Model *</label>
                  <input
                    id="edit-veh-model"
                    type="text"
                    required
                    value={editingVehicle.model}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, model: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Year of Manufacture</label>
                  <input
                    id="edit-veh-year"
                    type="number"
                    value={editingVehicle.year}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, year: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Engine Spec</label>
                  <input
                    id="edit-veh-engine"
                    type="text"
                    value={editingVehicle.engine}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, engine: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Current Mileage</label>
                  <input
                    id="edit-veh-mileage"
                    type="number"
                    value={editingVehicle.mileage}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, mileage: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">VIN Number</label>
                  <input
                    id="edit-veh-vin"
                    type="text"
                    value={editingVehicle.vin}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, vin: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Owner Customer *</label>
                <select
                  id="edit-veh-customer"
                  required
                  value={editingVehicle.customerId}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, customerId: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                type="submit"
                id="save-veh-btn"
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-md cursor-pointer text-center"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setEditingVehicle(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-2 px-3 rounded-xl cursor-pointer text-center"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {!selectedVehicleId && !showAddForm && !editingVehicle && (
          <div className="bg-slate-50 border border-slate-100/80 rounded-2xl p-6 text-center text-slate-400 text-xs py-16">
            Select any vehicle record to inspect its specifications, owner details, and complete repair histories here.
          </div>
        )}
      </div>
    </div>
  );
}
