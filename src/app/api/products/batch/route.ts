import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const idsParam = req.nextUrl.searchParams.get('ids');
  if (!idsParam) {
    return NextResponse.json({ products: [] });
  }

  const ids = idsParam.split(',').filter(Boolean);
  if (ids.length === 0) {
    return NextResponse.json({ products: [] });
  }

  try {
    const products = await db.product.findMany({
      where: {
        id: { in: ids },
        status: 'PUBLISHED',
      },
      include: {
        images: { orderBy: { displayOrder: 'asc' } },
        category: true,
      },
    });

    return NextResponse.json({ products });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
