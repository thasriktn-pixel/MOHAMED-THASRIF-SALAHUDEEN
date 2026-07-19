/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Shield, Users, Clipboard, Database, Check, AlertTriangle, RefreshCw, Server, X } from 'lucide-react';
import { User, ActivityLog, Notification } from '../types';

interface OwnerModuleProps {
  users: User[];
  activityLogs: ActivityLog[];
  onUpdateUserRole: (id: string, role: any) => void;
  onAddActivityLog: (action: string, details: string) => void;
  onAddNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
}

export default function OwnerModule({
  users,
  activityLogs,
  onUpdateUserRole,
  onAddActivityLog,
  onAddNotification,
}: OwnerModuleProps) {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState(false);

  const handleBackup = () => {
    setIsBackingUp(true);
    setBackupSuccess(false);

    setTimeout(() => {
      setIsBackingUp(false);
      setBackupSuccess(true);
      onAddActivityLog('SQL Backup', 'Completed manual database cluster backup successfully to GCS bucket.');
      onAddNotification({
        type: 'backup',
        title: 'System Backup Success',
        message: 'Manual backup file ts_workshop_backup_20260719.sql exported successfully.',
      });
    }, 2000);
  };

  const roleColors = {
    owner: 'bg-rose-50 text-rose-700 border-rose-200',
    manager: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    cashier: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    mechanic: 'bg-slate-50 text-slate-700 border-slate-200',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Audit Logs column */}
      <div className="lg:col-span-2 space-y-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Owner Audit Panel</h2>
          <p className="text-xs text-slate-500 mt-0.5">Track worker activity, modify access clearance, and export SQL backups.</p>
        </div>

        {/* Audit Logs Trail */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-50">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Clipboard size={16} className="text-blue-500" /> Activity Audit Trail
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">LIVE SYSTEMS</span>
          </div>

          <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-1">
            {activityLogs.map((log) => (
              <div key={log.id} className="flex gap-3 text-xs items-start p-3 bg-slate-50/45 border border-slate-100 rounded-xl hover:shadow-sm transition-all">
                <span className="font-mono text-[10px] text-slate-400 bg-white border px-1.5 py-0.5 rounded shadow-sm">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <div className="flex-1 space-y-1">
                  <p className="font-semibold text-slate-800">
                    {log.userName} <span className="font-normal text-slate-400">({log.role})</span> — {log.action}
                  </p>
                  <p className="text-[11px] text-slate-500 leading-normal">{log.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Staff and operations list */}
      <div className="space-y-4">
        {/* SQL Database cluster backups */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
            <Database className="text-blue-500" size={18} />
            <h3 className="font-bold text-sm text-slate-800">Database & Security</h3>
          </div>

          <p className="text-[11px] text-slate-500 leading-normal">
            TS Workshop Manager runs on an integrated SQLite cloud replicate container. You can trigger manual double-entry SQL structural snapshots below.
          </p>

          <button
            id="owner-backup-btn"
            onClick={handleBackup}
            disabled={isBackingUp}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-md cursor-pointer transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isBackingUp ? (
              <>
                <RefreshCw size={13} className="animate-spin" /> backing up cluster...
              </>
            ) : (
              <>
                <Server size={13} /> Trigger Cloud SQL Backup
              </>
            )}
          </button>

          {backupSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-150 text-emerald-800 text-[11px] font-semibold rounded-xl flex items-center gap-1.5">
              <Check size={14} /> SQL Database snapshot backup completed and cataloged!
            </div>
          )}
        </div>

        {/* Staff Management */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
            <Users className="text-blue-500" size={18} />
            <h3 className="font-bold text-sm text-slate-800">Staff Credentials & Roles</h3>
          </div>

          <div className="divide-y divide-slate-50">
            {users.map((u) => (
              <div key={u.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-800">{u.name}</h4>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{u.email}</span>
                </div>

                <select
                  value={u.role}
                  onChange={(e) => onUpdateUserRole(u.id, e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-700 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="owner">Owner</option>
                  <option value="manager">Manager</option>
                  <option value="cashier">Cashier</option>
                  <option value="mechanic">Mechanic</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
