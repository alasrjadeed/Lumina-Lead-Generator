import nodemailer from "nodemailer";

class EmailService {
  constructor() {
    this.transporter = null;
  }

  _createTransporter() {
    if (this.transporter) return this.transporter;

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    return this.transporter;
  }

  async sendOTP(email, otp) {
    const transporter = this._createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: email,
      subject: "Your Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #333;">Verification Code</h2>
          <p style="color: #555; font-size: 16px;">Use the code below to verify your account:</p>
          <div style="background: #f4f4f4; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #333;">${otp}</span>
          </div>
          <p style="color: #999; font-size: 13px;">This code expires in 10 minutes. If you didn't request this, please ignore this email.</p>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`[Email] OTP sent to ${email}, messageId: ${result.messageId}`);
    return result;
  }

  async sendLeadEmail(lead, emailContent, business) {
    const transporter = this._createTransporter();

    const mailOptions = {
      from: `"${business?.name || process.env.BUSINESS_NAME || "Team"}" <${business?.email || process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
      to: lead.email,
      subject: emailContent.subject || "Hello from " + (business?.name || "Our Team"),
      html: emailContent.html || emailContent.body || emailContent.text,
      text: emailContent.text || "",
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`[Email] Lead email sent to ${lead.email}, messageId: ${result.messageId}`);
    return result;
  }

  async sendBulkEmails(recipients, template) {
    const transporter = this._createTransporter();
    const results = [];
    const batchSize = 50;

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);

      const promises = batch.map(async (recipient) => {
        try {
          const personalizedHtml = (template.html || template.body || "").replace(
            /{{name}}/g,
            recipient.name || ""
          );

          const mailOptions = {
            from: `"${process.env.BUSINESS_NAME || "Team"}" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
            to: recipient.email,
            subject: template.subject,
            html: personalizedHtml,
            text: template.text || "",
          };

          const result = await transporter.sendMail(mailOptions);
          return { email: recipient.email, success: true, messageId: result.messageId };
        } catch (error) {
          console.error(`[Email] Bulk send failed for ${recipient.email}:`, error.message);
          return { email: recipient.email, success: false, error: error.message };
        }
      });

      const batchResults = await Promise.all(promises);
      results.push(...batchResults);
    }

    const sent = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;
    console.log(`[Email] Bulk send complete: ${sent} sent, ${failed} failed`);

    return { total: recipients.length, sent, failed, results };
  }
}

export default new EmailService();
