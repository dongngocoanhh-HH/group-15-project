// backend/config/emailService.js
const nodemailer = require('nodemailer');

// Tạo transporter cho Gmail SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail', // Hoặc dùng host/port cho SMTP server khác
    auth: {
      user: process.env.EMAIL_USER, // Email của bạn (Gmail)
      pass: process.env.EMAIL_PASSWORD, // App Password (không phải password thường)
    },
  });
};

/**
 * Gửi email reset password
 * @param {string} to - Email người nhận
 * @param {string} resetToken - Token reset password
 * @param {string} userName - Tên người dùng
 */
exports.sendResetPasswordEmail = async (to, resetToken, userName = 'User') => {
  try {
    const transporter = createTransporter();

    // URL frontend để reset password
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Group 15 Project'}" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: '🔐 Reset Password Request - Group 15 Project',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #f9f9f9;
              border-radius: 10px;
              padding: 30px;
              border: 1px solid #ddd;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 10px 10px 0 0;
              margin: -30px -30px 20px -30px;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              margin: 20px 0;
              background-color: #667eea;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              font-weight: bold;
            }
            .button:hover {
              background-color: #5568d3;
            }
            .token-box {
              background-color: #fff;
              border: 2px dashed #667eea;
              border-radius: 5px;
              padding: 15px;
              margin: 15px 0;
              font-family: monospace;
              font-size: 14px;
              word-break: break-all;
            }
            .warning {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 5px;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              font-size: 12px;
              color: #666;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Reset Your Password</h1>
            </div>
            
            <p>Hi <strong>${userName}</strong>,</p>
            
            <p>We received a request to reset your password for your Group 15 Project account.</p>
            
            <p>Click the button below to reset your password:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <div class="token-box">
              ${resetUrl}
            </div>
            
            <div class="warning">
              <strong>⚠️ Important:</strong>
              <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                <li>This link will expire in <strong>10 minutes</strong></li>
                <li>If you didn't request this, please ignore this email</li>
                <li>Your password won't change until you click the link above</li>
              </ul>
            </div>
            
            <p>If the button doesn't work, you can also use this token directly:</p>
            <div class="token-box">
              <strong>Token:</strong> ${resetToken}
            </div>
            
            <div class="footer">
              <p>This is an automated email from Group 15 Project</p>
              <p>If you have any questions, please contact our support team</p>
              <p>&copy; 2025 Group 15 Project. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      // Plain text fallback
      text: `
Hi ${userName},

We received a request to reset your password for your Group 15 Project account.

Please click this link to reset your password:
${resetUrl}

Or use this token: ${resetToken}

⚠️ Important:
- This link will expire in 10 minutes
- If you didn't request this, please ignore this email
- Your password won't change until you use the link above

---
Group 15 Project
      `.trim(),
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw error;
  }
};

/**
 * Gửi email xác nhận đổi password thành công
 */
exports.sendPasswordChangedEmail = async (to, userName = 'User') => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Group 15 Project'}" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: '✅ Password Changed Successfully - Group 15 Project',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #f9f9f9;
              border-radius: 10px;
              padding: 30px;
              border: 1px solid #ddd;
            }
            .header {
              background-color: #28a745;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 10px 10px 0 0;
              margin: -30px -30px 20px -30px;
            }
            .success-icon {
              font-size: 48px;
              margin-bottom: 10px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="success-icon">✅</div>
              <h1>Password Changed Successfully</h1>
            </div>
            
            <p>Hi <strong>${userName}</strong>,</p>
            
            <p>Your password has been changed successfully.</p>
            
            <p>If you made this change, you can safely ignore this email.</p>
            
            <p><strong>If you didn't make this change:</strong></p>
            <ul>
              <li>Your account may have been compromised</li>
              <li>Please contact support immediately</li>
              <li>Change your password again from a secure device</li>
            </ul>
            
            <p>Thank you for using Group 15 Project!</p>
          </div>
        </body>
        </html>
      `,
      text: `
Hi ${userName},

Your password has been changed successfully.

If you made this change, you can safely ignore this email.

If you didn't make this change:
- Your account may have been compromised
- Please contact support immediately
- Change your password again from a secure device

Thank you for using Group 15 Project!
      `.trim(),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password changed notification sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw error;
  }
};

/**
 * Test email configuration
 */
exports.testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email configuration is valid');
    return { success: true, message: 'Email configuration is valid' };
  } catch (error) {
    console.error('❌ Email configuration error:', error);
    return { success: false, message: error.message };
  }
};
