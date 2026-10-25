import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const PERMISSION_MODULES = [
  'DASHBOARD',
  'PRODUCTS',
  'CATEGORIES',
  'INVENTORY',
  'ORDERS',
  'CUSTOMERS',
  'COUPONS',
  'BUNDLES',
  'DELIVERY',
  'HOMEPAGE',
  'LOOKBOOK',
  'REVIEWS',
  'SETTINGS',
  'PASSCODES',
  'AUDIT_LOGS',
];

async function bootstrap() {
  const passcode = process.argv[2] || process.env.OWNER_BOOTSTRAP_PASSCODE;

  if (!passcode || passcode.length < 6) {
    console.error('Error: Please provide an owner passcode of at least 6 characters via OWNER_BOOTSTRAP_PASSCODE or command line.');
    process.exit(1);
  }

  const hashed = await bcrypt.hash(passcode, 12);

  // Check if owner passcode exists
  const existingOwner = await prisma.adminPasscode.findFirst({
    where: { isOwner: true },
  });

  let ownerId;
  if (existingOwner) {
    console.log(`Updating existing Owner passcode (ID: ${existingOwner.id})...`);
    await prisma.adminPasscode.update({
      where: { id: existingOwner.id },
      data: {
        hashedPasscode: hashed,
        isActive: true,
        failedAttempts: 0,
        lockedUntil: null,
      },
    });
    ownerId = existingOwner.id;
  } else {
    console.log('Creating initial Owner passcode...');
    const created = await prisma.adminPasscode.create({
      data: {
        label: 'Owner Primary',
        hashedPasscode: hashed,
        isOwner: true,
        isActive: true,
      },
    });
    ownerId = created.id;
  }

  // Ensure all permissions exist for the owner
  for (const module of PERMISSION_MODULES) {
    await prisma.adminPermission.upsert({
      where: {
        passcodeId_module: {
          passcodeId: ownerId,
          module,
        },
      },
      update: {
        canView: true,
        canEdit: true,
      },
      create: {
        passcodeId: ownerId,
        module,
        canView: true,
        canEdit: true,
      },
    });
  }

  await prisma.auditLog.create({
    data: {
      passcodeId: ownerId,
      passcodeLabel: 'Owner Primary',
      action: 'BOOTSTRAP_OWNER',
      entity: 'AdminPasscode',
      entityId: ownerId,
      changeSummary: 'Initialized or updated primary owner passcode with full system permissions',
    },
  });

  console.log('✔ Primary owner passcode successfully initialized!');
  console.log('You can now log in at /admin/login');
  await prisma.$disconnect();
}

bootstrap().catch((e) => {
  console.error('Bootstrap failed:', e);
  process.exit(1);
});
