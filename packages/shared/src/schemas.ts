import { z } from 'zod';

// ===== Auth =====
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

// ===== Users =====
export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(200),
  password: z.string().min(8).max(128),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const assignRoleSchema = z.object({
  roleId: z.string().uuid(),
  projectId: z.string().uuid().optional(),
});

// ===== Roles =====
export const createRoleSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  isSystem: z.boolean().optional(),
});

export const updateRoleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
});

export const setPermissionsSchema = z.object({
  permissions: z.array(z.object({
    resource: z.string(),
    action: z.string(),
    scope: z.string().default('ALL'),
  })),
});

// ===== Places =====
export const createPlaceSchema = z.object({
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(200),
  type: z.string(),
  address: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  isActive: z.boolean().optional(),
});

export const updatePlaceSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  type: z.string().optional(),
  address: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  isActive: z.boolean().optional(),
});

// ===== UOMs =====
export const createUomSchema = z.object({
  code: z.string().min(1).max(10),
  name: z.string().min(1).max(100),
});

export const updateUomSchema = z.object({
  name: z.string().min(1).max(100).optional(),
});

// ===== Projects =====
export const createProjectSchema = z.object({
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  placeId: z.string().uuid(),
  status: z.string().default('PLANNING'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  status: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// ===== Piles =====
export const createPileSchema = z.object({
  pileNo: z.string().min(1).max(50),
  projectId: z.string().uuid(),
  designDiameter: z.number().positive(),
  designDepth: z.number().positive(),
  designCapacity: z.number().positive().optional(),
  easting: z.number().optional(),
  northing: z.number().optional(),
});

export const updatePileSchema = z.object({
  designDiameter: z.number().positive().optional(),
  designDepth: z.number().positive().optional(),
  designCapacity: z.number().positive().optional(),
  actualDiameter: z.number().positive().optional(),
  actualDepth: z.number().positive().optional(),
  easting: z.number().optional(),
  northing: z.number().optional(),
});

export const transitionPileSchema = z.object({
  toStatus: z.string(),
  reason: z.string().optional(),
});

// ===== Stock Codes =====
export const createStockCodeSchema = z.object({
  code: z.string().min(1).max(50),
  description: z.string().min(1).max(500),
  category: z.string(),
  uomId: z.string().uuid(),
  // Tags
  isSerialized: z.boolean().default(false),
  carriesAttachments: z.boolean().default(false),
  isOperationalEnabler: z.boolean().default(false),
  receiptRequired: z.boolean().default(false),
  isBulkConsumable: z.boolean().default(false),
  isSingleUse: z.boolean().default(false),
  maintenancePolicy: z.string().default('NONE'),
  requiresCertification: z.boolean().default(false),
  isHighValue: z.boolean().default(false),
  // Asset fields (for serialized)
  make: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  assetTag: z.string().optional(),
  yearManufactured: z.number().int().optional(),
});

export const updateStockCodeSchema = createStockCodeSchema.partial().omit({ code: true });

// ===== Movements =====
export const createMovementSchema = z.object({
  intent: z.string(),
  sourcePlaceId: z.string().uuid().nullable().optional(),
  destPlaceId: z.string().uuid().nullable().optional(),
  projectId: z.string().uuid().optional(),
  metadata: z.record(z.any()).optional(),
  remarks: z.string().optional(),
  lines: z.array(z.object({
    stockCodeId: z.string().uuid(),
    qty: z.number().positive(),
    remarks: z.string().optional(),
  })).min(1),
});

export const receiveMovementSchema = z.object({
  lines: z.array(z.object({
    movementLineId: z.string().uuid(),
    qtyReceived: z.number().min(0),
    remarks: z.string().optional(),
  })).min(1),
});

// ===== Maintenance =====
export const createWoSchema = z.object({
  stockCodeId: z.string().uuid(),
  type: z.string(),
  priority: z.string().default('MEDIUM'),
  description: z.string().min(1),
  placeId: z.string().uuid().optional(),
  pmInstanceId: z.string().uuid().optional(),
});

export const createPmScheduleSchema = z.object({
  stockCodeId: z.string().uuid(),
  name: z.string().min(1).max(200),
  frequency: z.string(),
  intervalDays: z.number().int().positive().optional(),
  intervalMeter: z.number().positive().optional(),
  meterType: z.string().optional(),
  tasks: z.string().optional(),
});

// ===== Approval Chains =====
export const createApprovalChainSchema = z.object({
  name: z.string().min(1).max(200),
  entityType: z.string(),
  conditions: z.record(z.any()).optional(),
  steps: z.array(z.object({
    stepOrder: z.number().int().positive(),
    roleId: z.string().uuid(),
  })).min(1),
});

// ===== Common Query Params =====
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const inventoryTallySchema = z.object({
  placeId: z.string().uuid().optional(),
  stockCodeId: z.string().uuid().optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});
