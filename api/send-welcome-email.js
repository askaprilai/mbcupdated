// Welcome email for members - sends magic link for portal access
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, firstName } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing required field: email' });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const supabaseUrl = process.env.SUPABASE_URL || 'https://vsnvtujkkkbjpuuwxvyd.supabase.co';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!resendApiKey) {
      console.error('RESEND_API_KEY not found');
      return res.status(500).json({ error: 'Email service not configured' });
    }

    // Get member info from database if firstName not provided
    let memberFirstName = firstName;
    let membershipType = 'Member';

    if (supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { data: member } = await supabase
        .from('members')
        .select('first_name, membership_type')
        .eq('email', email.toLowerCase())
        .single();

      if (member) {
        memberFirstName = member.first_name || firstName || 'Member';
        membershipType = member.membership_type || 'Member';
      }
    }

    memberFirstName = memberFirstName || 'Member';

    // Generate magic link URL (they'll click it to login)
    const loginUrl = 'https://miamibusinesscouncil.com/member-login';

    const welcomeEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
        <div style="background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #d4af37; padding-bottom: 20px;">
            <h1 style="color: #d4af37; margin: 0; font-size: 28px; font-weight: 300;">Welcome to Miami Business Council!</h1>
            <p style="color: #666; margin: 10px 0 0 0; font-size: 16px;">Your Member Portal Access</p>
          </div>

          <!-- Welcome Message -->
          <div style="margin-bottom: 30px;">
            <h2 style="color: #333; margin-bottom: 15px;">Welcome, ${memberFirstName}!</h2>
            <p style="color: #555; line-height: 1.6; font-size: 16px; margin-bottom: 20px;">
              Your <strong style="color: #d4af37;">${membershipType.toUpperCase()}</strong> membership with Miami Business Council is active. You're part of Miami's premier business community!
            </p>
          </div>

          <!-- Portal Access -->
          <div style="background: #e8f5e8; border: 2px solid #51cf66; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #2f9e44; margin-top: 0; margin-bottom: 20px;">🚀 Access Your Member Portal</h3>
            <p style="color: #333; margin-bottom: 15px;">Click the button below to access your exclusive member dashboard:</p>

            <div style="text-align: center; margin-bottom: 15px;">
              <a href="${loginUrl}" style="background: #51cf66; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">Access Your Portal</a>
            </div>

            <p style="color: #666; margin: 0; font-size: 14px; text-align: center;">
              📧 Enter your email <strong>${email}</strong> to receive a secure magic link.<br>
              No password needed - just click the link in your email!
            </p>
          </div>

          <!-- What You Can Do -->
          <div style="background: #f8f8f8; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #d4af37; margin-top: 0; margin-bottom: 20px;">What You Can Do in Your Portal</h3>

            <div style="margin-bottom: 15px;">
              <h4 style="color: #333; margin: 0 0 8px 0; font-size: 16px;">💬 Connect & Chat</h4>
              <p style="color: #666; margin: 0; line-height: 1.5; font-size: 15px;">
                Message other members directly, build relationships, and explore partnership opportunities.
              </p>
            </div>

            <div style="margin-bottom: 15px;">
              <h4 style="color: #333; margin: 0 0 8px 0; font-size: 16px;">🤝 Smart Business Matching</h4>
              <p style="color: #666; margin: 0; line-height: 1.5; font-size: 15px;">
                Our AI-powered system finds members who are perfect matches for your business needs and goals.
              </p>
            </div>

            <div style="margin-bottom: 15px;">
              <h4 style="color: #333; margin: 0 0 8px 0; font-size: 16px;">👥 Member Directory</h4>
              <p style="color: #666; margin: 0; line-height: 1.5; font-size: 15px;">
                Browse and search our complete member directory with advanced filtering options.
              </p>
            </div>

            <div>
              <h4 style="color: #333; margin: 0 0 8px 0; font-size: 16px;">📱 Mobile App</h4>
              <p style="color: #666; margin: 0; line-height: 1.5; font-size: 15px;">
                Install the portal as an app on your phone for quick access anywhere.
              </p>
            </div>
          </div>

          <!-- Next Event -->
          <div style="background: #fff3cd; border: 1px solid #d4af37; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #d4af37; margin-top: 0; margin-bottom: 15px;">📅 You're Invited: March 10th Roundtable</h3>
            <p style="color: #666; margin: 0 0 15px 0; line-height: 1.5;">
              <strong>Date:</strong> March 10th, 2026<br>
              <strong>Time:</strong> 6:00 PM - 7:30 PM<br>
              <strong>Event:</strong> Exclusive Members-Only Roundtable
            </p>
            <div style="text-align: center;">
              <a href="https://lu.ma/i8x59bp0" style="background: #d4af37; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: 600; display: inline-block;">Register for March 10th Event</a>
            </div>
          </div>

          <!-- Contact Information -->
          <div style="background: #d4af37; color: white; padding: 20px; border-radius: 8px; text-align: center;">
            <h3 style="margin: 0 0 10px 0;">Questions or Need Help?</h3>
            <p style="margin: 0; font-size: 16px;">
              We're here to help you maximize your Miami Business Council experience.<br>
              Contact us at <a href="mailto:info@miamibusinesscouncil.com" style="color: white; font-weight: bold;">info@miamibusinesscouncil.com</a>
            </p>
          </div>

          <!-- Footer -->
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
            <p style="color: #888; font-size: 14px; margin: 0;">
              Miami Business Council<br>
              Creating platforms for leaders to connect, form partnerships, and collaborate<br>
              <a href="https://miamibusinesscouncil.com" style="color: #d4af37;">miamibusinesscouncil.com</a>
            </p>
          </div>
        </div>
      </div>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Miami Business Council <welcome@miamibusinesscouncil.com>',
        to: [email],
        subject: `Welcome ${memberFirstName}! Your MBC Portal Access`,
        html: welcomeEmailHtml
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Resend API error:', errorData);
      return res.status(500).json({ error: 'Failed to send welcome email', details: errorData });
    }

    const emailData = await response.json();
    console.log('Welcome email sent successfully:', emailData);

    return res.status(200).json({
      success: true,
      message: `Welcome email sent to ${email}`,
      emailId: emailData.id
    });

  } catch (error) {
    console.error('Error sending welcome email:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
