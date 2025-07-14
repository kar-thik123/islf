const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'dtactics.dt@gmail.com',
        pass: 'pudk tazn vcxc dgaa' // Use an app password, not your real password!
    }
});

async function sendEmail(to, subject, text) {
    const mailOptions = {
        from: 'dtactics.dt@gmail.com',
        to,
        subject,
        text
    };
    return transporter.sendMail(mailOptions);
}

module.exports = { sendEmail }; 