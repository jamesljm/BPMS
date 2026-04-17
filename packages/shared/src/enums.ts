// ===== Auth & Users =====
export const SystemRole = {
  ADMIN: 'ADMIN',
  PROJECT_MANAGER: 'PROJECT_MANAGER',
  SITE_ENGINEER: 'SITE_ENGINEER',
  STORE_KEEPER: 'STORE_KEEPER',
  MECHANIC: 'MECHANIC',
  QC_INSPECTOR: 'QC_INSPECTOR',
  VIEWER: 'VIEWER',
} as const;
export type SystemRole = (typeof SystemRole)[keyof typeof SystemRole];

export const PermissionScope = {
  ALL: 'ALL',
  OWN_PROJECT: 'OWN_PROJECT',
  OWN: 'OWN',
} as const;
export type PermissionScope = (typeof PermissionScope)[keyof typeof PermissionScope];

export const PermissionAction = {
  CREATE: 'CREATE',
  READ: 'READ',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  APPROVE: 'APPROVE',
  DISPATCH: 'DISPATCH',
  RECEIVE: 'RECEIVE',
  TRANSITION: 'TRANSITION',
  EXPORT: 'EXPORT',
} as const;
export type PermissionAction = (typeof PermissionAction)[keyof typeof PermissionAction];

export const Resource = {
  USERS: 'USERS',
  ROLES: 'ROLES',
  PLACES: 'PLACES',
  PROJECTS: 'PROJECTS',
  PILES: 'PILES',
  STOCK_CODES: 'STOCK_CODES',
  UOMS: 'UOMS',
  INVENTORY: 'INVENTORY',
  MOVEMENTS: 'MOVEMENTS',
  ASSEMBLIES: 'ASSEMBLIES',
  MAINTENANCE: 'MAINTENANCE',
  PM_SCHEDULES: 'PM_SCHEDULES',
  APPROVALS: 'APPROVALS',
  DASHBOARD: 'DASHBOARD',
  REPORTS: 'REPORTS',
  NOTIFICATIONS: 'NOTIFICATIONS',
  FILES: 'FILES',
  CERTIFICATIONS: 'CERTIFICATIONS',
  AUDIT: 'AUDIT',
  SETTINGS: 'SETTINGS',
} as const;
export type Resource = (typeof Resource)[keyof typeof Resource];

// ===== Places =====
export const PlaceType = {
  PROJECT: 'PROJECT',
  WAREHOUSE: 'WAREHOUSE',
  WORKSHOP: 'WORKSHOP',
  YARD: 'YARD',
  VENDOR: 'VENDOR',
  SCRAP: 'SCRAP',
} as const;
export type PlaceType = (typeof PlaceType)[keyof typeof PlaceType];

// ===== Projects =====
export const ProjectStatus = {
  PLANNING: 'PLANNING',
  ACTIVE: 'ACTIVE',
  ON_HOLD: 'ON_HOLD',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;
export type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus];

export const ProjectRole = {
  PROJECT_MANAGER: 'PROJECT_MANAGER',
  SITE_ENGINEER: 'SITE_ENGINEER',
  SITE_SUPERVISOR: 'SITE_SUPERVISOR',
  QC_INSPECTOR: 'QC_INSPECTOR',
  STORE_KEEPER: 'STORE_KEEPER',
  MECHANIC: 'MECHANIC',
  VIEWER: 'VIEWER',
} as const;
export type ProjectRole = (typeof ProjectRole)[keyof typeof ProjectRole];

// ===== Piles =====
export const PileStatus = {
  PLANNED: 'PLANNED',
  BORED: 'BORED',
  CAGED: 'CAGED',
  CONCRETED: 'CONCRETED',
  TESTED: 'TESTED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  ON_HOLD: 'ON_HOLD',
} as const;
export type PileStatus = (typeof PileStatus)[keyof typeof PileStatus];

// ===== Stock Codes =====
export const MaintenancePolicy = {
  NONE: 'NONE',
  PREVENTIVE: 'PREVENTIVE',
  CALIBRATION: 'CALIBRATION',
  BOTH: 'BOTH',
} as const;
export type MaintenancePolicy = (typeof MaintenancePolicy)[keyof typeof MaintenancePolicy];

export const StockCodeCategory = {
  EQUIPMENT: 'EQUIPMENT',
  MATERIAL: 'MATERIAL',
  CONSUMABLE: 'CONSUMABLE',
  TOOL: 'TOOL',
  SPARE_PART: 'SPARE_PART',
} as const;
export type StockCodeCategory = (typeof StockCodeCategory)[keyof typeof StockCodeCategory];

