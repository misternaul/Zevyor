'use server';

import { db } from '@/lib/db';
import { checkPermission, getCurrentAdmin, logAuditEvent } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const ProductSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Product name must have at least 2 characters'),
  slug: z.string().min(2, 'Valid URL slug is required'),
  shortDescription: z.string().optional(),
  fullDescription: z.string().optional(),
  categoryId: z.string().nullable().optional(),
  sku: z.string().optional(),
  tags: z.string().optional(),
  originalPrice: z.number().nullable().optional(),
  sellingPrice: z.number().int().positive('Selling price must be a positive integer'),
  costPrice: z.number().nullable().optional(),
  trackInventory: z.boolean().default(true),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('PUBLISHED'),
  isFeatured: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isBestseller: z.boolean().default(false),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  images: z.array(
    z.object({
      url: z.string().min(1, 'Image URL required'),
      altText: z.string().optional(),
      isPrimary: z.boolean().default(false),
      displayOrder: z.number().default(0),
    })
  ).optional(),
  variants: z.array(
    z.object({
      id: z.string().optional(),
      title: z.string().min(1, 'Variant title required'),
      sku: z.string().optional(),
      price: z.number().nullable().optional(),
      stockQuantity: z.number().int().nonnegative().default(0),
      color: z.string().optional(),
      size: z.string().optional(),
      material: z.string().optional(),
      imageUrl: z.string().optional(),
    })
  ).optional(),
});

export async function upsertProduct(data: unknown) {
  const admin = await getCurrentAdmin();
  if (!admin || !checkPermission(admin, 'PRODUCTS', 'EDIT')) {
    return { success: false, error: 'Unauthorized: You do not have permission to modify products.' };
  }

  const parsed = ProductSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message || 'Invalid product payload.' };
  }

  const p = parsed.data;

  // Clean slug
  const cleanSlug = p.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  try {
    // Check slug collision
    const existingSlug = await db.product.findUnique({
      where: { slug: cleanSlug },
    });

    if (existingSlug && existingSlug.id !== p.id) {
      return { success: false, error: `Product slug "${cleanSlug}" is already in use by another product.` };
    }

    if (p.id) {
      // Update existing
      const updated = await db.$transaction(async (tx) => {
        const prod = await tx.product.update({
          where: { id: p.id },
          data: {
            name: p.name,
            slug: cleanSlug,
            shortDescription: p.shortDescription || null,
            fullDescription: p.fullDescription || null,
            categoryId: p.categoryId || null,
            sku: p.sku || null,
            tags: p.tags || null,
            originalPrice: p.originalPrice || null,
            sellingPrice: p.sellingPrice,
            costPrice: admin.isOwner ? p.costPrice || null : undefined, // Only owner can set cost price
            trackInventory: p.trackInventory,
            status: p.status,
            isFeatured: p.isFeatured,
            isNewArrival: p.isNewArrival,
            isBestseller: p.isBestseller,
            seoTitle: p.seoTitle || null,
            seoDescription: p.seoDescription || null,
          },
        });

        // Update images if provided
        if (p.images) {
          await tx.productImage.deleteMany({ where: { productId: p.id } });
          if (p.images.length > 0) {
            await tx.productImage.createMany({
              data: p.images.map((img, idx) => ({
                productId: p.id!,
                url: img.url,
                altText: img.altText || null,
                isPrimary: img.isPrimary ?? (idx === 0),
                displayOrder: img.displayOrder ?? idx,
              })),
            });
          }
        }

        // Update variants if provided
        if (p.variants) {
          await tx.productVariant.deleteMany({ where: { productId: p.id } });
          if (p.variants.length > 0) {
            await tx.productVariant.createMany({
              data: p.variants.map((v) => ({
                productId: p.id!,
                title: v.title,
                sku: v.sku || null,
                price: v.price || null,
                stockQuantity: v.stockQuantity,
                color: v.color || null,
                size: v.size || null,
                material: v.material || null,
                imageUrl: v.imageUrl || null,
              })),
            });
          }
        }

        return prod;
      });

      await logAuditEvent({
        passcodeId: admin.passcodeId,
        passcodeLabel: admin.label,
        action: 'UPDATE_PRODUCT',
        entity: 'Product',
        entityId: updated.id,
        changeSummary: `Updated product "${updated.name}" (Price: Rs. ${updated.sellingPrice}, Status: ${updated.status}).`,
      });

      revalidatePath('/shop');
      revalidatePath(`/product/${updated.slug}`);
      revalidatePath('/admin/products');

      return { success: true, productId: updated.id };
    } else {
      // Create new
      const created = await db.$transaction(async (tx) => {
        const prod = await tx.product.create({
          data: {
            name: p.name,
            slug: cleanSlug,
            shortDescription: p.shortDescription || null,
            fullDescription: p.fullDescription || null,
            categoryId: p.categoryId || null,
            sku: p.sku || null,
            tags: p.tags || null,
            originalPrice: p.originalPrice || null,
            sellingPrice: p.sellingPrice,
            costPrice: admin.isOwner ? p.costPrice || null : null,
            trackInventory: p.trackInventory,
            status: p.status,
            isFeatured: p.isFeatured,
            isNewArrival: p.isNewArrival,
            isBestseller: p.isBestseller,
            seoTitle: p.seoTitle || null,
            seoDescription: p.seoDescription || null,
            images: {
              create: (p.images || []).map((img, idx) => ({
                url: img.url,
                altText: img.altText || null,
                isPrimary: img.isPrimary ?? (idx === 0),
                displayOrder: img.displayOrder ?? idx,
              })),
            },
            variants: {
              create: (p.variants || []).map((v) => ({
                title: v.title,
                sku: v.sku || null,
                price: v.price || null,
                stockQuantity: v.stockQuantity,
                color: v.color || null,
                size: v.size || null,
                material: v.material || null,
                imageUrl: v.imageUrl || null,
              })),
            },
          },
        });
        return prod;
      });

      await logAuditEvent({
        passcodeId: admin.passcodeId,
        passcodeLabel: admin.label,
        action: 'CREATE_PRODUCT',
        entity: 'Product',
        entityId: created.id,
        changeSummary: `Created new product "${created.name}" (SKU: ${created.sku || 'N/A'}, Price: Rs. ${created.sellingPrice}).`,
      });

      revalidatePath('/shop');
      revalidatePath('/admin/products');

      return { success: true, productId: created.id };
    }
  } catch (err: any) {
    console.error('upsertProduct error:', err.message);
    return { success: false, error: err.message || 'Failed to save product.' };
  }
}

