import nodemailer from 'nodemailer';
import { google } from 'googleapis';

// OAuth2 Configuration
const OAuth2 = google.auth.OAuth2;

const createTransporter = async () => {
  const oauth2Client = new OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN,
  });

  try {
    const accessToken = await oauth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.GMAIL_USER,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });

    return transporter;
  } catch (error) {
    console.error('Error creating email transporter:', error);
    throw error;
  }
};

// Initialize transporter
let transporter;
createTransporter()
  .then((t) => {
    transporter = t;
    console.log('Email server is ready to send messages');
  })
  .catch((error) => {
    console.error('Email transporter initialization failed:', error);
  });

// Helper function to send email
const sendEmail = async (options) => {
  try {
    // Ensure transporter is initialized
    if (!transporter) {
      transporter = await createTransporter();
    }

    const mailOptions = {
      from: options.from || `"${process.env.EMAIL_FROM_NAME || 'Store2Door'}" <${process.env.EMAIL_FROM || 'noreply@store2doordelivery.co.za'}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Template for order confirmation email
const sendOrderConfirmationEmail = async (order, customerEmail, customerName) => {
  const subject = `Order Confirmation - #${order.orderNumber}`;
  const total = order.total || order.totalAmount || 0;
  
  // Format items table
  let itemsHtml = '';
  if (order.items && order.items.length > 0) {
    itemsHtml = `
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th style="padding: 10px; border-bottom: 1px solid #ddd; text-align: left;">Item</th>
            <th style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">Qty</th>
            <th style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map(item => `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                ${item.name}
                ${item.selectedVariant ? `<br><small style="color: #666;">Variant: ${item.selectedVariant.value}</small>` : ''}
              </td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">R ${item.totalPrice.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Subtotal:</td>
            <td style="padding: 10px; text-align: right;">R ${order.subtotal.toFixed(2)}</td>
          </tr>
          ${order.deliveryFee ? `
          <tr>
            <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Delivery Fee:</td>
            <td style="padding: 10px; text-align: right;">R ${order.deliveryFee.toFixed(2)}</td>
          </tr>` : ''}
          ${order.tip ? `
          <tr>
            <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Tip:</td>
            <td style="padding: 10px; text-align: right;">R ${order.tip.toFixed(2)}</td>
          </tr>` : ''}
          ${order.discount ? `
          <tr>
            <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold; color: #d32f2f;">Discount:</td>
            <td style="padding: 10px; text-align: right; color: #d32f2f;">- R ${order.discount.toFixed(2)}</td>
          </tr>` : ''}
          <tr style="background-color: #f9f9f9;">
            <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold; font-size: 16px;">Total:</td>
            <td style="padding: 10px; text-align: right; font-weight: bold; font-size: 16px; color: rgb(49, 134, 22);">R ${total.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
    `;
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: rgb(49, 134, 22); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Store2Door</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #333;">Order Confirmation</h2>
        <p>Dear ${customerName},</p>
        <p>Thank you for your order! Your payment was successful and your order has been placed.</p>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Order Details:</h3>
          <p><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p><strong>Status:</strong> ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</p>
          
          ${itemsHtml}
        </div>

        <p>You can track your order status in the app. We'll send you another update when your order is out for delivery.</p>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL}/orders" style="background-color: rgb(49, 134, 22); color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">View Your Orders</a>
        </div>
      </div>
      <div style="background-color: #f1f1f1; padding: 20px; text-align: center; font-size: 12px; color: #666;">
        <p>&copy; ${new Date().getFullYear()} Store2Door Delivery. All rights reserved.</p>
        <p>Need help? Contact us at support@store2doordelivery.co.za</p>
      </div>
    </div>
  `;
  
  return await sendEmail({
    to: customerEmail,
    subject,
    html,
  });
};

// Template for order status update email
const sendOrderStatusEmail = async (order, customerEmail, customerName, newStatus) => {
  const subject = `Order Update - #${order.orderNumber}`;
  const statusDisplay = newStatus.replace(/_/g, ' ').charAt(0).toUpperCase() + newStatus.replace(/_/g, ' ').slice(1);
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: rgb(49, 134, 22); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Store2Door</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #333;">Order Status Update</h2>
        <p>Dear ${customerName},</p>
        <p>Your order status has been updated to <strong>${statusDisplay}</strong>.</p>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Order Summary:</h3>
          <p><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p><strong>New Status:</strong> ${statusDisplay}</p>
        </div>

        <p>Thank you for choosing Store2Door!</p>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL}/orders/${order._id}" style="background-color: rgb(49, 134, 22); color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Track Order</a>
        </div>
      </div>
      <div style="background-color: #f1f1f1; padding: 20px; text-align: center; font-size: 12px; color: #666;">
        <p>&copy; ${new Date().getFullYear()} Store2Door Delivery. All rights reserved.</p>
      </div>
    </div>
  `;
  
  return await sendEmail({
    to: customerEmail,
    subject,
    html,
  });
};

// Template for password reset email
const sendPasswordResetEmail = async (email, resetToken, userName) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  const subject = 'Password Reset Request';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Reset Request</h2>
      <p>Dear ${userName},</p>
      <p>You requested to reset your password. Click the button below to reset it:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
      </div>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all;">${resetUrl}</p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    </div>
  `;
  
  return await sendEmail({
    to: email,
    subject,
    html,
  });
};

// Template for welcome email
const sendWelcomeEmail = async (email, userName) => {
  const subject = 'Welcome to Store2Door!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to Store2Door!</h2>
      <p>Dear ${userName},</p>
      <p>Thank you for joining Store2Door. We're excited to have you on board!</p>
      <p>Start exploring our wide range of products and enjoy convenient delivery right to your door.</p>
      <p>If you have any questions, feel free to reach out to our support team at support@store2doordelivery.co.za.</p>
      <p>Happy shopping!</p>
      <p>The Store2Door Team</p>
    </div>
  `;
  
  return await sendEmail({
    to: email,
    subject,
    html,
  });
};

export {
  createTransporter,
  sendEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
};
