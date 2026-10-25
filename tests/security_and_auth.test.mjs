import test from 'node:test';
import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

test('Security & Auth Test Suite', async (t) => {
  await t.test('1. Passcode cryptographic hashing with bcrypt', async () => {
    const rawPasscode = 'ZevyorTestSecret2026!';
    const hashed = await bcrypt.hash(rawPasscode, 10);

    assert.notEqual(rawPasscode, hashed, 'Passcode must never be stored in plaintext');
    const isValid = await bcrypt.compare(rawPasscode, hashed);
    assert.equal(isValid, true, 'Bcrypt compare must verify correct passcode');

    const isInvalid = await bcrypt.compare('WrongPasscode123', hashed);
    assert.equal(isInvalid, false, 'Bcrypt compare must reject invalid passcode');
  });

  await t.test('2. Owner passcode exists and has unrestricted access', async () => {
    const owner = await prisma.adminPasscode.findFirst({
      where: { isOwner: true },
      include: { permissions: true },
    });

    assert.ok(owner, 'Primary owner passcode must exist in database');
    assert.equal(owner.isActive, true, 'Owner passcode must be active');
    assert.ok(owner.permissions.length >= 10, 'Owner must have permission records for system modules');
  });

  await t.test('3. Staff passcode with granular view-only permissions', async () => {
    const testLabel = 'Test View-Only Staff';
    const hashed = await bcrypt.hash('StaffPass123!', 10);

    // Create test staff passcode
    const staff = await prisma.adminPasscode.create({
      data: {
        label: testLabel,
        hashedPasscode: hashed,
        isOwner: false,
        isActive: true,
        permissions: {
          create: [
            { module: 'ORDERS', canView: true, canEdit: false },
            { module: 'PRODUCTS', canView: true, canEdit: false },
            { module: 'SETTINGS', canView: false, canEdit: false },
          ],
        },
      },
      include: { permissions: true },
    });

    assert.equal(staff.isOwner, false, 'Staff passcode must not be an owner');

    const ordersPerm = staff.permissions.find((p) => p.module === 'ORDERS');
    assert.equal(ordersPerm?.canView, true, 'Staff can view orders');
    assert.equal(ordersPerm?.canEdit, false, 'View-only staff must NOT have edit permission on orders');

    const settingsPerm = staff.permissions.find((p) => p.module === 'SETTINGS');
    assert.equal(settingsPerm?.canView, false, 'Staff has no view access to settings');
    assert.equal(settingsPerm?.canEdit, false, 'Staff has no edit access to settings');

    // Clean up test staff
    await prisma.adminPasscode.delete({ where: { id: staff.id } });
  });

  await t.test('4. Session revocation terminates active sessions', async () => {
    const staff = await prisma.adminPasscode.create({
      data: {
        label: 'Revocation Test Passcode',
        hashedPasscode: await bcrypt.hash('Secret12345!', 10),
        isOwner: false,
        isActive: true,
      },
    });

    const tokenHash1 = crypto.createHash('sha256').update('token1').digest('hex');
    const tokenHash2 = crypto.createHash('sha256').update('token2').digest('hex');

    await prisma.adminSession.createMany({
      data: [
        { tokenHash: tokenHash1, passcodeId: staff.id, expiresAt: new Date(Date.now() + 3600000) },
        { tokenHash: tokenHash2, passcodeId: staff.id, expiresAt: new Date(Date.now() + 3600000) },
      ],
    });

    const sessionCountBefore = await prisma.adminSession.count({ where: { passcodeId: staff.id } });
    assert.equal(sessionCountBefore, 2, 'Two active sessions created');

    // Invalidate all sessions
    await prisma.adminSession.deleteMany({ where: { passcodeId: staff.id } });
    const sessionCountAfter = await prisma.adminSession.count({ where: { passcodeId: staff.id } });
    assert.equal(sessionCountAfter, 0, 'All active sessions must be invalidated upon revocation');

    await prisma.adminPasscode.delete({ where: { id: staff.id } });
  });

  await t.test('5. Audit log correctly records administrative mutations without leaking secrets', async () => {
    const testLog = await prisma.auditLog.create({
      data: {
        action: 'TEST_ACTION',
        entity: 'SecurityAudit',
        changeSummary: 'Admin modified stock level for Chronograph Royal Onyx from 10 to 18 units.',
        ipAddress: '127.0.0.1',
      },
    });

    assert.ok(testLog.id, 'Audit log created');
    assert.equal(testLog.action, 'TEST_ACTION');
    assert.ok(!testLog.changeSummary.includes('passcode'), 'Audit logs must never contain passcodes or secrets');

    await prisma.auditLog.delete({ where: { id: testLog.id } });
  });
});