export async function deleteProduct(productId: string) {
  const admin = await getCurrentAdmin();
  if (!admin || !checkPermission(admin, 'PRODUCTS', 'EDIT')) {
    return { success: false, error: 'Unauthorized: You do not have permission to delete products.' };
  }

  try {
    const prod = await db.product.findUnique({
      where: { id: productId },
      include: { orderItems: true },
    });

    if (!prod) {
      return { success: false, error: 'Product not found.' };
    }

    // If product has historical orders, unpublish instead of deleting to maintain relational integrity
    if (prod.orderItems.length > 0) {
      await db.product.update({
        where: { id: productId },
        data: { status: 'DRAFT' },
      });

      await logAuditEvent({
        passcodeId: admin.passcodeId,
        passcodeLabel: admin.label,
        action: 'ARCHIVE_PRODUCT',
        entity: 'Product',
        entityId: productId,
        changeSummary: `Product "${prod.name}" has ${prod.orderItems.length} associated orders; archived to DRAFT to preserve historical order records.`,
      });

      revalidatePath('/shop');
      revalidatePath('/admin/products');
      return {
        success: true,
        message: 'Product has order history and was safely archived to Draft status instead of hard deleted.',
      };
    }

    await db.product.delete({
      where: { id: productId },
    });

    await logAuditEvent({
      passcodeId: admin.passcodeId,
      passcodeLabel: admin.label,
      action: 'DELETE_PRODUCT',
      entity: 'Product',
      entityId: productId,
      changeSummary: `Permanently deleted product "${prod.name}" (no prior order references).`,
    });

    revalidatePath('/shop');
    revalidatePath('/admin/products');

    return { success: true };
  } catch (err: any) {
    console.error('deleteProduct error:', err.message);
    return { success: false, error: err.message || 'Failed to delete product.' };
  }
}
