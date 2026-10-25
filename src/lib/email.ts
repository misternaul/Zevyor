import { db } from './db';

interface SendOrderEmailParams {
  orderId: string;
}

export async function sendOrderEmails({ orderId }: SendOrderEmailParams) {
  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!order) {
      console.warn(`[Email] Order ${orderId} not found.`);
      return;
    }

    const apiKey = process.env.RESEND_API_KEY?.trim();
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'orders@zevyor.com';
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'owner@zevyor.com';

    if (!apiKey) {
      console.log(`[Email] RESEND_API_KEY not configured. Logging pending email dispatch for ${order.orderReference}.`);
      await db.emailLog.create({
        data: {
          orderId: order.id,
          emailType: 'ORDER_CONFIRMATION',
          recipient: order.customerEmail || 'N/A',
          subject: `Order Confirmation - ${order.orderReference}`,
          status: 'PENDING',
          errorMessage: 'RESEND_API_KEY is not configured in server environment variables.',
        },
      });
      return;
    }

    // Attempt Customer Email if email provided
    if (order.customerEmail) {
      await sendResendEmail({
        apiKey,
        from: `Zevyor <${fromEmail}>`,
        to: order.customerEmail,
        subject: `Order Confirmed: ${order.orderReference} - Zevyor`,
        html: generateCustomerEmailHtml(order),
        emailType: 'ORDER_CONFIRMATION',
        orderId: order.id,
      });
    }

    // Admin Notification
    if (adminEmail) {
      await sendResendEmail({
        apiKey,
        from: `Zevyor Store <${fromEmail}>`,
        to: adminEmail,
        subject: `New COD Order Received: ${order.orderReference} (Rs. ${order.finalTotal.toLocaleString()})`,
        html: generateAdminNotificationHtml(order),
        emailType: 'ADMIN_ALERT',
        orderId: order.id,
      });
    }
  } catch (err: any) {
    console.error('[Email] Unexpected email processing error:', err.message);
  }
}

async function sendResendEmail(params: {
  apiKey: string;
  from: string;
  to: string;
  subject: string;
  html: string;
  emailType: string;
  orderId: string;
}) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${params.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: params.from,
        to: [params.to],
        subject: params.subject,
        html: params.html,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      await db.emailLog.create({
        data: {
          orderId: params.orderId,
          emailType: params.emailType,
          recipient: params.to,
          subject: params.subject,
          status: 'SENT',
          sentAt: new Date(),
        },
      });
      console.log(`[Email] Successfully sent ${params.emailType} to ${params.to}`);
    } else {
      const errMsg = data?.message || JSON.stringify(data);
      console.warn(`[Email] Resend API rejected message to ${params.to}: ${errMsg}`);
      await db.emailLog.create({
        data: {
          orderId: params.orderId,
          emailType: params.emailType,
          recipient: params.to,
          subject: params.subject,
          status: 'FAILED',
          errorMessage: errMsg,
        },
      });
    }
  } catch (err: any) {
    console.error(`[Email] Network error sending email to ${params.to}:`, err.message);
    await db.emailLog.create({
      data: {
        orderId: params.orderId,
        emailType: params.emailType,
        recipient: params.to,
        subject: params.subject,
        status: 'FAILED',
        errorMessage: err.message,
      },
    });
  }
}

