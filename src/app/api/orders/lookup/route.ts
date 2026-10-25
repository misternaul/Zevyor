import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { orderReference, phoneNumber } = await req.json();

    if (!orderReference || !phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Both order reference and phone number are required.' },
        { status: 400 }
      );
    }

    const cleanRef = orderReference.trim().toUpperCase();
    const cleanPhone = phoneNumber.trim().replace(/[^0-9]/g, '');

    const order = await db.order.findUnique({
      where: { orderReference: cleanRef },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'No order found with the provided reference.' },
        { status: 404 }
      );
    }

    // Verify phone number suffix match to prevent brute-force exposure
    const dbPhoneDigits = order.customerPhone.replace(/[^0-9]/g, '');
    const isPhoneMatch =
      dbPhoneDigits === cleanPhone ||
      (dbPhoneDigits.length >= 7 &&
        cleanPhone.length >= 7 &&
        dbPhoneDigits.slice(-7) === cleanPhone.slice(-7));

    if (!isPhoneMatch) {
      return NextResponse.json(
        { success: false, error: 'Phone number does not match order records.' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        orderReference: order.orderReference,
        status: order.status,
        paymentStatus: order.paymentStatus,
        courierName: order.courierName,
        trackingNumber: order.trackingNumber,
        trackingUrl: order.trackingUrl,
        customerName: order.customerName,
        city: order.city,
        finalTotal: order.finalTotal,
        createdAt: order.createdAt.toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Internal lookup error.' },
      { status: 500 }
    );
  }
}
