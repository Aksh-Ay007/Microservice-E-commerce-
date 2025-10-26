import nodemailer from "nodemailer";
import dotenv from 'dotenv';
import ejs from 'ejs';
import path from 'path';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  service: process.env.SMTP_SERVICE,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Render an ejs mail template
const renderEmailTemplate = async (templateName: string, data: Record<string, any>): Promise<string> => {
  const templatePath = path.join(
    process.cwd(),
    "apps",
    "seller-service", // <-- fixed folder name
    "src",
    "utils",
    "email-templates",
    `${templateName}.ejs`
  );
  return await ejs.renderFile(templatePath, data);
}

// Send an email using nodemailer
export const sendEmail = async (to: string, subject: string, templateName: string, data: Record<string, any>) => {
  try {
    const html = await renderEmailTemplate(templateName, data);

    const mailOptions = {
      from: process.env.SMTP_USER,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);

    console.log(`Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    return false;
  }
}
