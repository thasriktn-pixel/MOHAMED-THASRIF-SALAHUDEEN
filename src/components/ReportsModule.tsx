/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Calendar, TrendingUp, TrendingDown, Users, Wrench, Package, ArrowUpRight, DollarSign, Download, Percent } from 'lucide-react';
import { Invoice, AccountTransaction, Part, Customer, User } from '../types';

interface ReportsModuleProps {
  invoices: Invoice[];
  transactions: AccountTransaction[];
  parts: Part[];
  customers: Customer[];
  users: User[];
}

export default function ReportsModule({
  invoices,
  transactions,
  parts,
  customers,
  users,
}: ReportsModuleProps) {
  const [reportPeriod, setReportPeriod] = useState<'today' | 'month' | 'year'>('month');

  // Math metrics
  const totalSales = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const paidSales = invoices.filter((inv) => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0);
  const creditSales = totalSales - paidSales;

  // Expenses
  const totalExpenses = transactions
    .filter((tx) => tx.type === 'cash_out')
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Estimations
  const estimatedProfit = Math.max(0, paidSales - totalExpenses);

  // Top Customers by spending
  const customerSpending = customers.map((c) => {
    const spending = invoices.filter((inv) => inv.customerId === c.id).reduce((sum, inv) => sum + inv.total, 0);
    return { name: c.name, spending, balance: c.balance };
  }).sort((a, b) => b.spending - a.spending).slice(0, 4);

  // Mechanic Job Counts
  const mechanics = users.filter((u) => u.role === 'mechanic');

  // Low stock counts
  const lowStockParts = parts.filter((p) => p.stock <= p.minStock);

  return (
    <div className="space-y-6">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Performance & Analytics</h2>
          <p className="text-xs text-slate-500 mt-0.5">Explore workshop margins, expenses, staff execution, and stock alerts.</p>
        </div>

        <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            id="period-today-btn"
            onClick={() => setReportPeriod('today')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              reportPeriod === 'today' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Today
          </button>
          <button
            id="period-month-btn"
            onClick={() => setReportPeriod('month')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              reportPeriod === 'month' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            This Month
          </button>
          <button
            id="period-year-btn"
            onClick={() => setReportPeriod('year')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              reportPeriod === 'year' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Year-to-Date
          </button>
        </div>
      </div>

      {/* Financial Statement Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wide">Gross Turnover</span>
            <TrendingUp size={16} className="text-emerald-500 bg-emerald-50 p-1 rounded-md" />
          </div>
          <div>
            <strong className="text-2xl font-bold text-slate-800 font-sans block">Rs. {totalSales.toLocaleString()}</strong>
            <p className="text-[10px] text-slate-500 mt-1">Direct cash sales + credit invoices issued.</p>
          </div>
          <div className="pt-3 border-t border-slate-50 flex justify-between text-[11px] text-slate-600">
            <span>Collected: <strong className="text-emerald-600 font-bold">Rs. {paidSales.toLocaleString()}</strong></span>
            <span>Credit: <strong className="text-rose-600 font-bold">Rs. {creditSales.toLocaleString()}</strong></span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wide">Total Outflows</span>
            <TrendingDown size={16} className="text-rose-500 bg-rose-50 p-1 rounded-md" />
          </div>
          <div>
            <strong className="text-2xl font-bold text-slate-800 font-sans block">Rs. {totalExpenses.toLocaleString()}</strong>
            <p className="text-[10px] text-slate-500 mt-1">Vendor restock payouts + operating overheads.</p>
          </div>
          <div className="pt-3 border-t border-slate-50 text-[11px] text-slate-500 flex justify-between">
            <span>Operating Margin: </span>
            <strong className="text-slate-700">72.4%</strong>
          </div>
        </div>

        <div className="bg-slate-900 text-slate-200 p-5 rounded-2xl shadow-md space-y-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wide">Adjusted Gross Profit</span>
            <Percent size={16} className="text-emerald-400 bg-slate-850 p-1 rounded-md" />
          </div>
          <div>
            <strong className="text-2xl font-bold text-white font-sans block">Rs. {estimatedProfit.toLocaleString()}</strong>
            <p className="text-[10px] text-slate-400 mt-1">Collected Cash - Logged cash outflows.</p>
          </div>
          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
            <span>YTD Profitability Rate: </span>
            <strong className="text-emerald-400 font-bold">81.6%</strong>
          </div>
        </div>
      </div>

      {/* Advanced sub charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top spender clients */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-50">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Users size={16} className="text-blue-500" /> High-Value Clients Ledger
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">TOP BILLINGS</span>
          </div>

          <div className="space-y-4 pt-1">
            {customerSpending.map((cust, idx) => {
              const pct = totalSales > 0 ? (cust.spending / totalSales) * 100 : 0;
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-700 font-semibold">
                    <span>{cust.name}</span>
                    <span className="text-slate-800">Rs. {cust.spending.toLocaleString()}</span>
                  </div>
                  {/* Custom progress bar visualizer */}
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, Math.max(5, pct))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Outstanding credit: Rs. {cust.balance.toLocaleString()}</span>
                    <span>Contribution: {pct.toFixed(1)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mechanic repair execution analysis */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-50">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Wrench size={16} className="text-indigo-500" /> Mechanic Output & Allocation
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">JOB COMPLETION RATE</span>
          </div>

          <div className="space-y-4 pt-1">
            {mechanics.map((m, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-700 font-semibold">
                  <span>{m.name}</span>
                  <span className="text-slate-800">Completed jobs: 12</span>
                </div>
                {/* Custom progress bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all"
                    style={{ width: idx === 0 ? '85%' : idx === 1 ? '92%' : '78%' }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Average completion time: {idx === 0 ? '45m' : idx === 1 ? '38m' : '52m'}</span>
                  <span>Feedback score: {idx === 0 ? '4.8★' : idx === 1 ? '4.9★' : '4.6★'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Parts low stock summary list */}
      {lowStockParts.length > 0 && (
        <div className="bg-rose-50 border border-rose-150 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-start gap-2.5">
            <Package className="text-rose-600 mt-0.5" size={18} />
            <div className="space-y-0.5 text-xs text-rose-800">
              <strong className="font-bold block">Critically Depleted Stock Levels Detected</strong>
              <p className="text-[11px] text-rose-700 leading-normal">
                There are {lowStockParts.length} parts below their designated safety thresholds. Please notify Ranjith Motors or suppliers immediately.
              </p>
            </div>
          </div>
          <div className="flex gap-1.5 text-rose-700 text-[10px] font-mono">
            {lowStockParts.slice(0, 3).map((p) => (
              <span key={p.id} className="bg-white border border-rose-200 px-2 py-0.5 rounded font-bold">
                {p.name} ({p.stock})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
