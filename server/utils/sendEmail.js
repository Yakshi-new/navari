const nodemailer = require('nodemailer');

/**
 * sendEmail utility
 * Sends mail via SMTP if configured in process.env,
 * otherwise logs the email content to the console for local development/testing.
 */
const sendEmail = async (options) => {
  const isSmtpConfigured =
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS;

  if (isSmtpConfigured) {
    // Create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const message = {
      from: `"${process.env.FROM_NAME || 'Navari Support'}" <${process.env.FROM_EMAIL || 'support@navari.com'}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html || undefined,
    };

    const info = await transporter.sendMail(message);
    console.log(`Email sent successfully: ${info.messageId}`);
    return info;
  } else {
    // Fallback: print to console for development testing
    console.log('\n=================== MOCK EMAIL SENDER ===================');
    console.log(`To:      ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message:\n${options.message}`);
    console.log('=========================================================\n');

    // Also write to a file in the workspace for easy retrieval
    const fs = require('fs');
    const path = require('path');
    const logPath = path.join(__dirname, '..', 'email-debug.log');
    const logContent = `\nTo: ${options.email}\nSubject: ${options.subject}\nMessage:\n${options.message}\n=========================================\n`;
    fs.appendFileSync(logPath, logContent, 'utf8');

    return { mockSent: true };
  }
};

module.exports = sendEmail;
