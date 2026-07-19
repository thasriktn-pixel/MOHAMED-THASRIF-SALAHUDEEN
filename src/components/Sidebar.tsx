/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LayoutDashboard, Users, Car, Wrench, ClipboardList, Receipt, Package, Wallet, BarChart3, ShieldAlert, Sparkles, Wifi, WifiOff, LogOut, ChevronRight, ChevronLeft } from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  onSync: () => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  currentRole,
  setCurrentRole,
  isOffline,
  setIsOffline,
  isCollapsed,
  setIsCollapsed,
  onSync,
}: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['owner', 'manager', 'cashier', 'mechanic'] },
    { id: 'customers', label: 'Customers', icon: Users, roles: ['owner', 'manager', 'cashier'] },
    { id: 'vehicles', label: 'Vehicles', icon: Car, roles: ['owner', 'manager', 'cashier', 'mechanic'] },
    { id: 'templates', label: 'Services', icon: Wrench, roles: ['owner', 'manager', 'cashier'] },
    { id: 'jobs', label: 'Job Cards', icon: ClipboardList, roles: ['owner', 'manager', 'cashier', 'mechanic'] },
    { id: 'invoices', label: 'Invoices', icon: Receipt, roles: ['owner', 'manager', 'cashier'] },
    { id: 'inventory', label: 'Inventory', icon: Package, roles: ['owner', 'manager', 'cashier'] },
    { id: 'accounts', label: 'Accounts', icon: Wallet, roles: ['owner', 'manager', 'cashier'] },
    { id: 'reports', label: 'Reports', icon: BarChart3, roles: ['owner', 'manager'] },
    { id: 'ai-recommend', label: 'AI Diagnosis', icon: Sparkles, roles: ['owner', 'manager', 'mechanic'] },
    { id: 'owner', label: 'Owner Panel', icon: ShieldAlert, roles: ['owner'] },
  ];

  const visibleItems = menuItems.filter((item) => item.roles.includes(currentRole));

  const roleLabels: Record<UserRole, string> = {
    owner: 'Owner',
    manager: 'Manager',
    cashier: 'Cashier',
    mechanic: 'Mechanic',
  };

  return (
    <aside
      id="app-sidebar"
      className={`bg-slate-900 text-white flex flex-col justify-between transition-all duration-300 border-r border-slate-800 ${
        isCollapsed ? 'w-20' : 'w-64'
      } h-screen sticky top-0`}
    >
      <div>
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-md shadow-blue-500/20">
                TS
              </div>
              <div>
                <h1 className="font-bold text-base leading-tight">TS Workshop</h1>
                <span className="text-[10px] text-slate-400 font-mono tracking-wider">MANAGER</span>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="h-9 w-9 bg-blue-600 rounded-xl flex items-center justify-center mx-auto font-bold text-lg text-white">
              TS
            </div>
          )}
          <button
            id="toggle-sidebar-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Sync / Network Simulator */}
        <div className="p-3 border-b border-slate-800/60 bg-slate-950/40">
          <div className={`flex items-center justify-between ${isCollapsed ? 'flex-col gap-2' : ''}`}>
            {!isCollapsed && (
              <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                {isOffline ? (
                  <>
                    <WifiOff size={14} className="text-rose-500" />
                    Offline (Local Mode)
                  </>
                ) : (
                  <>
                    <Wifi size={14} className="text-emerald-500 animate-pulse" />
                    Cloud Sync Active
                  </>
                )}
              </span>
            )}
            {isCollapsed && (
              <span title={isOffline ? 'Offline' : 'Online'}>
                {isOffline ? <WifiOff size={14} className="text-rose-500" /> : <Wifi size={14} className="text-emerald-500" />}
              </span>
            )}
            <button
              id="offline-toggle-btn"
              onClick={() => {
                setIsOffline(!isOffline);
                if (isOffline) {
                  onSync();
                }
              }}
              className="px-2 py-1 text-[10px] font-mono bg-slate-800 hover:bg-slate-700 active:bg-slate-700 text-slate-300 rounded transition-colors"
            >
              {isCollapsed ? (isOffline ? 'Go On' : 'Go Off') : isOffline ? 'Go Online & Sync' : 'Simulate Offline'}
            </button>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="mt-4 px-2 space-y-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center py-3' : 'px-3 py-2.5 gap-3'
                } rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
                title={item.label}
              >
                <Icon size={20} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'} />
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User profile & Role switcher */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/20">
        {!isCollapsed ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-sm text-blue-400 border border-slate-700">
                {roleLabels[currentRole].charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="font-semibold text-xs truncate leading-none mb-1 text-slate-200">
                  {currentRole === 'owner' ? 'Thasrik Tennekoon' : currentRole === 'manager' ? 'Ruwan Perera' : currentRole === 'cashier' ? 'Fathima Nafeesa' : 'Nuwan Jayasinghe'}
                </p>
                <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded font-medium">
                  {roleLabels[currentRole]}
                </span>
              </div>
            </div>

            {/* Quick Role Switcher for Demonstration */}
            <div className="pt-2 border-t border-slate-800/80">
              <label className="block text-[10px] text-slate-400 mb-1 font-mono uppercase tracking-wider">Demo Quick Role Switch:</label>
              <select
                id="sidebar-role-select"
                value={currentRole}
                onChange={(e) => {
                  const role = e.target.value as UserRole;
                  setCurrentRole(role);
                  // fallback page if tab not allowed
                  const allowedTabs: Record<UserRole, string[]> = {
                    owner: ['dashboard', 'customers', 'vehicles', 'templates', 'jobs', 'invoices', 'inventory', 'accounts', 'reports', 'ai-recommend', 'owner'],
                    manager: ['dashboard', 'customers', 'vehicles', 'templates', 'jobs', 'invoices', 'inventory', 'accounts', 'reports', 'ai-recommend'],
                    cashier: ['dashboard', 'customers', 'vehicles', 'templates', 'jobs', 'invoices', 'inventory', 'accounts'],
                    mechanic: ['dashboard', 'vehicles', 'jobs', 'ai-recommend'],
                  };
                  if (!allowedTabs[role].includes(activeTab)) {
                    setActiveTab('dashboard');
                  }
                }}
                className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 outline-none"
              >
                <option value="owner">Owner (Thasrik)</option>
                <option value="manager">Manager (Ruwan)</option>
                <option value="cashier">Cashier (Fathima)</option>
                <option value="mechanic">Mechanic (Nuwan)</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div
              className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-sm text-blue-400 border border-slate-700 cursor-pointer"
              title={`Active role: ${roleLabels[currentRole]}`}
            >
              {roleLabels[currentRole].charAt(0)}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
