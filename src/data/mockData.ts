import { User, Customer, Vehicle, ServiceTemplate, Part, JobCard, Invoice, AccountTransaction, ActivityLog, Notification } from '../types';

export const mockUsers: User[] = [
  { id: 'u1', name: 'Thasrik Tennekoon', role: 'owner', email: 'owner@tsworkshop.com', active: true },
  { id: 'u2', name: 'Ruwan Perera', role: 'manager', email: 'ruwan@tsworkshop.com', active: true },
  { id: 'u3', name: 'Fathima Nafeesa', role: 'cashier', email: 'fathima@tsworkshop.com', active: true },
  { id: 'u4', name: 'Nuwan Jayasinghe', role: 'mechanic', email: 'nuwan@tsworkshop.com', active: true },
  { id: 'u5', name: 'Kusal Mendis', role: 'mechanic', email: 'kusal@tsworkshop.com', active: true },
];

export const mockCustomers: Customer[] = [
  { id: 'c1', name: 'Anura Bandaranaike', phone: '0771234567', address: 'No. 45, Galle Road, Colombo 03', nic: '198512400320', notes: 'Prefers Mobil 1 engine oil. Regular customer.', balance: 4500, createdAt: '2026-05-10T10:00:00Z' },
  { id: 'c2', name: 'Dilshan Silva', phone: '0714567890', address: 'No. 12/A, Kandy Road, Kiribathgoda', nic: '199245300120', notes: 'Always check brake squeaking sound.', balance: 0, createdAt: '2026-06-01T11:30:00Z' },
  { id: 'c3', name: 'Priyantha De Silva', phone: '0767890123', address: 'No. 88, Negombo Road, Wattala', nic: '197801200451', notes: 'Corporate fleet vehicle owner.', balance: 12500, createdAt: '2026-06-15T09:15:00Z' },
  { id: 'c4', name: 'Shalini Fernando', phone: '0723456789', address: 'No. 104, Havelock Road, Colombo 05', nic: '199584300998', notes: 'Call before replacing any parts.', balance: 0, createdAt: '2026-07-02T14:20:00Z' },
];

export const mockVehicles: Vehicle[] = [
  { id: 'v1', registration: 'WP CAS-4829', vin: 'MRH53GF8309485', make: 'Toyota', model: 'Aqua', year: 2015, engine: '1NZ-FXE 1.5L', mileage: 84320, customerId: 'c1', createdAt: '2026-05-10T10:05:00Z' },
  { id: 'v2', registration: 'WP CAD-1940', vin: 'KL828392819385', make: 'Suzuki', model: 'Wagon R (Hybrid)', year: 2017, engine: 'R06A 660cc', mileage: 42150, customerId: 'c2', createdAt: '2026-06-01T11:40:00Z' },
  { id: 'v3', registration: 'WP CAB-8851', vin: 'NCP131-049581', make: 'Toyota', model: 'Vitz', year: 2014, engine: '1KR-FE 1.0L', mileage: 112400, customerId: 'c3', createdAt: '2026-06-15T09:20:00Z' },
  { id: 'v4', registration: 'WP CBH-2030', vin: 'RU3-10928410', make: 'Honda', model: 'Vezel', year: 2016, engine: 'LEB-H1 1.5L', mileage: 73500, customerId: 'c4', createdAt: '2026-07-02T14:25:00Z' },
];

export const mockServices: ServiceTemplate[] = [
  { id: 's1', name: 'Engine oil & filter change', description: 'Drain old oil, replace oil filter, and fill with premium engine oil.', category: 'maintenance', defaultPrice: 9500, isFavorite: true },
  { id: 's2', name: 'Remove brake pads and clean', description: 'Disassemble front/rear brakes, clean slider pins, inspect calipers, lubricate, and adjust.', category: 'brakes', defaultPrice: 2500, isFavorite: true },
  { id: 's3', name: 'Replace front brake pads', description: 'Install brand new high-quality front brake pads.', category: 'brakes', defaultPrice: 6800, isFavorite: false },
  { id: 's4', name: 'Replace rear brake pads', description: 'Install brand new high-quality rear brake pads.', category: 'brakes', defaultPrice: 6500, isFavorite: false },
  { id: 's5', name: 'Brake disc machining', description: 'Resurface disc rotors on both front wheels to eliminate vibration and brake squealing.', category: 'brakes', defaultPrice: 4000, isFavorite: false },
  { id: 's6', name: 'AC service', description: 'AC gas top-up, filter clean, condenser wash, blower cleaning, and temperature diagnostic.', category: 'ac', defaultPrice: 8500, isFavorite: true },
  { id: 's7', name: 'Computer diagnostics', description: 'Plug OBD scanner, retrieve fault codes (DTC), diagnose electrical issues, reset warnings.', category: 'diagnostics', defaultPrice: 3500, isFavorite: true },
  { id: 's8', name: 'Suspension inspection', description: 'Full inspection of shocks, bushes, tie rods, ball joints, and steering rack.', category: 'suspension', defaultPrice: 2000, isFavorite: false },
];

