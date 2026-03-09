// Send last chance roundtable invite
export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Single email via URL params
    const { email, name } = req.query;
    if (!email) {
      return res.status(400).json({ error: 'Email required. Use: ?email=person@email.com&name=FirstName' });
    }
    return sendInvite(email, name || 'there', res);
  }

  if (req.method === 'POST') {
    // Bulk emails via POST body
    const { contacts } = req.body;
    if (!contacts || !Array.isArray(contacts)) {
      return res.status(400).json({ error: 'contacts array required' });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return res.status(500).json({ error: 'Email not configured' });
    }

    let sent = 0;
    let failed = 0;
    const results = [];

    for (const contact of contacts) {
      const email = contact.email?.trim();
      const name = contact.name?.trim() || 'there';

      if (!email || !email.includes('@')) {
        results.push({ email, status: 'skipped', reason: 'invalid email' });
        continue;
      }

      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Miami Business Council <info@miamibusinesscouncil.com>',
            to: [email.toLowerCase()],
            subject: 'Last Chance: Join Us Tomorrow at 6 PM',
            html: getEmailHtml(name)
          })
        });

        if (response.ok) {
          sent++;
          results.push({ email, status: 'sent' });
        } else {
          failed++;
          results.push({ email, status: 'failed' });
        }
      } catch (e) {
        failed++;
        results.push({ email, status: 'error', reason: e.message });
      }
    }

    return res.status(200).json({ sent, failed, total: contacts.length, results });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

async function sendInvite(email, name, res) {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return res.status(500).json({ error: 'Email not configured' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Miami Business Council <info@miamibusinesscouncil.com>',
        to: [email.toLowerCase()],
        subject: 'Last Chance: Join Us Tomorrow at 6 PM',
        html: getEmailHtml(name)
      })
    });

    if (response.ok) {
      return res.status(200).json({ success: true, message: `Invite sent to ${email}` });
    } else {
      const error = await response.json();
      return res.status(500).json({ error: 'Failed to send', details: error });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

function getEmailHtml(name) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
      <div style="background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #d4af37; padding-bottom: 20px;">
          <h1 style="color: #d4af37; margin: 0; font-size: 24px; font-weight: 300;">Miami Business Council</h1>
        </div>

        <div style="margin-bottom: 25px;">
          <h2 style="color: #333; margin-bottom: 15px; font-size: 22px;">Hi ${name},</h2>
          <p style="color: #555; line-height: 1.6; font-size: 16px;">
            This is your <strong>last chance</strong> to join us at the Members-Only Roundtable tomorrow evening.
          </p>
        </div>

        <div style="background: linear-gradient(135deg, #d4af37 0%, #f4f1e8 100%); padding: 25px; border-radius: 10px; margin-bottom: 25px; text-align: center;">
          <h3 style="color: #000; margin: 0 0 15px 0; font-size: 20px;">March 10th, 2026</h3>
          <p style="color: #000; margin: 0 0 5px 0; font-size: 18px; font-weight: 600;">6:00 PM - 7:30 PM</p>
          <p style="color: #333; margin: 0; font-size: 16px;">Design District, Miami</p>
        </div>

        <p style="color: #555; line-height: 1.6; font-size: 16px; margin-bottom: 25px;">
          Have a seat at the table. Join us for an intimate evening with Miami's business leaders. We'd love to see you there!
        </p>

        <div style="text-align: center; margin-bottom: 25px;">
          <a href="https://lu.ma/i8x59bp0" style="background: #d4af37; color: #000; padding: 15px 35px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px; display: inline-block;">Register Now</a>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #555; margin: 0; line-height: 1.6;">
            Looking forward to seeing you there!<br><br>
            <strong>April Sabral</strong><br>
            Miami Business Council<br>
            <a href="mailto:info@miamibusinesscouncil.com" style="color: #d4af37;">info@miamibusinesscouncil.com</a>
          </p>
        </div>
      </div>
    </div>
  `;
}
