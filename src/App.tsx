/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Bell, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { UserRole, Customer, Vehicle, ServiceTemplate, Part, JobCard, Invoice, AccountTransaction, ActivityLog, Notification } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CustomerModule from './components/CustomerModule';
import VehicleModule from './components/VehicleModule';
import ServiceTemplates from './components/ServiceTemplates';
import JobCards from './components/JobCards';
import InvoiceModule from './components/InvoiceModule';
import InventoryModule from './components/InventoryModule';
import AccountsModule from './components/AccountsModule';
import ReportsModule from './components/ReportsModule';
import AIRecommendations from './components/AIRecommendations';
import OwnerModule from './components/OwnerModule';

// Starting Mock Datasets
import {
  mockUsers,
  mockCustomers,
  mockVehicles,
  mockServices,
  mockParts,
  mockJobCards,
  mockInvoices,
  mockTransactions,
  mockActivityLogs,
  mockNotifications
} from './data/mockData';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('owner');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isOffline, setIsOffline] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);

  // States
  const [users, setUsers] = useState(mockUsers);
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
  const [templates, setTemplates] = useState<ServiceTemplate[]>(mockServices);
  const [parts, setParts] = useState<Part[]>(mockParts);
  const [jobCards, setJobCards] = useState<JobCard[]>(mockJobCards);
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [transactions, setTransactions] = useState<AccountTransaction[]>(mockTransactions);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(mockActivityLogs);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  // Prepopulate job reference to invoice builder state
  const [activePrepopulatedJob, setActivePrepopulatedJob] = useState<JobCard | null>(null);

  // Helper Name Maps
  const mechanicNames: Record<string, string> = users.reduce((acc, user) => {
    acc[user.id] = user.name;
    return acc;
  }, {} as Record<string, string>);

  const getActiveUser = () => {
    return users.find((u) => u.role === currentRole) || users[0];
  };

  // Activity logging helper
  const addLog = (action: string, details: string) => {
    const user = getActiveUser();
    const newLog: ActivityLog = {
      id: 'log-' + Math.random().toString(36).substr(2, 5),
      userId: user.id,
      userName: user.name,
      role: user.role,
      action,
      details,
      timestamp: new Date().toISOString(),
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  // Notification helper
  const addNotification = (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newN: Notification = {
      ...n,
      id: 'notif-' + Math.random().toString(36).substr(2, 5),
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newN, ...prev]);
  };

  // CRM: Customer operations
  const handleAddCustomer = (c: Omit<Customer, 'id' | 'createdAt'>) => {
    const newCustomer: Customer = {
      ...c,
      id: 'c-' + Math.random().toString(36).substr(2, 5),
      createdAt: new Date().toISOString(),
    };
    setCustomers((prev) => [newCustomer, ...prev]);
    addLog('Create Customer', `Registered new client card: ${c.name}`);
  };

  const handleUpdateCustomer = (id: string, updated: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updated } : c))
    );
    addLog('Update Customer', `Updated customer details for card ID: ${id}`);
  };

  // CRM: Vehicle operations
  const handleAddVehicle = (v: Omit<Vehicle, 'id' | 'createdAt'>) => {
    const newVehicle: Vehicle = {
      ...v,
      id: 'v-' + Math.random().toString(36).substr(2, 5),
      createdAt: new Date().toISOString(),
    };
    setVehicles((prev) => [newVehicle, ...prev]);
    addLog('Create Vehicle', `Registered license plate: ${v.registration}`);
  };

  const handleUpdateVehicle = (id: string, updated: Partial<Vehicle>) => {
    setVehicles((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updated } : v))
    );
    addLog('Update Vehicle', `Updated details for license plate ID: ${id}`);
  };

  // Templates operations
  const handleAddTemplate = (t: Omit<ServiceTemplate, 'id'>) => {
    const newTemplate: ServiceTemplate = {
      ...t,
      id: 's-' + Math.random().toString(36).substr(2, 5),
    };
    setTemplates((prev) => [newTemplate, ...prev]);
    addLog('Create Service', `Added standard service package template: ${t.name}`);
  };

  const handleUpdateTemplate = (id: string, updated: Partial<ServiceTemplate>) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updated } : t))
    );
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    addLog('Delete Service', `Removed template package ID: ${id}`);
  };

  // Job Cards operations
  const handleAddJobCard = (job: Omit<JobCard, 'id' | 'jobNo' | 'createdAt' | 'updatedAt'>) => {
    const seqNo = jobCards.length + 1;
    const jobNo = `JOB-2026-${seqNo.toString().padStart(4, '0')}`;

    const newJob: JobCard = {
      ...job,
      id: 'j-' + Math.random().toString(36).substr(2, 5),
      jobNo,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setJobCards((prev) => [newJob, ...prev]);

    // Subtract parts inventory stock levels
    job.itemsNeeded.forEach((item) => {
      setParts((prev) =>
        prev.map((p) => {
          if (p.id === item.partId) {
            const nextStock = Math.max(0, p.stock - item.qty);
            if (nextStock <= p.minStock) {
              addNotification({
                type: 'low_stock',
                title: 'Inventory Alert',
                message: `Low Stock: ${p.name} drops to ${nextStock}.`,
              });
            }
            return { ...p, stock: nextStock };
          }
          return p;
        })
      );
    });

    addLog('Create Job Card', `Authorized ${jobNo} for vehicle`);
  };

  const handleUpdateJobCard = (id: string, updated: Partial<JobCard>) => {
    setJobCards((prev) =>
      prev.map((j) => (j.id === id ? { ...j, ...updated, updatedAt: new Date().toISOString() } : j))
    );

    if (updated.status === 'completed') {
      const job = jobCards.find((j) => j.id === id);
      addNotification({
        type: 'pending_invoice',
        title: 'Work Completed',
        message: `Job ${job?.jobNo || 'Repair'} is completed. Ready for invoice generation.`,
      });
      addLog('Update Job Card', `Marked ${job?.jobNo} as completed repair.`);
    }
  };

  const handleGenerateInvoiceFromJob = (job: JobCard) => {
    setActivePrepopulatedJob(job);
    setActiveTab('invoices');
  };

  // Invoicing operations
  const handleAddInvoice = (inv: Omit<Invoice, 'id' | 'invoiceNo' | 'createdAt'>) => {
    const seqNo = invoices.length + 1;
    const invoiceNo = `INV-2026-${seqNo.toString().padStart(4, '0')}`;

    const newInvoice: Invoice = {
      ...inv,
      id: 'i-' + Math.random().toString(36).substr(2, 5),
      invoiceNo,
      createdAt: new Date().toISOString(),
    };

    setInvoices((prev) => [newInvoice, ...prev]);

    // Update job card status if generated from a job
    if (inv.jobCardId) {
      setJobCards((prev) =>
        prev.map((j) => (j.id === inv.jobCardId ? { ...j, status: 'delivered' } : j))
      );
    }

    // Double-Entry bookkeeping adjustments
    if (inv.paid) {
      // 1. Paid instantly -> Cash in entry
      const newTx: AccountTransaction = {
        id: 'tx-' + Math.random().toString(36).substr(2, 5),
        type: 'cash_in',
        category: 'income',
        amount: inv.total,
        description: `Invoice collection for ${invoiceNo}`,
        bankAccount: 'Cash Drawer',
        date: '2026-07-19',
      };
      setTransactions((prev) => [newTx, ...prev]);
    } else {
      // 2. Pending credit -> Increase customer debtor ledger outstanding balance
      setCustomers((prev) =>
        prev.map((c) => (c.id === inv.customerId ? { ...c, balance: c.balance + inv.total } : c))
      );
      addNotification({
        type: 'pending_invoice',
        title: 'Credit Extended',
        message: `Rs. ${inv.total.toLocaleString()} debtor credit extended.`,
      });
    }

    addLog('Create Invoice', `Generated ${invoiceNo} for Rs. ${inv.total.toLocaleString()}`);
  };

  const handleUpdateInvoice = (id: string, updated: Partial<Invoice>) => {
    const original = invoices.find((inv) => inv.id === id);
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, ...updated } : inv))
    );

    // If marked paid later
    if (updated.status === 'paid' && original?.status === 'pending') {
      // 1. Record Transaction Cash Receipt
      const newTx: AccountTransaction = {
        id: 'tx-' + Math.random().toString(36).substr(2, 5),
        type: 'cash_in',
        category: 'income',
        amount: original.total,
        description: `Collection of pending Invoice ${original.invoiceNo}`,
        bankAccount: 'Cash Drawer',
        date: '2026-07-19',
      };
      setTransactions((prev) => [newTx, ...prev]);

      // 2. Reduce customer debtor ledger outstanding credit balance
      setCustomers((prev) =>
        prev.map((c) => (c.id === original.customerId ? { ...c, balance: Math.max(0, c.balance - original.total) } : c))
      );

      addLog('Collect Payment', `Collected payment for credit Invoice ${original.invoiceNo}`);
    }
  };

  // Parts Operations
  const handleAddPart = (p: Omit<Part, 'id'>) => {
    const newPart: Part = {
      ...p,
      id: 'p-' + Math.random().toString(36).substr(2, 5),
    };
    setParts((prev) => [newPart, ...prev]);
    addLog('Add Inventory', `Added product stock item: ${p.name}`);
  };

  const handleUpdatePart = (id: string, updated: Partial<Part>) => {
    setParts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );
  };

  // General Transaction logging (Expenses)
  const handleAddTransaction = (tx: Omit<AccountTransaction, 'id' | 'date'>) => {
    const newTx: AccountTransaction = {
      ...tx,
      id: 'tx-' + Math.random().toString(36).substr(2, 5),
      date: '2026-07-19',
    };
    setTransactions((prev) => [newTx, ...prev]);
    addLog('Record Transaction', `${tx.type === 'cash_in' ? 'Income' : 'Expense'} entry: ${tx.description}`);
  };

  // Pay outstanding debtor credit manual action
  const handlePayCredit = (customerId: string, amount: number) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, balance: Math.max(0, c.balance - amount) } : c))
    );
    addLog('Credit Collection', `Credit paid by customer ID ${customerId}: Rs. ${amount}`);
  };

  // Owner Panel Role update helper
  const handleUpdateUserRole = (id: string, role: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role } : u))
    );
    addLog('Update User Role', `Worker ID ${id} reassigned to role ${role}`);
  };

  // Simulated Cloud Sync
  const handleSyncCloud = () => {
    addLog('Cloud Replication', 'Synched 14 pending ledger transactions to GCS Cloud Storage database.');
    addNotification({
      type: 'backup',
      title: 'Cloud Replication Completed',
      message: 'Systems completely synched to Firebase backend servers.',
    });
  };

  // Quick Action redirection mapping
  const handleQuickAction = (action: string) => {
    if (action === 'new-job') {
      setActiveTab('jobs');
    } else if (action === 'new-invoice') {
      setActiveTab('invoices');
    } else if (action === 'add-customer') {
      setActiveTab('customers');
    } else if (action === 'ai-diagnosis') {
      setActiveTab('ai-recommend');
    } else if (action === 'view-jobs') {
      setActiveTab('jobs');
    } else if (action === 'view-vehicles') {
      setActiveTab('vehicles');
    } else if (action === 'view-inventory') {
      setActiveTab('inventory');
    }
  };

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex bg-slate-50 min-h-screen text-slate-800 font-sans antialiased">
      {/* Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        isOffline={isOffline}
        setIsOffline={setIsOffline}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        onSync={handleSyncCloud}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-slate-100 h-16 sticky top-0 z-10 flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-blue-600" />
            <span className="text-xs font-semibold text-slate-500">Security Clearance Level:</span>
            <span className="text-xs bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 rounded-md font-bold uppercase">
              {currentRole}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification alert icon */}
            <div className="relative">
              <button
                id="header-notif-btn"
                onClick={() => setShowNotificationPanel(!showNotificationPanel)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors relative cursor-pointer"
              >
                <Bell size={20} />
                {unreadNotifCount > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                )}
              </button>

              {/* Responsive Notification panel Popup */}
              {showNotificationPanel && (
                <div className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 overflow-hidden text-xs">
                  <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <span className="font-bold text-slate-700">Notifications & Alerts</span>
                    <button
                      id="clear-notif-btn"
                      onClick={() => {
                        setNotifications(notifications.map((n) => ({ ...n, read: true })));
                        setShowNotificationPanel(false);
                      }}
                      className="text-[10px] text-blue-600 hover:underline font-semibold"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="divide-y divide-slate-50 max-h-64 overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 hover:bg-slate-50/50 transition-colors ${!n.read ? 'bg-blue-50/15' : ''}`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-slate-800">{n.title}</span>
                          <span className="text-[9px] text-slate-400 font-mono">
                            {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 leading-normal">{n.message}</p>
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <div className="p-6 text-center text-slate-400">No active alerts.</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="h-4.5 w-[1px] bg-slate-200" />

            {/* Profile widget */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 hidden sm:inline-block">
                Colombo Workshop #3
              </span>
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
            </div>
          </div>
        </header>

        {/* Dynamic Main Stage Grid */}
        <main className="p-6 max-w-7xl w-full mx-auto flex-1">
          {activeTab === 'dashboard' && (
            <Dashboard
              customers={customers}
              vehicles={vehicles}
              jobCards={jobCards}
              invoices={invoices}
              parts={parts}
              transactions={transactions}
              onQuickAction={handleQuickAction}
              mechanicNames={mechanicNames}
            />
          )}

          {activeTab === 'customers' && (
            <CustomerModule
              customers={customers}
              vehicles={vehicles}
              invoices={invoices}
              onAddCustomer={handleAddCustomer}
              onUpdateCustomer={handleUpdateCustomer}
            />
          )}

          {activeTab === 'vehicles' && (
            <VehicleModule
              vehicles={vehicles}
              customers={customers}
              jobCards={jobCards}
              invoices={invoices}
              onAddVehicle={handleAddVehicle}
              onUpdateVehicle={handleUpdateVehicle}
            />
          )}

          {activeTab === 'templates' && (
            <ServiceTemplates
              templates={templates}
              onAddTemplate={handleAddTemplate}
              onUpdateTemplate={handleUpdateTemplate}
              onDeleteTemplate={handleDeleteTemplate}
            />
          )}

          {activeTab === 'jobs' && (
            <JobCards
              jobCards={jobCards}
              vehicles={vehicles}
              customers={customers}
              templates={templates}
              parts={parts}
              users={users}
              onAddJobCard={handleAddJobCard}
              onUpdateJobCard={handleUpdateJobCard}
              onGenerateInvoiceFromJob={handleGenerateInvoiceFromJob}
            />
          )}

          {activeTab === 'invoices' && (
            <InvoiceModule
              invoices={invoices}
              customers={customers}
              vehicles={vehicles}
              templates={templates}
              parts={parts}
              jobCards={jobCards}
              onAddInvoice={handleAddInvoice}
              onUpdateInvoice={handleUpdateInvoice}
              activePrepopulatedJob={activePrepopulatedJob}
              clearPrepopulatedJob={() => setActivePrepopulatedJob(null)}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryModule
              parts={parts}
              onAddPart={handleAddPart}
              onUpdatePart={handleUpdatePart}
            />
          )}

          {activeTab === 'accounts' && (
            <AccountsModule
              transactions={transactions}
              customers={customers}
              onAddTransaction={handleAddTransaction}
              onPayCredit={handlePayCredit}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsModule
              invoices={invoices}
              transactions={transactions}
              parts={parts}
              customers={customers}
              users={users}
            />
          )}

          {activeTab === 'ai-recommend' && (
            <AIRecommendations
              vehicles={vehicles}
              customers={customers}
              templates={templates}
              parts={parts}
              users={users}
              onAddJobCardFromAI={handleAddJobCard}
            />
          )}

          {activeTab === 'owner' && (
            <OwnerModule
              users={users}
              activityLogs={activityLogs}
              onUpdateUserRole={handleUpdateUserRole}
              onAddActivityLog={addLog}
              onAddNotification={addNotification}
            />
          )}
        </main>
      </div>
    </div>
  );
}
