'use server';

import { db } from '@/lib/db';
import { checkPermission, getCurrentAdmin, logAuditEvent } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const CategorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Category name must have at least 2 characters'),
  slug: z.string().min(2, 'Slug is required'),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  displayOrder: z.number().int().default(0),
  isPublished: z.boolean().default(true),
});

export async function upsertCategory(data: unknown) {
  const admin = await getCurrentAdmin();
  if (!admin || !checkPermission(admin, 'CATEGORIES', 'EDIT')) {
    return { success: false, error: 'Unauthorized: You do not have permission to modify categories.' };
  }

  const parsed = CategorySchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message || 'Invalid category data.' };
  }

  const c = parsed.data;
  const cleanSlug = c.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  try {
    const existing = await db.category.findUnique({
      where: { slug: cleanSlug },
    });

    if (existing && existing.id !== c.id) {
      return { success: false, error: `Category slug "${cleanSlug}" already exists.` };
    }

    if (c.id) {
      const updated = await db.category.update({
        where: { id: c.id },
        data: {
          name: c.name,
          slug: cleanSlug,
          description: c.description || null,
          imageUrl: c.imageUrl || null,
          displayOrder: c.displayOrder,
          isPublished: c.isPublished,
        },
      });

      await logAuditEvent({
        passcodeId: admin.passcodeId,
        passcodeLabel: admin.label,
        action: 'UPDATE_CATEGORY',
        entity: 'Category',
        entityId: updated.id,
        changeSummary: `Updated category "${updated.name}" (Slug: ${updated.slug}, Published: ${updated.isPublished}).`,
      });

      revalidatePath('/');
      revalidatePath('/shop');
      revalidatePath('/admin/categories');

      return { success: true, categoryId: updated.id };
    } else {
      const created = await db.category.create({
        data: {
          name: c.name,
          slug: cleanSlug,
          description: c.description || null,
          imageUrl: c.imageUrl || null,
          displayOrder: c.displayOrder,
          isPublished: c.isPublished,
        },
      });

      await logAuditEvent({
        passcodeId: admin.passcodeId,
        passcodeLabel: admin.label,
        action: 'CREATE_CATEGORY',
        entity: 'Category',
        entityId: created.id,
        changeSummary: `Created category "${created.name}" (Slug: ${created.slug}).`,
      });

      revalidatePath('/');
      revalidatePath('/shop');
      revalidatePath('/admin/categories');

      return { success: true, categoryId: created.id };
    }
  } catch (err: any) {
    console.error('upsertCategory error:', err.message);
    return { success: false, error: err.message || 'Failed to save category.' };
  }
}

export async function deleteCategory(params: {
  categoryId: string;
  reassignCategoryId?: string | null;
}) {
  const admin = await getCurrentAdmin();
  if (!admin || !checkPermission(admin, 'CATEGORIES', 'EDIT')) {
    return { success: false, error: 'Unauthorized: You do not have permission to delete categories.' };
  }

  try {
    const category = await db.category.findUnique({
      where: { id: params.categoryId },
      include: {
        products: true,
      },
    });

    if (!category) {
      return { success: false, error: 'Category not found.' };
    }

    const productCount = category.products.length;

    if (productCount > 0 && !params.reassignCategoryId) {
      // Safely unpublish products and set categoryId to null so products are NEVER silently deleted!
      await db.product.updateMany({
        where: { categoryId: params.categoryId },
        data: {
          categoryId: null,
          status: 'DRAFT', // Safe fallback: leave them unpublished until reassigned
        },
      });

      await logAuditEvent({
        passcodeId: admin.passcodeId,
        passcodeLabel: admin.label,
        action: 'UNASSIGN_PRODUCTS',
        entity: 'Category',
        entityId: params.categoryId,
        changeSummary: `Unassigned ${productCount} products from deleted category "${category.name}" and transitioned to DRAFT.`,
      });
    } else if (productCount > 0 && params.reassignCategoryId) {
      // Reassign to selected destination category
      await db.product.updateMany({
        where: { categoryId: params.categoryId },
        data: {
          categoryId: params.reassignCategoryId,
        },
      });

      await logAuditEvent({
        passcodeId: admin.passcodeId,
        passcodeLabel: admin.label,
        action: 'REASSIGN_PRODUCTS',
        entity: 'Category',
        entityId: params.categoryId,
        changeSummary: `Reassigned ${productCount} products from "${category.name}" to category ID ${params.reassignCategoryId}.`,
      });
    }

    await db.category.delete({
      where: { id: params.categoryId },
    });

    await logAuditEvent({
      passcodeId: admin.passcodeId,
      passcodeLabel: admin.label,
      action: 'DELETE_CATEGORY',
      entity: 'Category',
      entityId: params.categoryId,
      changeSummary: `Deleted category "${category.name}".`,
    });

    revalidatePath('/');
    revalidatePath('/shop');
    revalidatePath('/admin/categories');

    return { success: true };
  } catch (err: any) {
    console.error('deleteCategory error:', err.message);
    return { success: false, error: err.message || 'Failed to delete category.' };
  }
}
