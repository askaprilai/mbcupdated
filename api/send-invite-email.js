// Send invite email for Discovery membership
export default async function handler(req, res) {
  const { email, name } = req.query;

  if (!email) {
    return res.status(400).json({ error: 'Email required. Use: ?email=person@email.com&name=FirstName' });
  }

  const firstName = name || 'there';
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    return res.status(500).json({ error: 'Resend API key not configured' });
  }

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
      <div style="background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #d4af37; padding-bottom: 20px;">
          <h1 style="color: #d4af37; margin: 0; font-size: 28px; font-weight: 300;">Miami Business Council</h1>
          <p style="color: #666; margin: 10px 0 0 0; font-size: 16px;">You're Invited</p>
        </div>

        <div style="margin-bottom: 30px;">
          <h2 style="color: #333; margin-bottom: 15px;">Hi ${firstName},</h2>
          <p style="color: #555; line-height: 1.6; font-size: 16px;">
            I wanted to personally invite you to join Miami Business Council and our upcoming exclusive event.
          </p>
        </div>

        <div style="background: #fff8e6; border: 2px solid #d4af37; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
          <h3 style="color: #d4af37; margin: 0 0 15px 0; font-size: 1.3em;">March 10th Members-Only Roundtable</h3>
          <p style="color: #555; margin: 0 0 10px 0; font-size: 16px;">
            <strong>Date:</strong> March 10th, 2026<br>
            <strong>Time:</strong> 6:00 PM - 7:30 PM<br>
            <strong>Event:</strong> Exclusive Roundtable with Miami Business Leaders
          </p>
          <p style="color: #555; margin: 15px 0 0 0; line-height: 1.6;">
            Have a seat at the table. Join us for an intimate evening of meaningful conversations and connections with Miami's top business leaders.
          </p>
        </div>

        <div style="background: linear-gradient(135deg, #d4af37 0%, #f4f1e8 100%); padding: 25px; border-radius: 8px; margin-bottom: 30px; text-align: center;">
          <h3 style="color: #000; margin: 0 0 10px 0;">Discovery Membership</h3>
          <div style="font-size: 2.5em; font-weight: 700; color: #000; margin: 10px 0;">$100</div>
          <p style="color: #333; margin: 0 0 20px 0;">3-Month Full Access • Applied to Annual Membership</p>
          <a href="https://miamibusinesscouncil.com/discovery" style="background: #000; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Get Your Seat</a>
        </div>

        <p style="color: #555; line-height: 1.6; font-size: 16px;">
          Looking forward to connecting with you!
        </p>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #888; font-size: 14px; margin: 0;">
            <strong>April Sabral</strong><br>
            Miami Business Council<br>
            <a href="mailto:info@miamibusinesscouncil.com" style="color: #d4af37;">info@miamibusinesscouncil.com</a>
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
        from: 'April Sabral <april@miamibusinesscouncil.com>',
        to: [email.toLowerCase()],
        subject: `${firstName}, You're Invited to Miami Business Council`,
        html: emailHtml
      })
    });

    if (response.ok) {
      return res.status(200).json({ success: true, message: `Invite email sent to ${email}` });
    } else {
      const error = await response.json();
      return res.status(500).json({ error: 'Failed to send email', details: error });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Failed to send email', message: error.message });
  }
}
