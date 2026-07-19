/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, Car, AlertTriangle, CheckSquare, Clipboard, Plus, RefreshCw, AlertCircle } from 'lucide-react';
import { Vehicle, Customer, ServiceTemplate, Part, User } from '../types';

interface AIRecommendationsProps {
  vehicles: Vehicle[];
  customers: Customer[];
  templates: ServiceTemplate[];
  parts: Part[];
  users: User[];
  onAddJobCardFromAI: (jobData: {
    vehicleId: string;
    customerId: string;
    mechanicId: string;
    notes: string;
    serviceIds: string[];
    customServices: { name: string; price: number }[];
    itemsNeeded: { partId: string; qty: number; name: string; price: number }[];
    cost: number;
  }) => void;
}

export default function AIRecommendations({
  vehicles,
  customers,
  templates,
  parts,
  users,
  onAddJobCardFromAI,
}: AIRecommendationsProps) {
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [complaints, setComplaints] = useState('');
  const [serviceHistory, setServiceHistory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [missingKey, setMissingKey] = useState(false);

  // Gemini Response State
  const [aiResponse, setAiResponse] = useState<{
    recommendedTemplates: string[];
    customRecommendations: { name: string; description: string; estimatedPrice: number }[];
    explanation: string;
    partsToPrepare: string[];
    diagnosticSteps: string[];
  } | null>(null);

  const [assignedMechanicId, setAssignedMechanicId] = useState('');

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);
  const mechanics = users.filter((u) => u.role === 'mechanic' || u.role === 'owner' || u.role === 'manager');

  const handleApplyQuickComplaint = (txt: string) => {
    setComplaints(txt);
  };

  const handleDiagnose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicleId) return;

    setIsLoading(true);
    setErrorMsg(null);
    setMissingKey(false);
    setAiResponse(null);

    const vehicle = vehicles.find((v) => v.id === selectedVehicleId);
    if (!vehicle) return;

    // Package request
    const availableTemplates = templates.map((t) => ({
      id: t.id,
      name: t.name,
      category: t.category,
      defaultPrice: t.defaultPrice,
    }));

    try {
      const response = await fetch('/api/gemini/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          mileage: vehicle.mileage,
          complaints,
          serviceHistory,
          availableTemplates,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.isMissingKey) {
          setMissingKey(true);
        }
        throw new Error(data.error || 'Server returned an error generating recommendations.');
      }

      setAiResponse(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An unexpected connection error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateJobFromRecommendations = () => {
    if (!selectedVehicle || !aiResponse || !assignedMechanicId) return;

    // Map template IDs
    const serviceIds = aiResponse.recommendedTemplates.filter((tid) =>
      templates.some((t) => t.id === tid)
    );

    // Map custom recommendations
    const customServices = aiResponse.customRecommendations.map((cr) => ({
      name: cr.name,
      price: cr.estimatedPrice,
    }));

    // Estimate total cost
    let estimatedCost = 0;
    serviceIds.forEach((sid) => {
      const s = templates.find((t) => t.id === sid);
      if (s) estimatedCost += s.defaultPrice;
    });
    customServices.forEach((cs) => (estimatedCost += cs.price));

    // Try to matches some spare parts
    const itemsNeeded = aiResponse.partsToPrepare.map((partName) => {
      // Look for fuzzy match in parts inventory
      const matchedPart = parts.find((p) =>
        partName.toLowerCase().includes(p.name.toLowerCase()) ||
        p.name.toLowerCase().includes(partName.toLowerCase())
      );

      if (matchedPart) {
        estimatedCost += matchedPart.sellingPrice;
        return {
          partId: matchedPart.id,
          qty: 1,
          name: matchedPart.name,
          price: matchedPart.sellingPrice,
        };
      } else {
        // Mock part ID
        const fakePrice = 4500;
        estimatedCost += fakePrice;
        return {
          partId: 'custom-part-' + Math.random().toString(36).substr(2, 5),
          qty: 1,
          name: partName,
          price: fakePrice,
        };
      }
    });

    onAddJobCardFromAI({
      vehicleId: selectedVehicle.id,
      customerId: selectedVehicle.customerId,
      mechanicId: assignedMechanicId,
      notes: `AI Recommendation Diagnosis: ${aiResponse.explanation.slice(0, 200)}...`,
      serviceIds,
      customServices,
      itemsNeeded,
      cost: estimatedCost,
    });

    alert('Successfully authorized and generated Job Card from Gemini Recommendations!');
    setAiResponse(null);
    setSelectedVehicleId('');
    setComplaints('');
    setServiceHistory('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Diagnostic request builder column */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
            <Sparkles className="text-blue-500 fill-blue-500 animate-pulse" size={18} />
            <h3 className="font-bold text-sm text-slate-800">Automotive Diagnostic AI</h3>
          </div>

          <p className="text-[11px] text-slate-500 leading-normal">
            Harness the power of Gemini 3.5 Flash to generate custom preventative packages and fault diagnosis recommendations calibrated for Sri Lankan roads.
          </p>

          <form id="ai-diagnose-form" onSubmit={handleDiagnose} className="space-y-3.5 text-xs">
            {/* Select Vehicle */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Target Vehicle *</label>
              <select
                id="ai-veh-select"
                required
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
              >
                <option value="">Select vehicle for diagnostic check...</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.registration} — {v.make} {v.model} ({v.mileage.toLocaleString()} km)
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Complaint Buttons */}
            {selectedVehicle && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">Quick Symptoms Selector:</label>
                <div className="flex flex-wrap gap-1">
                  <button
                    type="button"
                    onClick={() => handleApplyQuickComplaint('Poor fuel economy, hybrid battery warning light is on')}
                    className="bg-slate-50 hover:bg-slate-100 border text-[10px] text-slate-600 px-2 py-0.5 rounded-lg transition-colors"
                  >
                    🔋 Hybrid Alarm
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyQuickComplaint('Squeaking noises when braking from moderate speed')}
                    className="bg-slate-50 hover:bg-slate-100 border text-[10px] text-slate-600 px-2 py-0.5 rounded-lg transition-colors"
                  >
                    🛑 Brake Noise
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyQuickComplaint('AC cabin filter blocked, air conditioning blowing warm')}
                    className="bg-slate-50 hover:bg-slate-100 border text-[10px] text-slate-600 px-2 py-0.5 rounded-lg transition-colors"
                  >
                    ❄️ Warm AC
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyQuickComplaint('Engine idle vibration, high speed steering shaking')}
                    className="bg-slate-50 hover:bg-slate-100 border text-[10px] text-slate-600 px-2 py-0.5 rounded-lg transition-colors"
                  >
                    ⚙️ Vibration
                  </button>
                </div>
              </div>
            )}

            {/* Complaints */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Describe symptoms, faults or warnings</label>
              <textarea
                id="ai-complaints-input"
                rows={3}
                value={complaints}
                onChange={(e) => setComplaints(e.target.value)}
                placeholder="Describe rattling, oil leaks, hybrid fan sounds, check-engine warnings..."
                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm resize-none"
              />
            </div>

            {/* Recent service history */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Recent Service History (optional)</label>
              <textarea
                id="ai-history-input"
                rows={2}
                value={serviceHistory}
                onChange={(e) => setServiceHistory(e.target.value)}
                placeholder="Last engine oil changed at 90,000 km, brake pads changed 6 months ago..."
                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm resize-none"
              />
            </div>

            <button
              id="ai-submit-btn"
              type="submit"
              disabled={isLoading || !selectedVehicleId}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md cursor-pointer transition-opacity flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw size={13} className="animate-spin" /> Diagnosing with Gemini...
                </>
              ) : (
                <>
                  <Sparkles size={13} className="fill-white" /> Diagnose & Recommend
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Diagnostic results column */}
      <div className="lg:col-span-2 space-y-4">
        {isLoading && (
          <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm space-y-4 flex flex-col items-center justify-center min-h-[300px]">
            <RefreshCw size={36} className="text-blue-500 animate-spin" />
            <div className="space-y-1 max-w-sm">
              <h4 className="font-bold text-slate-800 text-sm">Gemini AI Engine Running Analysis</h4>
              <p className="text-xs text-slate-400">
                Cross-referencing telemetry, Sri Lankan driving statistics, available shop parts, and vehicle manual specs...
              </p>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-150 rounded-2xl p-6 shadow-sm space-y-3.5">
            <div className="flex items-start gap-2 text-rose-800 text-xs font-bold">
              <AlertCircle size={18} className="text-rose-600" />
              <div>
                <span>Diagnostic Generation Error</span>
                <p className="text-[11px] text-rose-700 font-normal mt-1">{errorMsg}</p>
              </div>
            </div>

            {missingKey && (
              <div className="bg-white border border-rose-200 rounded-xl p-3 text-[10px] text-rose-700 leading-normal">
                <strong>No API Key Configured:</strong> The system is currently running on the server container. Please register your <code>GEMINI_API_KEY</code> securely under the Settings panel in the AI Studio environment so standard queries can authenticate.
              </div>
            )}
          </div>
        )}

        {aiResponse && !isLoading && (
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4 flex justify-between items-start">
              <div>
                <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wide">
                  GEMINI 3.5 DIAGNOSIS REPORT
                </span>
                <h3 className="font-bold text-slate-800 text-base mt-2">
                  Recommended Plan: {selectedVehicle ? `${selectedVehicle.make} ${selectedVehicle.model}` : 'Target Car'}
                </h3>
              </div>
              <Sparkles className="text-amber-500 fill-amber-400" size={20} />
            </div>

            {/* Explanation box */}
            <div className="space-y-1.5 text-xs text-slate-700">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-blue-600">
                <Clipboard size={14} /> Master Diagnosis Summary
              </h4>
              <p className="leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 italic">
                "{aiResponse.explanation}"
              </p>
            </div>

            {/* Diagnostic Steps & Tests */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-indigo-600">
                  <CheckSquare size={14} /> Required Diagnostic Tests
                </h4>
                <ul className="space-y-1.5 pl-1.5">
                  {aiResponse.diagnosticSteps.map((step, idx) => (
                    <li key={idx} className="flex gap-2 text-[11px] text-slate-600 items-start">
                      <span className="text-indigo-600 font-bold font-mono">{idx + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-amber-600">
                  <AlertTriangle size={14} /> Spare Parts Required
                </h4>
                <ul className="space-y-1.5 pl-1.5">
                  {aiResponse.partsToPrepare.map((part, idx) => (
                    <li key={idx} className="flex gap-2 text-[11px] text-slate-600 items-start">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{part}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Authorized recommended items */}
            <div className="space-y-2.5 pt-4 border-t border-slate-100">
              <h4 className="font-bold text-slate-800 text-xs">Recommended Repair Tasks (Standard & Custom)</h4>
              <div className="space-y-1.5">
                {aiResponse.recommendedTemplates.map((tid) => {
                  const s = templates.find((t) => t.id === tid);
                  return s ? (
                    <div key={tid} className="flex justify-between items-center text-xs p-2.5 bg-indigo-50/10 border border-indigo-100 rounded-xl">
                      <div>
                        <span className="font-bold text-indigo-800">{s.name}</span>
                        <p className="text-[10px] text-slate-400 mt-0.5">{s.description}</p>
                      </div>
                      <strong className="text-slate-700">Rs. {s.defaultPrice.toLocaleString()}</strong>
                    </div>
                  ) : null;
                })}

                {aiResponse.customRecommendations.map((cr, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <div>
                      <span className="font-bold text-slate-800">{cr.name} <em className="text-[9px] text-slate-400 font-normal">(AI custom)</em></span>
                      <p className="text-[10px] text-slate-400 mt-0.5">{cr.description}</p>
                    </div>
                    <strong className="text-slate-700">Rs. {cr.estimatedPrice.toLocaleString()}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Form to Apply recommendations to a Job Card */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 mb-1">Assign Repair Mechanic:</label>
                <select
                  id="ai-assign-mech"
                  required
                  value={assignedMechanicId}
                  onChange={(e) => setAssignedMechanicId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-1.5 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                >
                  <option value="">Select workshop staff...</option>
                  {mechanics.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>

              <button
                id="ai-apply-btn"
                onClick={handleCreateJobFromRecommendations}
                disabled={!assignedMechanicId}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md cursor-pointer text-center disabled:opacity-40"
              >
                Create Job Card
              </button>
            </div>
          </div>
        )}

        {!aiResponse && !isLoading && !errorMsg && (
          <div className="bg-slate-50 border border-slate-100/80 rounded-2xl p-12 text-center text-slate-400 text-xs py-24">
            Choose a target vehicle and symptoms, then click "Diagnose & Recommend" to fetch precision repair steps and preventative suggestions from Gemini.
          </div>
        )}
      </div>
    </div>
  );
}
