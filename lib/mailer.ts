import nodemailer from 'nodemailer';

export async function sendOTP(email: string, code: string) {
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'localhost',
    port: Number(process.env.SMTP_PORT) || 1025,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  const info = await transport.sendMail({
    from: process.env.EMAIL_FROM || 'PlantCare <no-reply@plantcare.local>',
    to: email,
    subject: 'Your PlantCare verification code',
    text: `Your code is ${code}. It expires in 10 minutes.`,
  });
  console.log('OTP email queued:', info.messageId, 'code:', code);
}