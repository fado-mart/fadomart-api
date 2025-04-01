import nodemailer from 'nodemailer';
import { generatePasswordResetEmail, generatePasswordResetConfirmation } from './templates.js';

// Create reusable transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Verify transporter configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('SMTP connection error:', error);
    } else {
        console.log('SMTP server is ready to send emails');
    }
});

const sendEmail = async (to, subject, html) => {
    try {
        const mailOptions = {
            from: `"FADOMART" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
};

export const sendPasswordResetEmail = async (userName, email, token) => {
    const subject = 'Reset Your Password - FADOMART';
    const html = generatePasswordResetEmail(userName, token);
    return sendEmail(email, subject, html);
};

export const sendPasswordResetConfirmation = async (userName, email) => {
    const subject = 'Password Reset Successful - FADOMART';
    const html = generatePasswordResetConfirmation(userName);
    return sendEmail(email, subject, html);
}; 