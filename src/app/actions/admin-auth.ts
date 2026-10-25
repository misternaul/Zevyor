'use server';

import { db } from '@/lib/db';
import {
  ADMIN_COOKIE_NAME,
  createAdminSession,
  getCurrentAdmin,
  hashToken,
  invalidateSession,
  logAuditEvent,
  SESSION_MAX_AGE_SECONDS,
  verifyPasscode,
} from '@/lib/auth';
import { cookies, headers } from 'next/headers';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export async function loginWithPasscode(passcode: string) {
  if (!passcode || typeof passcode !== 'string' || passcode.trim().length === 0) {
    return { success: false, error: 'Please enter your administrative passcode.' };
  }

  const cleanPasscode = passcode.trim();
  const headerList = headers();
  const ipAddress = headerList.get('x-forwarded-for') || headerList.get('x-real-ip') || '127.0.0.1';
  const userAgent = headerList.get('user-agent') || 'Unknown';

  // Find all active passcodes
  const activePasscodes = await db.adminPasscode.findMany({
    where: { isActive: true },
  });

  if (activePasscodes.length === 0) {
    return {
      success: false,
      error: 'No active administrator passcodes exist. Please run the server bootstrap command.',
    };
  }

  const now = new Date();
  let matchedPasscode = null;

  for (const pc of activePasscodes) {
    // Check if passcode is temporarily locked out
    if (pc.lockedUntil && pc.lockedUntil > now) {
      continue;
    }

    const isMatch = await verifyPasscode(cleanPasscode, pc.hashedPasscode);
    if (isMatch) {
      matchedPasscode = pc;
      break;
    }
  }

  if (!matchedPasscode) {
    // Record failed attempt on any matching owner/passcode candidate
    const owner = activePasscodes.find((p) => p.isOwner);
    if (owner) {
      const attempts = owner.failedAttempts + 1;
      const lockedUntil =
        attempts >= MAX_FAILED_ATTEMPTS
          ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000)
          : null;

      await db.adminPasscode.update({
        where: { id: owner.id },
        data: {
          failedAttempts: attempts,
          lockedUntil,
        },
      });

      if (lockedUntil) {
        await logAuditEvent({
          passcodeId: owner.id,
          passcodeLabel: owner.label,
          action: 'LOGIN_LOCKED',
          entity: 'AdminPasscode',
          entityId: owner.id,
          changeSummary: `Passcode locked for ${LOCKOUT_MINUTES} minutes due to ${attempts} consecutive failed attempts.`,
          ipAddress,
        });

        return {
          success: false,
          error: `Too many failed attempts. Passcode access temporarily suspended for ${LOCKOUT_MINUTES} minutes.`,
        };
      }
    }

    await logAuditEvent({
      action: 'LOGIN_FAILED',
      entity: 'AdminSession',
      changeSummary: `Invalid administrative passcode submitted from IP ${ipAddress}.`,
      ipAddress,
    });

    return { success: false, error: 'Invalid administrative passcode. Please verify and try again.' };
  }

  // Reset failed attempts on success
  await db.adminPasscode.update({
    where: { id: matchedPasscode.id },
    data: {
      failedAttempts: 0,
      lockedUntil: null,
      lastLoginAt: now,
    },
  });

  // Create session
  const { rawToken } = await createAdminSession(matchedPasscode.id, userAgent, ipAddress);

  // Set secure cookie
  cookies().set(ADMIN_COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: '/',
  });

  await logAuditEvent({
    passcodeId: matchedPasscode.id,
    passcodeLabel: matchedPasscode.label,
    action: 'LOGIN_SUCCESS',
    entity: 'AdminSession',
    entityId: matchedPasscode.id,
    changeSummary: `Successful administrative login by "${matchedPasscode.label}" (${matchedPasscode.isOwner ? 'Owner' : 'Staff'}).`,
    ipAddress,
  });

  return { success: true };
}

export async function adminLogout() {
  const cookieStore = cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (token) {
    const tokenHash = hashToken(token);
    await invalidateSession(tokenHash);
  }

  cookieStore.delete(ADMIN_COOKIE_NAME);
  return { success: true };
}

export async function verifyCurrentAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return { authenticated: false };
  }
  return {
    authenticated: true,
    admin: {
      id: admin.passcodeId,
      label: admin.label,
      isOwner: admin.isOwner,
      permissions: admin.permissions,
    },
  };
}
