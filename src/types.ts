/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'owner' | 'manager' | 'cashier' | 'mechanic';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  active: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  nic: string; // NIC/ID for Sri Lanka
  notes: string;
  balance: number; // outstanding balance
  createdAt: string;
}

export interface Vehicle {
  id: string;
  registration: string; // License plate
  vin: string;
  make: string;
  model: string;
  year: number;
  engine: string;
  mileage: number;
  customerId: string; // Owner customer
  createdAt: string;
}

export interface ServiceTemplate {
  id: string;
  name: string;
  description: string;
  category: 'maintenance' | 'repair' | 'diagnostics' | 'ac' | 'brakes' | 'suspension';
  defaultPrice: number;
  isFavorite: boolean;
  recentlyUsed?: boolean;
}

export interface JobCard {
  id: string;
  jobNo: string;
  vehicleId: string;
  customerId: string;
  mechanicId: string; // Assigned mechanic user ID
  status: 'waiting' | 'in_progress' | 'completed' | 'delivered';
  notes: string;
  serviceIds: string[]; // Selected standard service templates
  customServices: { name: string; price: number }[];
  itemsNeeded: { partId: string; qty: number; name: string; price: number }[];
  cost: number;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  jobCardId?: string;
  customerId: string;
  vehicleId: string;
  services: { name: string; price: number }[];
  parts: { partId: string; name: string; qty: number; price: number }[];
  discount: number;
  tax: number;
  total: number;
  paid: boolean;
  notes: string;
  status: 'pending' | 'paid';
  createdAt: string;
}

export interface Part {
  id: string;
  barcode: string;
  partNumber: string;
  name: string;
  supplier: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  minStock: number;
  category: string;
}

export interface AccountTransaction {
  id: string;
  type: 'cash_in' | 'cash_out';
  category: 'expense' | 'income' | 'supplier' | 'customer_credit' | 'bank_transfer' | 'cash_balancing';
  amount: number;
  description: string;
  bankAccount?: string; // e.g. "Commercial Bank", "Sampath Bank" or "Cash Drawer"
  date: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  role: UserRole;
  action: string;
  details: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  type: 'low_stock' | 'pending_invoice' | 'service_reminder' | 'backup';
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
}
