/**
 * Resend Email Service
 * Handles all email campaigns and notifications
 */

const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY || process.env.RESEND_API_KEY;
const RESEND_API_URL = 'https://api.resend.com/emails';

interface EmailPayload {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
  reply_to?: string;
  headers?: Record<string, string>;
  tags?: Array<{ name: string; value: string }>;
}

interface SendEmailResponse {
  id: string;
  from: string;
  to: string;
  created_at: string;
}

export const resendService = {
  /**
   * Send a single email
   */
  async sendEmail(payload: EmailPayload): Promise<SendEmailResponse> {
    try {
      const response = await fetch(RESEND_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Resend API error: ${error.message}`);
      }

      return response.json();
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  },

  /**
   * Send batch welcome emails to new clients
   */
  async sendWelcomeEmails(
    clients: Array<{
      email: string;
      first_name: string;
      temp_password: string;
      activation_link: string;
    }>
  ): Promise<{ sent: number; failed: number; errors: any[] }> {
    const results = {
      sent: 0,
      failed: 0,
      errors: [] as any[],
    };

    for (const client of clients) {
      try {
        await this.sendEmail({
          from: 'noreply@plsproservice.com',
          to: client.email,
          subject: '🎉 Welcome to PLS Consultants Portal',
          html: this.getWelcomeEmailHTML(client),
          reply_to: 'support@plsproservice.com',
          tags: [
            { name: 'campaign', value: 'welcome' },
            { name: 'client_id', value: client.email },
          ],
        });
        results.sent++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          email: client.email,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return results;
  },

  /**
   * Send notification email to client
   */
  async sendNotificationEmail(
    email: string,
    notification_type: string,
    data: Record<string, any>
  ): Promise<SendEmailResponse> {
    const templates: Record<string, (data: any) => { subject: string; html: string }> = {
      case_assigned: (data) => ({
        subject: `📋 New Case Assigned: ${data.case_title}`,
        html: `
          <h2>Case Assignment</h2>
          <p>Hello ${data.client_name},</p>
          <p>A new case has been assigned to you:</p>
          <p><strong>${data.case_title}</strong></p>
          <p>${data.case_description}</p>
          <p><a href="${data.portal_url}/client">View in Portal</a></p>
        `,
      }),
      document_uploaded: (data) => ({
        subject: '📄 Document Uploaded',
        html: `
          <h2>Document Upload Notification</h2>
          <p>Hello ${data.client_name},</p>
          <p>A new document has been uploaded to your case:</p>
          <p><strong>${data.document_name}</strong></p>
          <p><a href="${data.portal_url}/client/documents">View Documents</a></p>
        `,
      }),
      message_from_admin: (data) => ({
        subject: `📧 New Message from ${data.from_name}`,
        html: `
          <h2>You Have a New Message</h2>
          <p>Hello ${data.client_name},</p>
          <p>You have received a message regarding your case:</p>
          <blockquote>${data.message}</blockquote>
          <p><a href="${data.portal_url}/client">Reply in Portal</a></p>
        `,
      }),
    };

    const template = templates[notification_type];
    if (!template) {
      throw new Error(`Unknown notification type: ${notification_type}`);
    }

    const { subject, html } = template(data);

    return this.sendEmail({
      from: 'noreply@plsproservice.com',
      to: email,
      subject,
      html,
      reply_to: 'support@plsproservice.com',
      tags: [
        { name: 'type', value: notification_type },
      ],
    });
  },

  /**
   * Send admin alert
   */
  async sendAdminAlert(
    admin_email: string,
    alert_type: string,
    data: Record<string, any>
  ): Promise<SendEmailResponse> {
    return this.sendEmail({
      from: 'noreply@plsproservice.com',
      to: admin_email,
      subject: `🚨 Admin Alert: ${alert_type}`,
      html: `
        <h2>System Alert</h2>
        <p><strong>Type:</strong> ${alert_type}</p>
        <pre>${JSON.stringify(data, null, 2)}</pre>
        <p><a href="https://admin.plsproservice.com">View Admin Dashboard</a></p>
      `,
      reply_to: 'support@plsproservice.com',
    });
  },

  /**
   * Get welcome email HTML template
   */
  getWelcomeEmailHTML(client: {
    email: string;
    first_name: string;
    temp_password: string;
    activation_link: string;
  }): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0; }
    .credentials { background: #fff; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; font-family: monospace; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
    .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Welcome to PLS Consultants</h1>
      <p>Your Legal Services Portal is Ready!</p>
    </div>

    <div class="content">
      <h2>Hello ${client.first_name},</h2>

      <p>We're excited to welcome you to the PLS Consultants Client Portal! This is your personal space to manage your legal matters, upload documents, and communicate directly with our team.</p>

      <h3>🚀 Getting Started</h3>

      <p><strong>Step 1:</strong> Click the button below to activate your account</p>
      <a href="${client.activation_link}" class="button">Activate My Account</a>

      <p><strong>Step 2:</strong> Use these temporary credentials to log in:</p>
      <div class="credentials">
        <strong>Email:</strong> ${client.email}<br>
        <strong>Temporary Password:</strong> ${client.temp_password}
      </div>

      <div class="warning">
        <strong>⚠️ Important:</strong> Your temporary password will expire in 24 hours. Please set a new password immediately after logging in.
      </div>

      <h3>📋 What You Can Do</h3>
      <ul>
        <li>View your legal cases and matters</li>
        <li>Upload and manage documents</li>
        <li>Track case progress in real-time</li>
        <li>Message directly with our team</li>
        <li>Get AI-powered document analysis</li>
        <li>Change your account preferences</li>
      </ul>

      <h3>❓ Need Help?</h3>
      <p>If you have any questions or encounter any issues:</p>
      <ul>
        <li>📧 Email: <a href="mailto:support@plsproservice.com">support@plsproservice.com</a></li>
        <li>💬 Chat: Available in the portal</li>
        <li>📱 Phone: +351 XXX XXX XXX</li>
      </ul>

      <p>Best regards,<br><strong>The PLS Consultants Team</strong></p>

      <div class="footer">
        <p>This is an automated message. Please do not reply to this email.</p>
        <p>&copy; 2026 PLS Consultants. All rights reserved. | <a href="https://plsproservice.com">Visit Website</a></p>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();
  },
};