function generateCustomerEmailHtml(order: any) {
  const itemsHtml = order.items
    .map(
      (item: any) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #E5E5E5;">
        <strong style="color: #171717;">${item.productName}</strong>
        ${item.variantTitle ? `<br/><span style="color: #777; font-size: 13px;">${item.variantTitle}</span>` : ''}
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #E5E5E5; text-align: center; color: #171717;">
        ${item.quantity}
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #E5E5E5; text-align: right; color: #171717;">
        Rs. ${item.totalPrice.toLocaleString()}
      </td>
    </tr>
  `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8"/>
      <title>Zevyor Order Confirmation</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F5F0E8; margin: 0; padding: 40px 20px;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <tr>
          <td style="background-color: #171717; padding: 30px; text-align: center;">
            <h1 style="color: #FFFFFF; margin: 0; letter-spacing: 4px; font-size: 24px; font-weight: 300;">Z E V Y O R</h1>
          </td>
        </tr>
        <tr>
          <td style="padding: 40px 30px;">
            <h2 style="color: #6B1F32; margin-top: 0; font-size: 22px;">Thank You For Your Order</h2>
            <p style="color: #444; line-height: 1.6;">Hello ${order.customerName},</p>
            <p style="color: #444; line-height: 1.6;">We have received your Cash on Delivery order <strong>#${order.orderReference}</strong>. Our team is preparing your package for verification and courier dispatch.</p>
            
            <div style="background-color: #FAF7F2; padding: 15px 20px; border-left: 4px solid #6B1F32; margin: 25px 0;">
              <p style="margin: 0; font-size: 14px; color: #171717;"><strong>Payment Method:</strong> Cash on Delivery (COD)</p>
              <p style="margin: 5px 0 0; font-size: 14px; color: #171717;"><strong>Order Reference:</strong> ${order.orderReference}</p>
            </div>

            <h3 style="color: #171717; border-bottom: 2px solid #171717; padding-bottom: 8px; margin-top: 30px;">Order Summary</h3>
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
              <thead>
                <tr style="color: #777; font-size: 12px; text-transform: uppercase;">
                  <th align="left" style="padding-bottom: 8px;">Item</th>
                  <th align="center" style="padding-bottom: 8px;">Qty</th>
                  <th align="right" style="padding-bottom: 8px;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="color: #444; font-size: 14px;">
              <tr>
                <td style="padding: 6px 0;">Subtotal:</td>
                <td align="right" style="padding: 6px 0;">Rs. ${order.subtotal.toLocaleString()}</td>
              </tr>
              ${
                order.discountTotal > 0
                  ? `<tr>
                      <td style="padding: 6px 0; color: #6B1F32;">Discount:</td>
                      <td align="right" style="padding: 6px 0; color: #6B1F32;">- Rs. ${order.discountTotal.toLocaleString()}</td>
                    </tr>`
                  : ''
              }
              <tr>
                <td style="padding: 6px 0;">Delivery Fee:</td>
                <td align="right" style="padding: 6px 0;">${order.deliveryFee === 0 ? 'FREE' : `Rs. ${order.deliveryFee.toLocaleString()}`}</td>
              </tr>
              <tr style="font-size: 18px; font-weight: bold; color: #171717; border-top: 2px solid #E5E5E5;">
                <td style="padding: 12px 0;">Total (Due on Delivery):</td>
                <td align="right" style="padding: 12px 0; color: #6B1F32;">Rs. ${order.finalTotal.toLocaleString()}</td>
              </tr>
            </table>

            <h3 style="color: #171717; margin-top: 30px; border-bottom: 1px solid #E5E5E5; padding-bottom: 8px;">Delivery Address</h3>
            <p style="color: #444; margin: 4px 0;">${order.customerName}</p>
            <p style="color: #444; margin: 4px 0;">${order.deliveryAddress}</p>
            <p style="color: #444; margin: 4px 0;">${order.city}, ${order.province}</p>
            <p style="color: #444; margin: 4px 0;">Phone: ${order.customerPhone}</p>
          </td>
        </tr>
        <tr>
          <td style="background-color: #FAF7F2; padding: 20px 30px; text-align: center; color: #777777; font-size: 12px;">
            <p style="margin: 0;">Zevyor Lifestyle Brand • Pakistan</p>
            <p style="margin: 5px 0 0;">Need assistance? WhatsApp us at your convenience.</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

function generateAdminNotificationHtml(order: any) {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"/></head>
    <body style="font-family: sans-serif; background: #fff; padding: 20px;">
      <h2 style="color: #6B1F32;">New Cash on Delivery Order Placed</h2>
      <p><strong>Order Reference:</strong> ${order.orderReference}</p>
      <p><strong>Customer:</strong> ${order.customerName} (${order.customerPhone})</p>
      <p><strong>Location:</strong> ${order.city}, ${order.province}</p>
      <p><strong>Address:</strong> ${order.deliveryAddress}</p>
      <p><strong>Total Amount:</strong> Rs. ${order.finalTotal.toLocaleString()}</p>
      <p>Please log in to the Zevyor Admin Panel to confirm and prepare for dispatch.</p>
    </body>
    </html>
  `;
}
