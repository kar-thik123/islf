const nodemailer = require('nodemailer');
const pool = require('./db');

async function sendEmail(to, subject, text) {
    // Fetch SMTP settings from database
    const settingsResult = await pool.query("SELECT key, value FROM settings WHERE key IN ('smtp_host', 'smtp_port', 'smtp_username', 'smtp_password', 'from_email', 'from_name')");
    const settings = {};
    settingsResult.rows.forEach(row => settings[row.key] = row.value);

    const transporter = nodemailer.createTransport({
        host: settings.smtp_host || 'smtp.gmail.com',
        port: parseInt(settings.smtp_port || '587', 10),
        secure: settings.smtp_port === '465', // true for 465, false for other ports
        auth: {
            user: settings.smtp_username || 'dtactics.dt@gmail.com',
            pass: settings.smtp_password || 'pudk tazn vcxc dgaa'
        }
    });

    const mailOptions = {
        from: `"${settings.from_name || 'ISLF Logistics'}" <${settings.from_email || 'dtactics.dt@gmail.com'}>`,
        to,
        subject,
        text
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

module.exports = { sendEmail };