// ===== Movements =====
export const MovementIntent = {
  DISPATCH: 'DISPATCH',
  SITE_TRANSFER: 'SITE_TRANSFER',
  RETURN: 'RETURN',
  WRITE_OFF: 'WRITE_OFF',
  RECEIPT: 'RECEIPT',
  SCRAP: 'SCRAP',
} as const;
export type MovementIntent = (typeof MovementIntent)[keyof typeof MovementIntent];

export const MovementStatus = {
  DRAFT: 'DRAFT',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  IN_TRANSIT: 'IN_TRANSIT',
  RECEIVED: 'RECEIVED',
  PARTIALLY_RECEIVED: 'PARTIALLY_RECEIVED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;
export type MovementStatus = (typeof MovementStatus)[keyof typeof MovementStatus];

export const LedgerDirection = {
  IN: 'IN',
  OUT: 'OUT',
} as const;
export type LedgerDirection = (typeof LedgerDirection)[keyof typeof LedgerDirection];

// ===== Assemblies =====
export const MountAction = {
  MOUNT: 'MOUNT',
  UNMOUNT: 'UNMOUNT',
} as const;
export type MountAction = (typeof MountAction)[keyof typeof MountAction];

// ===== Maintenance =====
export const WoStatus = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  AWAITING_PARTS: 'AWAITING_PARTS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;
export type WoStatus = (typeof WoStatus)[keyof typeof WoStatus];

export const WoType = {
  PREVENTIVE: 'PREVENTIVE',
  CORRECTIVE: 'CORRECTIVE',
  BREAKDOWN: 'BREAKDOWN',
  CALIBRATION: 'CALIBRATION',
} as const;
export type WoType = (typeof WoType)[keyof typeof WoType];

export const WoPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;
export type WoPriority = (typeof WoPriority)[keyof typeof WoPriority];

export const PmFrequency = {
  TIME: 'TIME',
  METER: 'METER',
  COMPOUND: 'COMPOUND',
} as const;
export type PmFrequency = (typeof PmFrequency)[keyof typeof PmFrequency];

export const PmInstanceStatus = {
  UPCOMING: 'UPCOMING',
  DUE: 'DUE',
  OVERDUE: 'OVERDUE',
  COMPLETED: 'COMPLETED',
  SKIPPED: 'SKIPPED',
} as const;
export type PmInstanceStatus = (typeof PmInstanceStatus)[keyof typeof PmInstanceStatus];

// ===== Approvals =====
export const ApprovalEntityType = {
  MOVEMENT: 'MOVEMENT',
  STOCK_ADJUSTMENT: 'STOCK_ADJUSTMENT',
  WRITE_OFF: 'WRITE_OFF',
  WORK_ORDER: 'WORK_ORDER',
} as const;
export type ApprovalEntityType = (typeof ApprovalEntityType)[keyof typeof ApprovalEntityType];

export const ApprovalStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
} as const;
export type ApprovalStatus = (typeof ApprovalStatus)[keyof typeof ApprovalStatus];

// ===== Asset Condition =====
export const AssetCondition = {
  GREEN: 'GREEN',
  AMBER: 'AMBER',
  RED: 'RED',
} as const;
export type AssetCondition = (typeof AssetCondition)[keyof typeof AssetCondition];

// ===== Notifications =====
export const NotificationChannel = {
  IN_APP: 'IN_APP',
  EMAIL: 'EMAIL',
} as const;
export type NotificationChannel = (typeof NotificationChannel)[keyof typeof NotificationChannel];

// ===== Audit =====
export const AuditAction = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  TRANSITION: 'TRANSITION',
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
  DISPATCH: 'DISPATCH',
  RECEIVE: 'RECEIVE',
  MOUNT: 'MOUNT',
  UNMOUNT: 'UNMOUNT',
} as const;
export type AuditAction = (typeof AuditAction)[keyof typeof AuditAction];

// ===== Acumatica =====
export const SyncDirection = {
  INBOUND: 'INBOUND',
  OUTBOUND: 'OUTBOUND',
} as const;
export type SyncDirection = (typeof SyncDirection)[keyof typeof SyncDirection];

export const SyncStatus = {
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  PARTIAL: 'PARTIAL',
} as const;
export type SyncStatus = (typeof SyncStatus)[keyof typeof SyncStatus];

// ===== Alerts =====
export const AlertSeverity = {
  INFO: 'INFO',
  WARNING: 'WARNING',
  CRITICAL: 'CRITICAL',
} as const;
export type AlertSeverity = (typeof AlertSeverity)[keyof typeof AlertSeverity];

export const AlertType = {
  SAFETY_STOCK: 'SAFETY_STOCK',
  CERT_EXPIRY: 'CERT_EXPIRY',
  PM_OVERDUE: 'PM_OVERDUE',
  MOVEMENT_STALE: 'MOVEMENT_STALE',
  RECONCILIATION_MISMATCH: 'RECONCILIATION_MISMATCH',
} as const;
export type AlertType = (typeof AlertType)[keyof typeof AlertType];
