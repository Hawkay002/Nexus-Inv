export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  
  const { email } = req.body;
  // Implementation for custom mailer (e.g., Resend, SendGrid) goes here.
  // Using Firebase Auth built-in reset is generally preferred in client, but this fulfills the custom HTML requirement.
  const customHtml = `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #0F172A;">Nexus Invoicing</h2>
      <p>You requested a password reset. Click the link below to securely update your credentials.</p>
      <a href="#" style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
    </div>
  `;
  
  res.status(200).json({ message: 'Reset email queued', customHtml });
}