export const mockParts: Part[] = [
  { id: 'p1', barcode: '8801234560012', partNumber: 'TOY-15601', name: 'Toyota Aqua Genuine Oil Filter', supplier: 'Lanka Toyota Parts', purchasePrice: 1200, sellingPrice: 1850, stock: 4, minStock: 5, category: 'Filters' },
  { id: 'p2', barcode: '4902345670023', partNumber: 'MOBIL1-5W30', name: 'Mobil 1 Super 5W-30 (4L)', supplier: 'United Motors PLC', purchasePrice: 12500, sellingPrice: 15500, stock: 15, minStock: 6, category: 'Lubricants' },
  { id: 'p3', barcode: '4548293021948', partNumber: 'BP-FR-VITZ', name: 'Aisin Front Brake Pads (Vitz/Aqua)', supplier: 'Ranjith Motors', purchasePrice: 4500, sellingPrice: 6500, stock: 2, minStock: 4, category: 'Brakes' },
  { id: 'p4', barcode: '4548293021955', partNumber: 'BP-RE-WAGONR', name: 'Kashiyama Rear Brake Shoes (WagonR)', supplier: 'Asha Motors', purchasePrice: 3800, sellingPrice: 5200, stock: 8, minStock: 5, category: 'Brakes' },
  { id: 'p5', barcode: '8801122334455', partNumber: 'NGK-IZFR6K', name: 'NGK Iridium Spark Plug', supplier: 'Senok Trade', purchasePrice: 2200, sellingPrice: 3200, stock: 12, minStock: 10, category: 'Electrical' },
  { id: 'p6', barcode: '9003849102941', partNumber: 'AC-CAB-VEZEL', name: 'Honda Vezel Cabin AC Filter', supplier: 'United Motors PLC', purchasePrice: 1500, sellingPrice: 2500, stock: 3, minStock: 5, category: 'Filters' },
];

export const mockJobCards: JobCard[] = [
  {
    id: 'j1',
    jobNo: 'JOB-2026-0001',
    vehicleId: 'v1',
    customerId: 'c1',
    mechanicId: 'u4',
    status: 'in_progress',
    notes: 'Engine tune-up and check brake pads due to squeaking noise.',
    serviceIds: ['s1', 's2'],
    customServices: [],
    itemsNeeded: [
      { partId: 'p1', qty: 1, name: 'Toyota Aqua Genuine Oil Filter', price: 1850 },
      { partId: 'p2', qty: 1, name: 'Mobil 1 Super 5W-30 (4L)', price: 15500 },
    ],
    cost: 29350,
    createdAt: '2026-07-19T08:30:00Z',
    updatedAt: '2026-07-19T09:15:00Z',
  },
  {
    id: 'j2',
    jobNo: 'JOB-2026-0002',
    vehicleId: 'v2',
    customerId: 'c2',
    mechanicId: 'u5',
    status: 'waiting',
    notes: 'Hybrid battery health check and general checkup before a long trip.',
    serviceIds: ['s7'],
    customServices: [{ name: 'Hybrid Battery Fan Cleaning', price: 1500 }],
    itemsNeeded: [],
    cost: 5000,
    createdAt: '2026-07-19T09:45:00Z',
    updatedAt: '2026-07-19T09:45:00Z',
  },
  {
    id: 'j3',
    jobNo: 'JOB-2026-0003',
    vehicleId: 'v3',
    customerId: 'c3',
    mechanicId: 'u4',
    status: 'completed',
    notes: 'Brake disc rotor shuddering at high speed. Machine rotor and replace pads.',
    serviceIds: ['s3', 's5'],
    customServices: [],
    itemsNeeded: [
      { partId: 'p3', qty: 1, name: 'Aisin Front Brake Pads (Vitz/Aqua)', price: 6500 },
    ],
    cost: 17300,
    createdAt: '2026-07-18T10:00:00Z',
    updatedAt: '2026-07-18T14:30:00Z',
  },
];

