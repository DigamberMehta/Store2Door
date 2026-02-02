import nodemailer from "nodemailer";
import { google } from "googleapis";

// OAuth2 Configuration
const OAuth2 = google.auth.OAuth2;

const createTransporter = async () => {
  // Validate required environment variables
  const requiredEnvVars = [
    "GMAIL_CLIENT_ID",
    "GMAIL_CLIENT_SECRET",
    "GMAIL_REDIRECT_URI",
    "GMAIL_REFRESH_TOKEN",
    "GMAIL_USER",
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName],
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required email environment variables: ${missingVars.join(", ")}`,
    );
  }

  const oauth2Client = new OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI,
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN,
  });

  try {
    const accessToken = await oauth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.GMAIL_USER,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });

    return transporter;
  } catch (error) {
    console.error("Error creating email transporter:", error);
    throw error;
  }
};

// Initialize transporter - LAZY INITIALIZATION
// Don't create transporter immediately, wait for first email send
let transporter = null;
let initializationPromise = null;

// Function to ensure transporter is initialized
const ensureTransporter = async () => {
  if (transporter) {
    return transporter;
  }

  // If already initializing, wait for that promise
  if (initializationPromise) {
    return initializationPromise;
  }

  // Start initialization
  initializationPromise = createTransporter()
    .then((t) => {
      transporter = t;
      console.log("✅ Email server is ready to send messages");
      return t;
    })
    .catch((error) => {
      console.error(
        "❌ Email transporter initialization failed:",
        error.message,
      );
      initializationPromise = null; // Allow retry
      throw error;
    });

  return initializationPromise;
};

// Helper function to send email
const sendEmail = async (options) => {
  try {
    // Ensure transporter is initialized
    const emailTransporter = await ensureTransporter();

    const mailOptions = {
      from:
        options.from ||
        `"${process.env.EMAIL_FROM_NAME || "Store2Door"}" <${process.env.EMAIL_FROM || "noreply@store2doordelivery.co.za"}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments,
    };

    const info = await emailTransporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return { success: false, error: error.message };
  }
};

