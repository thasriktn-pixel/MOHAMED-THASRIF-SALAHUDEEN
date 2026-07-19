/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TrendingUp, TrendingDown, Landmark, ClipboardList, Car, Package, Award, Plus, ArrowUpRight, ArrowDownRight, BellRing, Sparkles } from 'lucide-react';
import { Customer, Vehicle, JobCard, Invoice, Part, AccountTransaction } from '../types';

interface DashboardProps {
  customers: Customer[];
  vehicles: Vehicle[];
  jobCards: JobCard[];
  invoices: Invoice[];
  parts: Part[];
  transactions: AccountTransaction[];
  onQuickAction: (action: string) => void;
  mechanicNames: Record<string, string>;
}

export default function Dashboard({
  customers,
  vehicles,
  jobCards,
  invoices,
  parts,
  transactions,
  onQuickAction,
  mechanicNames,
}: DashboardProps) {
  // Compute Key Metrics
  const todayStr = '2026-07-19'; // Fixed system date context

  // 1. Today's Sales
  const todaySales = invoices
    .filter((inv) => inv.createdAt.startsWith(todayStr) && inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total, 0);

  // 2. Today's Expenses
  const todayExpenses = transactions
    .filter((tx) => tx.date === todayStr && tx.type === 'cash_out' && tx.category === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  // 3. Cash Balance (Overall from transactions)
  const totalIn = transactions.filter((t) => t.type === 'cash_in').reduce((sum, t) => sum + t.amount, 0);
  const totalOut = transactions.filter((t) => t.type === 'cash_out').reduce((sum, t) => sum + t.amount, 0);
  const cashBalance = totalIn - totalOut;

  // 4. Pending Jobs
  const pendingJobs = jobCards.filter((job) => job.status === 'waiting' || job.status === 'in_progress');

  // 5. Vehicles Today
  const vehiclesTodayCount = new Set(
    jobCards.filter((job) => job.createdAt.startsWith(todayStr)).map((job) => job.vehicleId)
  ).size;

  // 6. Low Stock Items
  const lowStockItems = parts.filter((part) => part.stock <= part.minStock);

  // 7. Monthly Profit (July 2026)
  const monthSales = invoices
    .filter((inv) => inv.createdAt.startsWith('2026-07'))
    .reduce((sum, inv) => sum + inv.total, 0);
  const monthExpenses = transactions
    .filter((tx) => tx.date.startsWith('2026-07') && tx.type === 'cash_out')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const monthlyProfit = monthSales - monthExpenses;

  // Recent Activities / Jobs list
  const recentJobs = [...jobCards].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

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
    <div className="space-y-6">
      {/* Page Title & Context */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-sans text-slate-900">Workshop Dashboard</h1>
          <p className="text-sm text-slate-500">Live summary of workshop operations & finances for July 19, 2026</p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-800 px-3 py-1.5 rounded-xl text-xs font-medium">
          <Sparkles size={14} className="text-blue-600 animate-pulse" />
          Sri Lanka Standard Time
        </div>
      </div>

      {/* Overview Cards (Bento Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sales */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 font-mono tracking-wider uppercase mb-1">Today's Sales</p>
              <h3 className="text-2xl font-bold font-sans text-slate-900">Rs. {todaySales.toLocaleString()}</h3>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <ArrowUpRight size={14} />
            <span>+15.2% from yesterday</span>
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 font-mono tracking-wider uppercase mb-1">Today's Expenses</p>
              <h3 className="text-2xl font-bold font-sans text-slate-900">Rs. {todayExpenses.toLocaleString()}</h3>
            </div>
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
              <TrendingDown size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-rose-600 font-medium">
            <ArrowDownRight size={14} />
            <span>Tea, snacks, & general utilities</span>
          </div>
        </div>

        {/* Cash Balance */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 font-mono tracking-wider uppercase mb-1">Cash Balance</p>
              <h3 className="text-2xl font-bold font-sans text-slate-900">Rs. {cashBalance.toLocaleString()}</h3>
            </div>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Landmark size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs text-slate-500">
            <span className="font-mono text-slate-400">Drawer & Commercial Bank</span>
          </div>
        </div>

        {/* Monthly Profit */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 font-mono tracking-wider uppercase mb-1">Monthly Profit</p>
              <h3 className="text-2xl font-bold font-sans text-slate-900">Rs. {monthlyProfit.toLocaleString()}</h3>
            </div>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Award size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-indigo-600 font-medium">
            <TrendingUp size={14} />
            <span>Target monthly goal: 85%</span>
          </div>
        </div>
      </div>

      {/* Secondary Metrics & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions Panel */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md space-y-4">
          <h3 className="text-lg font-bold font-sans text-slate-100">Quick Operations</h3>
          <p className="text-xs text-slate-400">One-click actions to speed up your workshop workflow.</p>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              id="qa-new-job"
              onClick={() => onQuickAction('new-job')}
              className="flex flex-col items-center justify-center p-3.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-700 text-white rounded-xl border border-slate-700/50 hover:border-blue-500/50 transition-all text-center gap-2 group cursor-pointer"
            >
              <Plus size={18} className="text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold">New Job Card</span>
            </button>
            <button
              id="qa-new-invoice"
              onClick={() => onQuickAction('new-invoice')}
              className="flex flex-col items-center justify-center p-3.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-700 text-white rounded-xl border border-slate-700/50 hover:border-blue-500/50 transition-all text-center gap-2 group cursor-pointer"
            >
              <Plus size={18} className="text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold">New Invoice</span>
            </button>
            <button
              id="qa-add-customer"
              onClick={() => onQuickAction('add-customer')}
              className="flex flex-col items-center justify-center p-3.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-700 text-white rounded-xl border border-slate-700/50 hover:border-blue-500/50 transition-all text-center gap-2 group cursor-pointer"
            >
              <Plus size={18} className="text-purple-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold">Add Customer</span>
            </button>
            <button
              id="qa-ai-diagnosis"
              onClick={() => onQuickAction('ai-diagnosis')}
              className="flex flex-col items-center justify-center p-3.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all text-center gap-2 group cursor-pointer"
            >
              <Sparkles size={18} className="text-white group-hover:animate-pulse" />
              <span className="text-xs font-semibold">AI Diagnostician</span>
            </button>
          </div>
        </div>

        {/* Alert Panels */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Pending Jobs alert */}
          <div className="bg-white border border-slate-100 p-5 rounded-2xl flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">Pending Jobs</span>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <ClipboardList size={16} />
              </div>
            </div>
            <div className="my-3">
              <h4 className="text-3xl font-bold font-sans text-slate-900">{pendingJobs.length}</h4>
              <p className="text-xs text-slate-400">Waiting or in progress</p>
            </div>
            <button
              id="dash-view-jobs"
              onClick={() => onQuickAction('view-jobs')}
              className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
            >
              Manage Job Cards &rarr;
            </button>
          </div>

          {/* Vehicles Today alert */}
          <div className="bg-white border border-slate-100 p-5 rounded-2xl flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">Vehicles Today</span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Car size={16} />
              </div>
            </div>
            <div className="my-3">
              <h4 className="text-3xl font-bold font-sans text-slate-900">{vehiclesTodayCount}</h4>
              <p className="text-xs text-slate-400">Brought into workshop today</p>
            </div>
            <button
              id="dash-view-vehicles"
              onClick={() => onQuickAction('view-vehicles')}
              className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
            >
              View Repair History &rarr;
            </button>
          </div>

          {/* Low stock items alert */}
          <div className="bg-white border border-slate-100 p-5 rounded-2xl flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">Low Stock Items</span>
              <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                <Package size={16} />
              </div>
            </div>
            <div className="my-3">
              <h4 className="text-3xl font-bold font-sans text-slate-900">{lowStockItems.length}</h4>
              <p className="text-xs text-slate-400">Below minimum threshold</p>
            </div>
            <button
              id="dash-view-inventory"
              onClick={() => onQuickAction('view-inventory')}
              className="text-xs text-rose-600 font-semibold hover:underline flex items-center gap-1"
            >
              View Low Stock list &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Active Repair Queue & Critical Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Jobs Queue */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900">Active Repair Queue</h3>
            <span className="text-xs bg-slate-50 text-slate-400 font-mono">LATEST 5 CARDS</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-mono text-xs uppercase">
                  <th className="py-2.5 font-normal">Job No</th>
                  <th className="py-2.5 font-normal">Vehicle</th>
                  <th className="py-2.5 font-normal">Mechanic</th>
                  <th className="py-2.5 font-normal">Status</th>
                  <th className="py-2.5 font-normal text-right">Estimate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentJobs.map((job) => {
                  const vehObj = vehicles.find((v) => v.id === job.vehicleId);
                  const mechName = mechanicNames[job.mechanicId] || 'Unassigned';
                  return (
                    <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 font-semibold text-slate-700">{job.jobNo}</td>
                      <td className="py-3">
                        <div className="font-medium text-slate-800">
                          {vehObj ? `${vehObj.make} ${vehObj.model}` : 'Unknown Vehicle'}
                        </div>
                        <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                          {vehObj ? vehObj.registration : 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 text-slate-600">{mechName}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${statusColors[job.status]}`}>
                          {statusLabels[job.status]}
                        </span>
                      </td>
                      <td className="py-3 text-right font-semibold text-slate-800">Rs. {job.cost.toLocaleString()}</td>
                    </tr>
                  );
                })}
                {recentJobs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      No jobs created yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Watchlist */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <BellRing size={18} className="text-rose-500 animate-bounce" />
            <h3 className="font-bold text-base text-slate-900">Low Stock Watchlist</h3>
          </div>

          <div className="space-y-3">
            {lowStockItems.slice(0, 4).map((part) => (
              <div key={part.id} className="flex items-center justify-between p-3 bg-rose-50/40 border border-rose-100/60 rounded-xl">
                <div>
                  <h4 className="font-semibold text-xs text-slate-800">{part.name}</h4>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">{part.partNumber} • {part.supplier}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-rose-600 block">{part.stock} left</span>
                  <span className="text-[9px] text-slate-400">Min Stock: {part.minStock}</span>
                </div>
              </div>
            ))}
            {lowStockItems.length === 0 && (
              <div className="py-8 text-center text-slate-400 text-xs">
                All inventory items are healthy! 👍
              </div>
            )}
            {lowStockItems.length > 4 && (
              <button
                id="dash-view-all-lowstock"
                onClick={() => onQuickAction('view-inventory')}
                className="w-full text-center py-2 text-xs font-semibold text-blue-600 hover:underline border-t border-slate-100 mt-2 block"
              >
                View all {lowStockItems.length} low stock items &rarr;
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
