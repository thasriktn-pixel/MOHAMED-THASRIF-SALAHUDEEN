/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Plus, Wallet, Landmark, ArrowUpRight, ArrowDownRight, ClipboardList, CheckCircle2, DollarSign, X } from 'lucide-react';
import { AccountTransaction, Customer } from '../types';

interface AccountsModuleProps {
  transactions: AccountTransaction[];
  customers: Customer[];
  onAddTransaction: (tx: Omit<AccountTransaction, 'id' | 'date'>) => void;
  onPayCredit: (customerId: string, amount: number) => void;
}

export default function AccountsModule({
  transactions,
  customers,
  onAddTransaction,
  onPayCredit,
}: AccountsModuleProps) {
  const [showTxForm, setShowTxForm] = useState(false);
  const [showCollectForm, setShowCollectForm] = useState(false);
  const [showBalancingForm, setShowBalancingForm] = useState(false);

  // New Transaction Form State
  const [txType, setTxType] = useState<'cash_in' | 'cash_out'>('cash_in');
  const [txCategory, setTxCategory] = useState<'expense' | 'income' | 'supplier' | 'customer_credit' | 'bank_transfer'>('expense');
  const [txAmount, setTxAmount] = useState(0);
  const [txDesc, setTxDesc] = useState('');
  const [txBank, setTxBank] = useState('Cash Drawer');

  // Customer Credit Collection State
  const [collectCustId, setCollectCustId] = useState('');
  const [collectAmount, setCollectAmount] = useState(0);

  // Cash Balancing State
  const [countedCash, setCountedCash] = useState(0);

  // Accounts summary math
  const getBankBalance = (bank: string) => {
    const ins = transactions.filter((t) => t.bankAccount === bank && t.type === 'cash_in').reduce((s, t) => s + t.amount, 0);
    const outs = transactions.filter((t) => t.bankAccount === bank && t.type === 'cash_out').reduce((s, t) => s + t.amount, 0);
    return ins - outs;
  };

  const cashDrawer = getBankBalance('Cash Drawer');
  const commercialBank = getBankBalance('Commercial Bank');
  const sampathBank = getBankBalance('Sampath Bank');

  const handleCreateTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (txAmount <= 0 || !txDesc) return;

    onAddTransaction({
      type: txType,
      category: txCategory,
      amount: Number(txAmount),
      description: txDesc,
      bankAccount: txBank,
    });

    setTxAmount(0);
    setTxDesc('');
    setShowTxForm(false);
  };

  const handleCollectCredit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectCustId || collectAmount <= 0) return;

    const cust = customers.find((c) => c.id === collectCustId);
    if (!cust) return;

    // Collect credit
    onPayCredit(collectCustId, Number(collectAmount));

    // Register transaction
    onAddTransaction({
      type: 'cash_in',
      category: 'customer_credit',
      amount: Number(collectAmount),
      description: `Credit payment from customer ${cust.name}`,
      bankAccount: 'Cash Drawer',
    });

    setCollectCustId('');
    setCollectAmount(0);
    setShowCollectForm(false);
  };

  const handleCashBalancing = (e: React.FormEvent) => {
    e.preventDefault();
    const discrepancy = Number(countedCash) - cashDrawer;

    if (discrepancy === 0) {
      alert('Cash Drawer balances perfectly!');
    } else {
      const type = discrepancy > 0 ? 'cash_in' : 'cash_out';
      onAddTransaction({
        type,
        category: 'cash_balancing',
        amount: Math.abs(discrepancy),
        description: `Daily cash balancing discrepancy adjustment (${discrepancy > 0 ? 'Overage' : 'Shortage'})`,
        bankAccount: 'Cash Drawer',
      });
    }

    setCountedCash(0);
    setShowBalancingForm(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Accounts & Fin ledger */}
      <div className="lg:col-span-2 space-y-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Workshop Accounts & Ledger</h2>
          <p className="text-xs text-slate-500 mt-0.5">Control company bank accounts, cash drawer balances, and credit lines.</p>
        </div>

        {/* Bank accounts balance summary card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <span className="text-[10px] text-slate-400 font-mono block uppercase">Cash Drawer (On Hand)</span>
            <strong className="text-lg font-bold text-slate-800 font-sans block mt-1">Rs. {cashDrawer.toLocaleString()}</strong>
            <span className="text-[9px] text-emerald-600 font-semibold mt-2 block">Expected in drawer</span>
          </div>
          <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <span className="text-[10px] text-slate-400 font-mono block uppercase">Commercial Bank</span>
            <strong className="text-lg font-bold text-slate-800 font-sans block mt-1">Rs. {commercialBank.toLocaleString()}</strong>
            <span className="text-[9px] text-slate-400 mt-2 block">Merchant card deposits</span>
          </div>
          <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <span className="text-[10px] text-slate-400 font-mono block uppercase">Sampath Bank</span>
            <strong className="text-lg font-bold text-slate-800 font-sans block mt-1">Rs. {sampathBank.toLocaleString()}</strong>
            <span className="text-[9px] text-slate-400 mt-2 block">Corporate bank transfers</span>
          </div>
        </div>

        {/* Transaction History Ledger table */}
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm p-5 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-50">
            <h3 className="font-bold text-slate-800 text-sm">General Transaction Log</h3>
            <span className="text-[10px] text-slate-400 font-mono">ALL CASH FLOWS</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-mono text-[10px] uppercase">
                  <th className="py-2">Description</th>
                  <th className="py-2">Account</th>
                  <th className="py-2">Category</th>
                  <th className="py-2 text-right">Amount (Rs.)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {transactions.map((tx) => {
                  const isIn = tx.type === 'cash_in';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="py-3">
                        <div className="font-semibold text-slate-700 text-xs flex items-center gap-1.5">
                          {isIn ? (
                            <ArrowUpRight size={14} className="text-emerald-500 bg-emerald-50 rounded" />
                          ) : (
                            <ArrowDownRight size={14} className="text-rose-500 bg-rose-50 rounded" />
                          )}
                          {tx.description}
                        </div>
                        <span className="text-[9px] text-slate-400 block ml-5">{tx.date || '2026-07-19'}</span>
                      </td>
                      <td className="py-3 text-slate-500 font-mono">{tx.bankAccount || 'Cash Drawer'}</td>
                      <td className="py-3">
                        <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold uppercase">
                          {tx.category.replace('_', ' ')}
                        </span>
                      </td>
                      <td className={`py-3 text-right font-bold font-sans ${isIn ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isIn ? '+' : '-'} Rs. {tx.amount.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Action forms column */}
      <div className="space-y-4">
        {/* Quick action triggers */}
        <div className="bg-slate-900 text-slate-200 p-5 rounded-2xl shadow-md space-y-3">
          <h3 className="font-bold text-slate-100 text-sm">Account Operations</h3>
          <div className="flex flex-col gap-2">
            <button
              id="acc-tx-trigger"
              onClick={() => {
                setShowTxForm(true);
                setShowCollectForm(false);
                setShowBalancingForm(false);
              }}
              className="w-full text-left py-2 px-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold flex items-center justify-between border border-slate-700"
            >
              <span>Record Expense / Income</span>
              <Plus size={14} className="text-slate-400" />
            </button>
            <button
              id="acc-collect-trigger"
              onClick={() => {
                setShowCollectForm(true);
                setShowTxForm(false);
                setShowBalancingForm(false);
              }}
              className="w-full text-left py-2 px-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold flex items-center justify-between border border-slate-700"
            >
              <span>Collect Customer Credit</span>
              <Plus size={14} className="text-slate-400" />
            </button>
            <button
              id="acc-balance-trigger"
              onClick={() => {
                setShowBalancingForm(true);
                setShowTxForm(false);
                setShowCollectForm(false);
              }}
              className="w-full text-left py-2 px-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold flex items-center justify-between border border-slate-700"
            >
              <span>Daily Cash balancing</span>
              <Plus size={14} className="text-slate-400" />
            </button>
          </div>
        </div>

        {/* Form: Record Expense / Income */}
        {showTxForm && (
          <form id="acc-tx-form" onSubmit={handleCreateTx} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-3.5 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-800 text-xs">Record Expense / Income</h3>
              <button type="button" onClick={() => setShowTxForm(false)} className="text-slate-400 hover:text-slate-600">
                <X size={15} />
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Transaction Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTxType('cash_in');
                    setTxCategory('income');
                  }}
                  className={`py-1.5 rounded-lg text-center text-xs font-bold border transition-colors ${
                    txType === 'cash_in'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  Cash In (Income)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTxType('cash_out');
                    setTxCategory('expense');
                  }}
                  className={`py-1.5 rounded-lg text-center text-xs font-bold border transition-colors ${
                    txType === 'cash_out'
                      ? 'bg-rose-50 border-rose-500 text-rose-800'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  Cash Out (Expense)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Category</label>
              <select
                id="tx-category-select"
                value={txCategory}
                onChange={(e) => setTxCategory(e.target.value as any)}
                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
              >
                {txType === 'cash_in' ? (
                  <>
                    <option value="income">General Income</option>
                    <option value="customer_credit">Credit Settlement</option>
                  </>
                ) : (
                  <>
                    <option value="expense">Operating Expense</option>
                    <option value="supplier">Supplier Settlement</option>
                  </>
                )}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Amount (Rs.) *</label>
                <input
                  id="tx-amount-input"
                  type="number"
                  required
                  value={txAmount}
                  onChange={(e) => setTxAmount(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Account *</label>
                <select
                  id="tx-bank-select"
                  value={txBank}
                  onChange={(e) => setTxBank(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                >
                  <option value="Cash Drawer">Cash Drawer</option>
                  <option value="Commercial Bank">Commercial Bank</option>
                  <option value="Sampath Bank">Sampath Bank</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Description *</label>
              <input
                id="tx-desc-input"
                type="text"
                required
                placeholder="e.g. Workshop water dispenser bottle"
                value={txDesc}
                onChange={(e) => setTxDesc(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                id="submit-tx-btn"
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-md cursor-pointer text-center"
              >
                Log Transaction
              </button>
              <button
                type="button"
                onClick={() => setShowTxForm(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-2 px-3 rounded-xl cursor-pointer text-center"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Form: Collect Customer Credit */}
        {showCollectForm && (
          <form id="acc-collect-form" onSubmit={handleCollectCredit} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-3.5 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-800 text-xs">Collect Credit</h3>
              <button type="button" onClick={() => setShowCollectForm(false)} className="text-slate-400 hover:text-slate-600">
                <X size={15} />
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Select Debtor Customer *</label>
              <select
                id="collect-cust-select"
                required
                value={collectCustId}
                onChange={(e) => {
                  const cid = e.target.value;
                  setCollectCustId(cid);
                  const cust = customers.find((c) => c.id === cid);
                  setCollectAmount(cust ? cust.balance : 0);
                }}
                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
              >
                <option value="">Select debtor...</option>
                {customers
                  .filter((c) => c.balance > 0)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (Outstanding: Rs. {c.balance})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Collection Amount (Rs.) *</label>
              <input
                id="collect-amount-input"
                type="number"
                required
                value={collectAmount}
                onChange={(e) => setCollectAmount(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                id="submit-collect-btn"
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-md cursor-pointer text-center"
              >
                Collect & Deposit Cash
              </button>
              <button
                type="button"
                onClick={() => setShowCollectForm(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-2 px-3 rounded-xl cursor-pointer text-center"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Form: Cash balancing */}
        {showBalancingForm && (
          <form id="acc-balancing-form" onSubmit={handleCashBalancing} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-3.5 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-800 text-xs">Daily Cash balancing</h3>
              <button type="button" onClick={() => setShowBalancingForm(false)} className="text-slate-400 hover:text-slate-600">
                <X size={15} />
              </button>
            </div>

            <p className="text-[10px] text-slate-500">
              Input counted physically cash in drawer. If it differs from the system's expected balance (Rs. {cashDrawer}), the system logs discrepancies.
            </p>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Physical Cash Count (Rs.) *</label>
              <input
                id="counted-cash-input"
                type="number"
                required
                value={countedCash}
                onChange={(e) => setCountedCash(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                id="submit-balancing-btn"
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-md cursor-pointer text-center"
              >
                Balance Cash Drawer
              </button>
              <button
                type="button"
                onClick={() => setShowBalancingForm(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-2 px-3 rounded-xl cursor-pointer text-center"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
