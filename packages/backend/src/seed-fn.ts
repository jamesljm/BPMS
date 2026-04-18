import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export async function runSeed() {
  console.log('Seeding BPMS database...');

  const passwordHash = await bcrypt.hash('Admin1234', 12);

  // ===== ROLES =====
  const roles = await Promise.all([
    prisma.role.upsert({ where: { name: 'ADMIN' }, update: {}, create: { name: 'ADMIN', description: 'System administrator — full access', isSystem: true } }),
    prisma.role.upsert({ where: { name: 'PROJECT_MANAGER' }, update: {}, create: { name: 'PROJECT_MANAGER', description: 'Manages projects, piles, movements', isSystem: true } }),
    prisma.role.upsert({ where: { name: 'SITE_ENGINEER' }, update: {}, create: { name: 'SITE_ENGINEER', description: 'Creates piles, reads/creates movements', isSystem: true } }),
    prisma.role.upsert({ where: { name: 'STORE_KEEPER' }, update: {}, create: { name: 'STORE_KEEPER', description: 'Manages stock codes, movements, inventory', isSystem: true } }),
    prisma.role.upsert({ where: { name: 'MECHANIC' }, update: {}, create: { name: 'MECHANIC', description: 'Manages maintenance and equipment', isSystem: true } }),
    prisma.role.upsert({ where: { name: 'QC_INSPECTOR' }, update: {}, create: { name: 'QC_INSPECTOR', description: 'Manages inspections and certifications', isSystem: true } }),
    prisma.role.upsert({ where: { name: 'VIEWER' }, update: {}, create: { name: 'VIEWER', description: 'Read-only access', isSystem: true } }),
  ]);
  const [adminRole, pmRole, seRole, skRole, mechRole, qcRole, viewerRole] = roles;

  // ===== PERMISSIONS =====
  const allResources = ['USERS','ROLES','PLACES','PROJECTS','PILES','STOCK_CODES','UOMS','INVENTORY','MOVEMENTS','ASSEMBLIES','MAINTENANCE','PM_SCHEDULES','APPROVALS','DASHBOARD','REPORTS','NOTIFICATIONS','FILES','CERTIFICATIONS','AUDIT','SETTINGS'];
  const allActions = ['CREATE','READ','UPDATE','DELETE','APPROVE','DISPATCH','RECEIVE','TRANSITION','EXPORT'];

  // ADMIN: everything
  for (const resource of allResources) {
    for (const action of allActions) {
      await prisma.rolePermission.upsert({ where: { roleId_resource_action: { roleId: adminRole.id, resource, action } }, update: {}, create: { roleId: adminRole.id, resource, action, scope: 'ALL' } });
    }
  }

  // PM
  for (const resource of ['PROJECTS','PILES','MOVEMENTS','MAINTENANCE','PM_SCHEDULES','ASSEMBLIES','FILES','DASHBOARD','REPORTS']) {
    for (const action of ['CREATE','READ','UPDATE','APPROVE','TRANSITION','EXPORT']) {
      await prisma.rolePermission.upsert({ where: { roleId_resource_action: { roleId: pmRole.id, resource, action } }, update: {}, create: { roleId: pmRole.id, resource, action, scope: 'OWN_PROJECT' } });
    }
  }

  // SE
  for (const resource of ['PILES','MOVEMENTS','FILES']) {
    for (const action of ['CREATE','READ']) {
      await prisma.rolePermission.upsert({ where: { roleId_resource_action: { roleId: seRole.id, resource, action } }, update: {}, create: { roleId: seRole.id, resource, action, scope: 'OWN_PROJECT' } });
    }
  }
  await prisma.rolePermission.upsert({ where: { roleId_resource_action: { roleId: seRole.id, resource: 'PILES', action: 'TRANSITION' } }, update: {}, create: { roleId: seRole.id, resource: 'PILES', action: 'TRANSITION', scope: 'OWN_PROJECT' } });
  for (const resource of ['PROJECTS','STOCK_CODES','INVENTORY','DASHBOARD']) {
    await prisma.rolePermission.upsert({ where: { roleId_resource_action: { roleId: seRole.id, resource, action: 'READ' } }, update: {}, create: { roleId: seRole.id, resource, action: 'READ', scope: 'OWN_PROJECT' } });
  }

  // SK
  for (const resource of ['STOCK_CODES','MOVEMENTS','INVENTORY','UOMS','PLACES','FILES']) {
    for (const action of ['CREATE','READ','UPDATE']) {
      await prisma.rolePermission.upsert({ where: { roleId_resource_action: { roleId: skRole.id, resource, action } }, update: {}, create: { roleId: skRole.id, resource, action, scope: 'ALL' } });
    }
  }
  for (const action of ['DISPATCH','RECEIVE']) {
    await prisma.rolePermission.upsert({ where: { roleId_resource_action: { roleId: skRole.id, resource: 'MOVEMENTS', action } }, update: {}, create: { roleId: skRole.id, resource: 'MOVEMENTS', action, scope: 'ALL' } });
  }
  await prisma.rolePermission.upsert({ where: { roleId_resource_action: { roleId: skRole.id, resource: 'DASHBOARD', action: 'READ' } }, update: {}, create: { roleId: skRole.id, resource: 'DASHBOARD', action: 'READ', scope: 'ALL' } });

  // MECH
  for (const resource of ['MAINTENANCE','PM_SCHEDULES','ASSEMBLIES','CERTIFICATIONS','FILES']) {
    for (const action of ['CREATE','READ','UPDATE']) {
      await prisma.rolePermission.upsert({ where: { roleId_resource_action: { roleId: mechRole.id, resource, action } }, update: {}, create: { roleId: mechRole.id, resource, action, scope: 'ALL' } });
    }
  }
  for (const resource of ['STOCK_CODES','INVENTORY','DASHBOARD']) {
    await prisma.rolePermission.upsert({ where: { roleId_resource_action: { roleId: mechRole.id, resource, action: 'READ' } }, update: {}, create: { roleId: mechRole.id, resource, action: 'READ', scope: 'ALL' } });
  }

  // QC
  for (const resource of ['PILES','CERTIFICATIONS','FILES']) {
    for (const action of ['CREATE','READ','UPDATE']) {
      await prisma.rolePermission.upsert({ where: { roleId_resource_action: { roleId: qcRole.id, resource, action } }, update: {}, create: { roleId: qcRole.id, resource, action, scope: 'ALL' } });
    }
  }
  await prisma.rolePermission.upsert({ where: { roleId_resource_action: { roleId: qcRole.id, resource: 'PILES', action: 'TRANSITION' } }, update: {}, create: { roleId: qcRole.id, resource: 'PILES', action: 'TRANSITION', scope: 'ALL' } });
  for (const resource of ['PROJECTS','STOCK_CODES','DASHBOARD']) {
    await prisma.rolePermission.upsert({ where: { roleId_resource_action: { roleId: qcRole.id, resource, action: 'READ' } }, update: {}, create: { roleId: qcRole.id, resource, action: 'READ', scope: 'ALL' } });
  }

  // VIEWER
  for (const resource of allResources) {
    await prisma.rolePermission.upsert({ where: { roleId_resource_action: { roleId: viewerRole.id, resource, action: 'READ' } }, update: {}, create: { roleId: viewerRole.id, resource, action: 'READ', scope: 'ALL' } });
  }

  // ===== USERS =====
  const users = await Promise.all([
    prisma.user.upsert({ where: { email: 'admin@bpms.com' }, update: {}, create: { email: 'admin@bpms.com', name: 'System Admin', passwordHash, phone: '+60123456789' } }),
    prisma.user.upsert({ where: { email: 'pm1@bpms.com' }, update: {}, create: { email: 'pm1@bpms.com', name: 'Ahmad Razak (PM)', passwordHash, phone: '+60123456790' } }),
    prisma.user.upsert({ where: { email: 'pm2@bpms.com' }, update: {}, create: { email: 'pm2@bpms.com', name: 'Siti Aminah (PM)', passwordHash, phone: '+60123456791' } }),
    prisma.user.upsert({ where: { email: 'eng1@bpms.com' }, update: {}, create: { email: 'eng1@bpms.com', name: 'Raj Kumar (Eng)', passwordHash, phone: '+60123456792' } }),
    prisma.user.upsert({ where: { email: 'eng2@bpms.com' }, update: {}, create: { email: 'eng2@bpms.com', name: 'Lee Wei Ming (Eng)', passwordHash, phone: '+60123456793' } }),
    prisma.user.upsert({ where: { email: 'store@bpms.com' }, update: {}, create: { email: 'store@bpms.com', name: 'Muthu Rajan (Store)', passwordHash, phone: '+60123456794' } }),
    prisma.user.upsert({ where: { email: 'mech@bpms.com' }, update: {}, create: { email: 'mech@bpms.com', name: 'Azman Yusof (Mech)', passwordHash, phone: '+60123456795' } }),
    prisma.user.upsert({ where: { email: 'qc@bpms.com' }, update: {}, create: { email: 'qc@bpms.com', name: 'Farah Nadia (QC)', passwordHash, phone: '+60123456796' } }),
    prisma.user.upsert({ where: { email: 'viewer@bpms.com' }, update: {}, create: { email: 'viewer@bpms.com', name: 'Chong Mei Ling (Viewer)', passwordHash, phone: '+60123456797' } }),
    prisma.user.upsert({ where: { email: 'jiemin@bpms.com' }, update: {}, create: { email: 'jiemin@bpms.com', name: 'Lee Jie Min', passwordHash, phone: '+60123456798' } }),
  ]);
  const [admin, pm1, pm2, eng1, eng2, store, mech, qc, viewer, jiemin] = users;

  // ===== USER ROLES =====
  const assignments = [
    { userId: admin.id, roleId: adminRole.id }, { userId: pm1.id, roleId: pmRole.id },
    { userId: pm2.id, roleId: pmRole.id }, { userId: eng1.id, roleId: seRole.id },
    { userId: eng2.id, roleId: seRole.id }, { userId: store.id, roleId: skRole.id },
    { userId: mech.id, roleId: mechRole.id }, { userId: qc.id, roleId: qcRole.id },
    { userId: viewer.id, roleId: viewerRole.id }, { userId: jiemin.id, roleId: adminRole.id },
  ];
  for (const ra of assignments) {
    const existing = await prisma.userRole.findFirst({ where: { userId: ra.userId, roleId: ra.roleId, projectId: null } });
    if (!existing) await prisma.userRole.create({ data: { userId: ra.userId, roleId: ra.roleId } });
  }

  // ===== PLACES =====
  await Promise.all([
    prisma.place.upsert({ where: { code: 'KLT-SITE' }, update: {}, create: { code: 'KLT-SITE', name: 'KL Tower Foundation Site', type: 'PROJECT', address: 'Jalan Ampang, Kuala Lumpur', lat: 3.1534, lng: 101.7111 } }),
    prisma.place.upsert({ where: { code: 'JBI-SITE' }, update: {}, create: { code: 'JBI-SITE', name: 'JB Interchange Project Site', type: 'PROJECT', address: 'Johor Bahru, Johor', lat: 1.4927, lng: 103.7414 } }),
    prisma.place.upsert({ where: { code: 'HQ-WH' }, update: {}, create: { code: 'HQ-WH', name: 'HQ Main Warehouse', type: 'WAREHOUSE', address: 'Shah Alam, Selangor', lat: 3.0738, lng: 101.5183 } }),
    prisma.place.upsert({ where: { code: 'HQ-WS' }, update: {}, create: { code: 'HQ-WS', name: 'HQ Workshop', type: 'WORKSHOP', address: 'Shah Alam, Selangor', lat: 3.0740, lng: 101.5185 } }),
    prisma.place.upsert({ where: { code: 'YARD-A' }, update: {}, create: { code: 'YARD-A', name: 'Open Storage Yard A', type: 'YARD', address: 'Klang, Selangor', lat: 3.0440, lng: 101.4455 } }),
    prisma.place.upsert({ where: { code: 'YARD-B' }, update: {}, create: { code: 'YARD-B', name: 'Open Storage Yard B', type: 'YARD', address: 'Rawang, Selangor', lat: 3.3200, lng: 101.5800 } }),
    prisma.place.upsert({ where: { code: 'VND-SME' }, update: {}, create: { code: 'VND-SME', name: 'SME Steel Supplier', type: 'VENDOR', address: 'Penang' } }),
    prisma.place.upsert({ where: { code: 'SCRAP-01' }, update: {}, create: { code: 'SCRAP-01', name: 'Scrap Disposal Yard', type: 'SCRAP', address: 'Klang, Selangor' } }),
  ]);

  // ===== UOMs =====
  const uomData = [
    { code: 'EA', name: 'Each' }, { code: 'KG', name: 'Kilogram' }, { code: 'TON', name: 'Metric Ton' },
    { code: 'M', name: 'Metre' }, { code: 'M2', name: 'Square Metre' }, { code: 'M3', name: 'Cubic Metre' },
    { code: 'L', name: 'Litre' }, { code: 'SET', name: 'Set' }, { code: 'HR', name: 'Hour' },
    { code: 'PAIR', name: 'Pair' }, { code: 'ROLL', name: 'Roll' }, { code: 'BAG', name: 'Bag' },
    { code: 'BOX', name: 'Box' }, { code: 'DRUM', name: 'Drum' }, { code: 'TRIP', name: 'Trip' },
  ];
  for (const u of uomData) {
    await prisma.uom.upsert({ where: { code: u.code }, update: {}, create: u });
  }

  console.log('Seed completed: 7 roles, 10 users, 8 places, 15 UOMs');
}
