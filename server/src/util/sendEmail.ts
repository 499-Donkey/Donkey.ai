// utils/sendEmail.ts

import nodemailer from 'nodemailer';

interface EmailOptions {
    email: string;  // 接收者的邮件地址
    subject: string;  // 邮件主题
    message: string;  // 邮件正文
}

const sendEmail = async (options: EmailOptions) => {
    // 确保环境变量已经被定义，否则抛出错误
    if (!process.env.SMTP_HOST) throw new Error("SMTP_HOST is not defined");
    if (!process.env.SMTP_PORT) throw new Error("SMTP_PORT is not defined");
    if (!process.env.SMTP_USER) throw new Error("SMTP_USER is not defined");
    if (!process.env.SMTP_PASSWORD) throw new Error("SMTP_PASSWORD is not defined");
    if (!process.env.EMAIL_FROM) throw new Error("EMAIL_FROM is not defined");

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10),
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_FROM,  // 使用环境变量定义的发件人地址
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: `<b>${options.message}</b>`  // HTML 版本的邮件内容
    };

    try {
        const result = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', result.messageId);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error sending email:', error.message);
            return { success: false, error: error.message };
        } else {
            console.error('Error sending email:', error);
            return { success: false, error: "An unknown error occurred" };
        }
    }
};

export default sendEmail;
