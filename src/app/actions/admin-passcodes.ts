'use server';

import { db } from '@/lib/db';
import {
  getCurrentAdmin,
  hashPasscode,
  invalidateAllSessionsForPasscode,
  logAuditEvent,
  PERMISSION_MODULES,
  PermissionModule,
} from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const CreatePasscodeSchema = z.object({
  label: z.string().min(2, 'Label/Name must be at least 2 characters'),
  passcode: z.string().min(6, 'Passcode must be at least 6 characters'),
  permissions: z.record(
    z.object({
      canView: z.boolean(),
      canEdit: z.boolean(),
    })
  ),
});

export async function createStaffPasscode(data: unknown) {
  const admin = await getCurrentAdmin();
  if (!admin || !admin.isOwner) {
    return { success: false, error: 'Unauthorized: Only the primary store owner can create administrative passcodes.' };
  }

  const parsed = CreatePasscodeSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message || 'Invalid passcode configuration.' };
  }

  const { label, passcode, permissions } = parsed.data;

  try {
    const hashed = await hashPasscode(passcode);

    const created = await db.$transaction(async (tx) => {
      const newPc = await tx.adminPasscode.create({
        data: {
          label: label.trim(),
          hashedPasscode: hashed,
          isOwner: false,
          isActive: true,
        },
      });

      for (const module of PERMISSION_MODULES) {
        const perm = permissions[module] || { canView: false, canEdit: false };
        await tx.adminPermission.create({
          data: {
            passcodeId: newPc.id,
            module,
            canView: perm.canView || perm.canEdit, // If canEdit, implies canView
            canEdit: perm.canEdit,
          },
        });
      }

      return newPc;
    });

    await logAuditEvent({
      passcodeId: admin.passcodeId,
      passcodeLabel: admin.label,
      action: 'CREATE_PASSCODE',
      entity: 'AdminPasscode',
      entityId: created.id,
      changeSummary: `Owner created new administrative passcode labeled "${created.label}".`,
    });

    revalidatePath('/admin/passcodes');
    return { success: true, passcodeId: created.id };
  } catch (err: any) {
    console.error('createStaffPasscode error:', err.message);
    return { success: false, error: err.message || 'Failed to create passcode.' };
  }
}

export async function updateStaffPasscodePermissions(params: {
  passcodeId: string;
  label?: string;
  newPasscode?: string;
  permissions: Record<string, { canView: boolean; canEdit: boolean }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin || !admin.isOwner) {
    return { success: false, error: 'Unauthorized: Only the primary store owner can update permissions.' };
  }

  try {
    const target = await db.adminPasscode.findUnique({
      where: { id: params.passcodeId },
    });

    if (!target) {
      return { success: false, error: 'Passcode not found.' };
    }

    if (target.isOwner && target.id !== admin.passcodeId) {
      return { success: false, error: 'Cannot modify another owner account.' };
    }

    await db.$transaction(async (tx) => {
      const updateData: any = {};
      if (params.label) updateData.label = params.label.trim();
      if (params.newPasscode && params.newPasscode.trim().length >= 6) {
        updateData.hashedPasscode = await hashPasscode(params.newPasscode.trim());
      }

      if (Object.keys(updateData).length > 0) {
        await tx.adminPasscode.update({
          where: { id: params.passcodeId },
          data: updateData,
        });
      }

      // Update permissions
      for (const module of PERMISSION_MODULES) {
        const perm = params.permissions[module] || { canView: false, canEdit: false };
        await tx.adminPermission.upsert({
          where: {
            passcodeId_module: {
              passcodeId: params.passcodeId,
              module,
            },
          },
          update: {
            canView: perm.canView || perm.canEdit,
            canEdit: perm.canEdit,
          },
          create: {
            passcodeId: params.passcodeId,
            module,
            canView: perm.canView || perm.canEdit,
            canEdit: perm.canEdit,
          },
        });
      }
    });

    await logAuditEvent({
      passcodeId: admin.passcodeId,
      passcodeLabel: admin.label,
      action: 'UPDATE_PASSCODE_PERMISSIONS',
      entity: 'AdminPasscode',
      entityId: target.id,
      changeSummary: `Owner modified permissions for passcode "${target.label}".`,
    });

    revalidatePath('/admin/passcodes');
    return { success: true };
  } catch (err: any) {
    console.error('updateStaffPasscodePermissions error:', err.message);
    return { success: false, error: err.message || 'Failed to update passcode.' };
  }
}

export async function togglePasscodeActive(params: { passcodeId: string; isActive: boolean }) {
  const admin = await getCurrentAdmin();
  if (!admin || !admin.isOwner) {
    return { success: false, error: 'Unauthorized: Only the primary store owner can activate/deactivate passcodes.' };
  }

  try {
    const target = await db.adminPasscode.findUnique({
      where: { id: params.passcodeId },
    });

    if (!target) return { success: false, error: 'Passcode not found.' };

    if (target.isOwner) {
      return { success: false, error: 'Cannot deactivate the primary owner passcode.' };
    }

    await db.adminPasscode.update({
      where: { id: params.passcodeId },
      data: { isActive: params.isActive },
    });

    // If deactivating, invalidate all current sessions immediately!
    if (!params.isActive) {
      await invalidateAllSessionsForPasscode(params.passcodeId);
    }

    await logAuditEvent({
      passcodeId: admin.passcodeId,
      passcodeLabel: admin.label,
      action: params.isActive ? 'ACTIVATE_PASSCODE' : 'DEACTIVATE_PASSCODE',
      entity: 'AdminPasscode',
      entityId: target.id,
      changeSummary: `${params.isActive ? 'Activated' : 'Deactivated and revoked all sessions for'} passcode "${target.label}".`,
    });

    revalidatePath('/admin/passcodes');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to toggle passcode state.' };
  }
}

export async function deletePasscode(passcodeId: string) {
  const admin = await getCurrentAdmin();
  if (!admin || !admin.isOwner) {
    return { success: false, error: 'Unauthorized: Only the primary store owner can delete passcodes.' };
  }

  try {
    const target = await db.adminPasscode.findUnique({
      where: { id: passcodeId },
    });

    if (!target) return { success: false, error: 'Passcode not found.' };

    if (target.isOwner) {
      return { success: false, error: 'The primary owner passcode cannot be deleted.' };
    }

    // Invalidate active sessions first
    await invalidateAllSessionsForPasscode(passcodeId);

    await db.adminPasscode.delete({
      where: { id: passcodeId },
    });

    await logAuditEvent({
      passcodeId: admin.passcodeId,
      passcodeLabel: admin.label,
      action: 'DELETE_PASSCODE',
      entity: 'AdminPasscode',
      entityId: passcodeId,
      changeSummary: `Owner permanently deleted administrative passcode "${target.label}".`,
    });

    revalidatePath('/admin/passcodes');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete passcode.' };
  }
}
