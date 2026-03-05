// Simple endpoint to send Discovery welcome email with March 10th invite
export default async function handler(req, res) {
  const { email, name } = req.query;

  if (!email) {
    return res.status(400).json({ error: 'Email required. Use: ?email=person@email.com&name=FirstName' });
  }

  const firstName = name || 'Member';
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    return res.status(500).json({ error: 'Resend API key not configured' });
  }

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
      <div style="background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #d4af37; padding-bottom: 20px;">
          <h1 style="color: #d4af37; margin: 0; font-size: 28px; font-weight: 300;">Welcome to Miami Business Council!</h1>
          <p style="color: #666; margin: 10px 0 0 0; font-size: 16px;">Your Discovery Membership is Active</p>
        </div>

        <div style="background: #e8f5e8; border: 2px solid #51cf66; padding: 20px; border-radius: 8px; margin-bottom: 30px; text-align: center;">
          <h3 style="color: #2f9e44; margin: 0 0 10px 0;">Payment Confirmed</h3>
          <p style="color: #2f9e44; margin: 0; font-size: 16px;">
            <strong>Discovery Membership</strong> - 3 Months
          </p>
        </div>

        <div style="margin-bottom: 30px;">
          <h2 style="color: #333; margin-bottom: 15px;">Welcome ${firstName}!</h2>
          <p style="color: #555; line-height: 1.6; font-size: 16px;">
            You're now part of Miami's premier business community.
          </p>
        </div>

        <div style="background: #fff8e6; border: 2px solid #d4af37; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h3 style="color: #d4af37; margin: 0 0 15px 0;">You're Invited: March 10th Roundtable</h3>
          <p style="color: #555; margin: 0 0 10px 0; font-size: 16px;">
            <strong>Date:</strong> March 10th, 2026<br>
            <strong>Time:</strong> 6:00 PM - 7:30 PM<br>
            <strong>Event:</strong> Exclusive Members-Only Roundtable
          </p>
          <p style="margin: 15px 0 0 0; text-align: center;">
            <a href="https://lu.ma/i8x59bp0" style="background: #d4af37; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Register for March 10th Event</a>
          </p>
        </div>

        <div style="background: #f0f0f0; padding: 15px; border-radius: 8px; margin-bottom: 30px;">
          <p style="color: #555; margin: 0; font-size: 14px;">
            <strong>Remember:</strong> When you renew after 90 days, your $100 discovery payment is credited toward your annual membership.
          </p>
        </div>

        <div style="background: #d4af37; color: white; padding: 20px; border-radius: 8px; text-align: center;">
          <h3 style="margin: 0 0 10px 0;">Questions?</h3>
          <p style="margin: 0; font-size: 16px;">
            Contact us at <a href="mailto:info@miamibusinesscouncil.com" style="color: white; font-weight: bold;">info@miamibusinesscouncil.com</a>
          </p>
        </div>
      </div>
    </div>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Miami Business Council <welcome@miamibusinesscouncil.com>',
        to: [email.toLowerCase()],
        subject: `Welcome ${firstName}! Your Discovery Membership is Active`,
        html: emailHtml
      })
    });

    if (response.ok) {
      return res.status(200).json({ success: true, message: `Welcome email sent to ${email}` });
    } else {
      const error = await response.json();
      return res.status(500).json({ error: 'Failed to send email', details: error });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Failed to send email', message: error.message });
  }
}