// Template for order confirmation email
const sendOrderConfirmationEmail = async (
  order,
  customerEmail,
  customerName,
) => {
  const subject = `Order Confirmation - #${order.orderNumber}`;
  const total = order.total || order.totalAmount || 0;

  // Format items table
  let itemsHtml = "";
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
          ${order.items
            .map(
              (item) => `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                ${item.name}
                ${item.selectedVariant && item.selectedVariant.value ? `<br><small style="color: #666;">Variant: ${item.selectedVariant.value}</small>` : ""}
              </td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">R ${item.totalPrice.toFixed(2)}</td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Subtotal:</td>
            <td style="padding: 10px; text-align: right;">R ${order.subtotal.toFixed(2)}</td>
          </tr>
          ${
            order.deliveryFee
              ? `
          <tr>
            <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Delivery Fee:</td>
            <td style="padding: 10px; text-align: right;">R ${order.deliveryFee.toFixed(2)}</td>
          </tr>`
              : ""
          }
          ${
            order.tip
              ? `
          <tr>
            <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Tip:</td>
            <td style="padding: 10px; text-align: right;">R ${order.tip.toFixed(2)}</td>
          </tr>`
              : ""
          }
          ${
            order.discount
              ? `
          <tr>
            <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold; color: #d32f2f;">Discount:</td>
            <td style="padding: 10px; text-align: right; color: #d32f2f;">- R ${order.discount.toFixed(2)}</td>
          </tr>`
              : ""
          }
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
const sendOrderStatusEmail = async (
  order,
  customerEmail,
  customerName,
  newStatus,
) => {
  const subject = `Order Update - #${order.orderNumber}`;
  const statusDisplay =
    newStatus.replace(/_/g, " ").charAt(0).toUpperCase() +
    newStatus.replace(/_/g, " ").slice(1);
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
  const subject = "Password Reset Request - Store2Door";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0;">
      <div style="background-color: rgb(49, 134, 22); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Store2Door</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Dear ${userName},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: rgb(49, 134, 22); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 16px;">Reset Password</a>
        </div>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; border-left: 4px solid rgb(49, 134, 22); margin: 20px 0;">
          <p style="margin: 5px 0; font-size: 14px;"><strong>Security Information:</strong></p>
          <ul style="margin: 10px 0; padding-left: 20px; font-size: 14px;">
            <li>This link will expire in <strong>1 hour</strong></li>
            <li>If you didn't request this, please ignore this email</li>
            <li>Your password won't change until you create a new one</li>
          </ul>
        </div>
        <p style="font-size: 14px; color: #666;">Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; font-size: 12px; color: #0066cc; background-color: #f5f5f5; padding: 10px; border-radius: 4px;">${resetUrl}</p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
        <p style="font-size: 13px; color: #888;">Need help? Contact us at <a href="mailto:support@store2doordelivery.co.za" style="color: rgb(49, 134, 22);">support@store2doordelivery.co.za</a></p>
      </div>
      <div style="background-color: #f1f1f1; padding: 20px; text-align: center; font-size: 12px; color: #666;">
        <p>&copy; ${new Date().getFullYear()} Store2Door Delivery. All rights reserved.</p>
        <p>This is an automated message, please do not reply to this email.</p>
      </div>
    </div>
  `;

  return await sendEmail({
    from: `"Store2Door Support" <support@store2doordelivery.co.za>`,
    to: email,
    subject,
    html,
  });
};

// Template for welcome email
const sendWelcomeEmail = async (email, userName) => {
  const subject = "Welcome to Store2Door!";
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

// Template for support ticket/contact us email
const sendSupportTicketEmail = async (ticketData) => {
  const { userName, userEmail, orderNumber, productName, issue, imageUrl } =
    ticketData;

  const subject = `Support Ticket - ${orderNumber ? `Order #${orderNumber}` : "General Inquiry"} from ${userName}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: rgb(49, 134, 22); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Store2Door Support</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #333; margin-top: 0;">New Support Ticket</h2>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Customer Information:</h3>
          <p style="margin: 5px 0;"><strong>Name:</strong> ${userName}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${userEmail}" style="color: rgb(49, 134, 22);">${userEmail}</a></p>
        </div>

        ${
          orderNumber
            ? `
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Order Details:</h3>
          <p style="margin: 5px 0;"><strong>Order Number:</strong> ${orderNumber}</p>
          ${productName ? `<p style="margin: 5px 0;"><strong>Product:</strong> ${productName}</p>` : ""}
        </div>
        `
            : ""
        }

        <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Issue Description:</h3>
          <p style="margin: 0; white-space: pre-wrap; color: #333;">${issue}</p>
        </div>

        ${
          imageUrl
            ? `
        <div style="margin: 20px 0;">
          <h3 style="color: #333;">Attached Image:</h3>
          <img src="${imageUrl}" alt="Issue" style="max-width: 100%; border-radius: 8px; border: 1px solid #ddd;" />
        </div>
        `
            : ""
        }

        <div style="background-color: #f1f1f1; padding: 15px; border-radius: 6px; margin-top: 20px;">
          <p style="margin: 0; font-size: 14px; color: #666;">
            <strong>Action Required:</strong> Please respond to this customer inquiry as soon as possible.
          </p>
        </div>
      </div>
      <div style="background-color: #f1f1f1; padding: 20px; text-align: center; font-size: 12px; color: #666;">
        <p>&copy; ${new Date().getFullYear()} Store2Door Delivery. All rights reserved.</p>
        <p>This is an automated support ticket notification.</p>
      </div>
    </div>
  `;

  return await sendEmail({
    from: `"Store2Door Support" <support@store2doordelivery.co.za>`,
    to: "support@store2doordelivery.co.za",
    replyTo: userEmail,
    subject,
    html,
  });
};

// Template for support ticket confirmation email to customer
const sendSupportTicketConfirmationEmail = async (ticketData) => {
  const { userName, userEmail, ticketNumber, orderNumber, productName, issue } =
    ticketData;

  const subject = `Support Ticket Created - ${ticketNumber}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: rgb(49, 134, 22); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Store2Door Support</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #333; margin-top: 0;">Ticket Created Successfully</h2>
        <p>Dear ${userName},</p>
        <p>Thank you for contacting Store2Door support. We have received your support request and created a ticket for you.</p>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Ticket Details:</h3>
          <p style="margin: 5px 0;"><strong>Ticket Number:</strong> <span style="color: rgb(49, 134, 22); font-family: monospace; font-weight: bold;">${ticketNumber}</span></p>
          ${orderNumber ? `<p style="margin: 5px 0;"><strong>Order Number:</strong> ${orderNumber}</p>` : ""}
          ${productName ? `<p style="margin: 5px 0;"><strong>Product:</strong> ${productName}</p>` : ""}
          <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #ff9800;">Open</span></p>
        </div>

        <div style="background-color: #e8f5e9; padding: 15px; border-radius: 6px; border-left: 4px solid #4caf50; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #2e7d32;">
            <strong>What's next?</strong> Our support team will review your ticket and get back to you within 24 hours. Please keep your ticket number for reference.
          </p>
        </div>

        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #2196f3;">
          <p style="margin: 5px 0; font-size: 13px; color: #333;"><strong>Your Issue:</strong></p>
          <p style="margin: 5px 0; white-space: pre-wrap; font-size: 13px; color: #666;">${issue}</p>
        </div>

        <div style="background-color: #fff3e0; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ff9800;">
          <p style="margin: 0; font-size: 13px; color: #e65100;">
            <strong>Important:</strong> Please keep this email for your records. Use your ticket number when following up on this issue.
          </p>
        </div>

        <p style="font-size: 13px; color: #666; margin-top: 20px;">
          If you have any additional information to add, please reply to this email with your ticket number.
        </p>
      </div>
      <div style="background-color: #f1f1f1; padding: 20px; text-align: center; font-size: 12px; color: #666;">
        <p style="margin: 5px 0;">&copy; ${new Date().getFullYear()} Store2Door Delivery. All rights reserved.</p>
        <p style="margin: 5px 0;">For urgent matters, contact us at <a href="mailto:support@store2doordelivery.co.za" style="color: rgb(49, 134, 22);">support@store2doordelivery.co.za</a></p>
      </div>
    </div>
  `;

  return await sendEmail({
    from: `"Store2Door Support" <support@store2doordelivery.co.za>`,
    to: userEmail,
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
  sendSupportTicketEmail,
  sendSupportTicketConfirmationEmail,
};
