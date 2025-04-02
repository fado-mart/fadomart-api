export const generateEmailTemplate = (content) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                background-color: #f8f9fa;
                padding: 20px;
                text-align: center;
                border-radius: 5px;
                margin-bottom: 20px;
            }
            .content {
                background-color: #ffffff;
                padding: 20px;
                border-radius: 5px;
                border: 1px solid #dee2e6;
            }
            .footer {
                text-align: center;
                margin-top: 20px;
                font-size: 12px;
                color: #6c757d;
            }
            .button {
                display: inline-block;
                padding: 10px 20px;
                background-color: #007bff;
                color: #ffffff;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>FADOMART</h1>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p>This is an automated message, please do not reply to this email.</p>
        </div>
    </body>
    </html>
    `;
};

export const generateVerificationEmail = (userName, token) => {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    return generateEmailTemplate(`
        <h2>Email Verification</h2>
        <p>Dear ${userName},</p>
        <p>Thank you for registering with FADOMART. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verify Email</a>
        </div>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p>${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account with FADOMART, please ignore this email.</p>
    `);
};

export const generatePasswordResetEmail = (userName, token) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    return generateEmailTemplate(`
        <h2>Password Reset Request</h2>
        <p>Dear ${userName},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
        </div>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p>${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
    `);
};

export const generatePasswordResetConfirmation = (userName) => {
    return generateEmailTemplate(`
        <h2>Password Reset Successful</h2>
        <p>Dear ${userName},</p>
        <p>Your password has been successfully reset. You can now log in with your new password.</p>
        <p>If you didn't make this change, please contact our support team immediately.</p>
    `);
};

export const orderConfirmationTemplate = (order) => `
    <h1>Order Confirmation</h1>
    <p>Dear User,</p>
    <p>Your order has been placed successfully.</p>
    <p>Order ID: ${order._id}</p>
    <p>Total Price: GHS ${order.totalPrice}</p>
    <p>Thank you for shopping with us!</p>
`;

export const orderStatusUpdateTemplate = (order) => `
    <h1>Order Status Update</h1>
    <p>Dear User,</p>
    <p>Your order status has been updated to: ${order.status}.</p>
    <p>Order ID: ${order._id}</p>
    <p>Thank you for your patience!</p>
`; 