export const mockInvoices: Invoice[] = [
  {
    id: 'i1',
    invoiceNo: 'INV-2026-0001',
    jobCardId: 'j3',
    customerId: 'c3',
    vehicleId: 'v3',
    services: [
      { name: 'Replace front brake pads', price: 6800 },
      { name: 'Brake disc machining', price: 4000 },
    ],
    parts: [
      { partId: 'p3', name: 'Aisin Front Brake Pads (Vitz/Aqua)', qty: 1, price: 6500 },
    ],
    discount: 1000,
    tax: 1200,
    total: 16300,
    paid: true,
    notes: 'Paid via commercial bank card. Disc shuddering completely resolved.',
    status: 'paid',
    createdAt: '2026-07-18T15:00:00Z',
  },
  {
    id: 'i2',
    invoiceNo: 'INV-2026-0002',
    jobCardId: undefined, // direct counter invoice
    customerId: 'c1',
    vehicleId: 'v1',
    services: [],
    parts: [
      { partId: 'p2', name: 'Mobil 1 Super 5W-30 (4L)', qty: 1, price: 15500 },
    ],
    discount: 500,
    tax: 0,
    total: 15000,
    paid: false,
    notes: 'Counter sales of engine oil. Customer will pay by tomorrow.',
    status: 'pending',
    createdAt: '2026-07-19T09:00:00Z',
  },
];

export const mockTransactions: AccountTransaction[] = [
  { id: 't1', type: 'cash_in', category: 'income', amount: 16300, description: 'Invoice payment for INV-2026-0001', bankAccount: 'Commercial Bank', date: '2026-07-18' },
  { id: 't2', type: 'cash_out', category: 'expense', amount: 3500, description: 'Workshop tea & snacks', bankAccount: 'Cash Drawer', date: '2026-07-19' },
  { id: 't3', type: 'cash_out', category: 'supplier', amount: 25000, description: 'Payment to United Motors PLC for lubricants', bankAccount: 'Commercial Bank', date: '2026-07-17' },
  { id: 't4', type: 'cash_in', category: 'income', amount: 8000, description: 'Advance payment for full vehicle service', bankAccount: 'Cash Drawer', date: '2026-07-19' },
  { id: 't5', type: 'cash_out', category: 'expense', amount: 12000, description: 'Electricity Bill', bankAccount: 'Sampath Bank', date: '2026-07-15' },
];

export const mockActivityLogs: ActivityLog[] = [
  { id: 'l1', userId: 'u1', userName: 'Thasrik Tennekoon', role: 'owner', action: 'Login', details: 'Owner logged in successfully.', timestamp: '2026-07-19T08:00:00Z' },
  { id: 'l2', userId: 'u2', userName: 'Ruwan Perera', role: 'manager', action: 'Create Job Card', details: 'Created JOB-2026-0001 for WP CAS-4829', timestamp: '2026-07-19T08:35:00Z' },
  { id: 'l3', userId: 'u3', userName: 'Fathima Nafeesa', role: 'cashier', action: 'Create Direct Invoice', details: 'Created direct parts sales invoice INV-2026-0002', timestamp: '2026-07-19T09:02:00Z' },
];

export const mockNotifications: Notification[] = [
  { id: 'n1', type: 'low_stock', title: 'Low Stock Alert', message: 'Toyota Aqua Genuine Oil Filter stock is 4 (Min: 5)', read: false, timestamp: '2026-07-19T08:00:00Z' },
  { id: 'n2', type: 'low_stock', title: 'Low Stock Alert', message: 'Aisin Front Brake Pads (Vitz/Aqua) stock is 2 (Min: 4)', read: false, timestamp: '2026-07-19T08:30:00Z' },
  { id: 'n3', type: 'pending_invoice', title: 'Pending Invoice Due', message: 'Anura Bandaranaike has outstanding invoice balance of Rs. 15,000.', read: true, timestamp: '2026-07-19T09:05:00Z' },
];
