import dotenv from 'dotenv';
dotenv.config();

async function testResend() {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ADMIN_NOTIFICATION_EMAIL;
  const from = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

  console.log(`Testing Resend API with API key (length: ${apiKey?.length || 0})...`);
  console.log(`Sending test verification from "${from}" to "${to}"...`);

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Zevyor <${from}>`,
        to: [to],
        subject: 'Zevyor Ecommerce — Resend Transactional Email Test',
        html: `
          <div style="font-family: sans-serif; padding: 20px; background-color: #F5F0E8; color: #171717;">
            <h1 style="color: #6B1F32; margin-top: 0;">Z E V Y O R</h1>
            <h2>Transactional Email Engine Operational</h2>
            <p>Assalam-o-Alaikum!</p>
            <p>This is a live verification email from your Zevyor ecommerce application confirming that your Resend API integration is fully functional.</p>
            <p style="background: #fff; padding: 15px; border-left: 4px solid #6B1F32;">
              <strong>Connected Email:</strong> ${to}<br/>
              <strong>Status:</strong> Active & Verified
            </p>
            <p style="font-size: 12px; color: #777;">Zevyor Lifestyle Brand • Pakistan</p>
          </div>
        `,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      console.log('✔ Resend email sent successfully! Message ID:', data.id);
    } else {
      console.error('❌ Resend API returned error:', data);
    }
  } catch (err) {
    console.error('❌ Fetch failed:', err.message);
  }
}

testResend();
