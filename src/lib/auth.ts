import { db } from './db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { cookies } from 'next/headers';

export const ADMIN_COOKIE_NAME = 'zevyor_admin_session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export const PERMISSION_MODULES = [
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
] as const;

export type PermissionModule = typeof PERMISSION_MODULES[number];
export type PermissionAction = 'VIEW' | 'EDIT';

export function hashPasscode(passcode: string): Promise<string> {
  return bcrypt.hash(passcode, 12);
}

export function verifyPasscode(passcode: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(passcode, hashed);
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function createAdminSession(passcodeId: string, userAgent?: string, ipAddress?: string) {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  const session = await db.adminSession.create({
    data: {
      tokenHash,
      passcodeId,
      expiresAt,
      userAgent: userAgent ? userAgent.substring(0, 255) : null,
      ipAddress: ipAddress ? ipAddress.substring(0, 45) : null,
    },
    include: {
      passcode: {
        include: {
          permissions: true,
        },
      },
    },
  });

  return { session, rawToken, expiresAt };
}

export async function invalidateSession(tokenHash: string) {
  try {
    await db.adminSession.delete({
      where: { tokenHash },
    });
  } catch {
    // Session might already be deleted
  }
}

export async function invalidateAllSessionsForPasscode(passcodeId: string) {
  await db.adminSession.deleteMany({
    where: { passcodeId },
  });
}

export async function getCurrentAdmin() {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return null;
  }

  const tokenHash = hashToken(sessionToken);
  const session = await db.adminSession.findUnique({
    where: { tokenHash },
    include: {
      passcode: {
        include: {
          permissions: true,
        },
      },
    },
  });

  if (!session) {
    return null;
  }

  // Check expiration
  if (session.expiresAt < new Date()) {
    await invalidateSession(tokenHash);
    return null;
  }

  // Check if passcode is active
  if (!session.passcode.isActive) {
    await invalidateSession(tokenHash);
    return null;
  }

  return {
    sessionId: session.id,
    tokenHash,
    passcodeId: session.passcode.id,
    label: session.passcode.label,
    isOwner: session.passcode.isOwner,
    permissions: session.passcode.permissions,
  };
}

export function checkPermission(
  admin: Awaited<ReturnType<typeof getCurrentAdmin>>,
  module: PermissionModule,
  action: PermissionAction = 'VIEW'
): boolean {
  if (!admin) return false;
  if (admin.isOwner) return true; // Owner has full access to all modules

  const perm = admin.permissions.find((p) => p.module === module);
  if (!perm) return false;

  if (action === 'VIEW') {
    return perm.canView || perm.canEdit;
  }
  if (action === 'EDIT') {
    return perm.canEdit;
  }

  return false;
}

export async function logAuditEvent(params: {
  passcodeId?: string | null;
  passcodeLabel?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  changeSummary: string;
  ipAddress?: string | null;
}) {
  try {
    await db.auditLog.create({
      data: {
        passcodeId: params.passcodeId ?? null,
        passcodeLabel: params.passcodeLabel ?? 'System',
        action: params.action,
        entity: params.entity,
        entityId: params.entityId ?? null,
        changeSummary: params.changeSummary,
        ipAddress: params.ipAddress ?? null,
      },
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}
