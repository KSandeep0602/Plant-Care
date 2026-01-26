import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendReminderEmail(
  to: string,
  plantName: string
) {
  await transporter.sendMail({
    from: `"PlantCare 🌱" <${process.env.EMAIL_USER}>`,
    to,
    subject: "🌱 Plant Care Reminder",
    html: `
      <h2>Plant Reminder</h2>
      <p>Time to take care of your <b>${plantName}</b> 🌿</p>
    `,
  });
}
